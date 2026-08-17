import os
import logging

from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

from presidio_detector import analyze as presidio_analyze, get_analyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Stylify ML Service")

# ---------------------------------------------------------------------------
# Presidio (Podejście B) — inicjalizacja przy starcie
# ---------------------------------------------------------------------------
logger.info("Inicjalizacja Presidio...")
get_analyzer()
logger.info("Presidio gotowy.")

# ---------------------------------------------------------------------------
# XLM-RoBERTa — toksyczność (pozostawiony jako fallback / backup)
# ---------------------------------------------------------------------------
logger.info("Ładowanie XLM-RoBERTa (toxic)...")
toxic_classifier = pipeline(
    "text-classification",
    model="unitary/multilingual-toxic-xlm-roberta",
    top_k=None,
)
logger.info("XLM-RoBERTa gotowy.")

# ---------------------------------------------------------------------------
# Fine-tuned HerBERT (Podejście C) — 4 klasy: bypass / fraud / toxic / benign
# ---------------------------------------------------------------------------
HERBERT_MODEL_PATH = "/app/models/herbert-finetuned"
HERBERT_LABELS = ["bypass", "fraud", "toxic", "benign"]
HERBERT_BLOCK_THRESHOLD = 0.75

herbert_pipeline = None


def _load_herbert():
    global herbert_pipeline
    if not os.path.isdir(HERBERT_MODEL_PATH):
        logger.warning(
            f"[HerBERT] Model nie znaleziony w {HERBERT_MODEL_PATH}. "
            "Wgraj model i zrestartuj serwis."
        )
        return
    try:
        logger.info(f"[HerBERT] Ładowanie modelu z {HERBERT_MODEL_PATH}...")
        tokenizer = AutoTokenizer.from_pretrained(HERBERT_MODEL_PATH)
        model = AutoModelForSequenceClassification.from_pretrained(HERBERT_MODEL_PATH)
        herbert_pipeline = pipeline(
            "text-classification",
            model=model,
            tokenizer=tokenizer,
            top_k=None,
            device=-1,
        )
        logger.info("[HerBERT] Model załadowany pomyślnie.")
    except Exception as exc:
        logger.error(f"[HerBERT] Błąd ładowania modelu: {exc}")


_load_herbert()


# ---------------------------------------------------------------------------
# Schematy
# ---------------------------------------------------------------------------
class ClassifyRequest(BaseModel):
    message: str
    user_id: str | None = None


class LabelScore(BaseModel):
    label: str
    score: float


class ClassifyResponse(BaseModel):
    message: str
    is_flagged: bool
    flag_reason: str | None
    confidence: float | None
    all_labels: list[LabelScore]


class HerbertResponse(BaseModel):
    label: str          # bypass | fraud | toxic | benign
    action: str         # block | warn | allow
    confidence: float
    all_labels: list[LabelScore]
    available: bool     # False jeśli model nie jest wdrożony


class PresidioEntity(BaseModel):
    type: str
    label: str
    value: str
    confidence: float
    start: int
    end: int


class PresidioResponse(BaseModel):
    message: str
    action: str
    label: str
    confidence: float
    entities: list[PresidioEntity]


# ---------------------------------------------------------------------------
# Endpointy
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    return {"status": "ok", "service": "Stylify ML Service"}


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "herbert_available": herbert_pipeline is not None,
    }


# --- Podejście C (fine-tuned HerBERT, 4 klasy) ---
@app.post("/classify/herbert", response_model=HerbertResponse)
def classify_herbert(request: ClassifyRequest):
    if herbert_pipeline is None:
        return HerbertResponse(
            label="benign",
            action="allow",
            confidence=0.0,
            all_labels=[],
            available=False,
        )

    results = herbert_pipeline(request.message)
    labels = results[0]
    all_labels = [LabelScore(label=l["label"], score=round(l["score"], 4)) for l in labels]

    top = max(labels, key=lambda x: x["score"])
    label = top["label"]
    confidence = round(top["score"], 4)

    if label == "benign":
        action = "allow"
    elif confidence >= HERBERT_BLOCK_THRESHOLD:
        action = "block"
    else:
        action = "warn"

    logger.info(f"[HerBERT] label={label}, action={action}, conf={confidence}")
    return HerbertResponse(
        label=label,
        action=action,
        confidence=confidence,
        all_labels=all_labels,
        available=True,
    )


# --- Podejście B (Presidio) ---
@app.post("/classify/presidio", response_model=PresidioResponse)
def classify_presidio(request: ClassifyRequest):
    logger.info(f"[Presidio] Analiza: '{request.message}'")
    result = presidio_analyze(request.message)
    logger.info(f"[Presidio] action={result.action}, label={result.label}, conf={result.confidence}")
    return PresidioResponse(
        message=request.message,
        action=result.action,
        label=result.label,
        confidence=result.confidence,
        entities=[
            PresidioEntity(
                type=e.type,
                label=e.label,
                value=e.value,
                confidence=e.confidence,
                start=e.start,
                end=e.end,
            )
            for e in result.entities
        ],
    )


# --- XLM-RoBERTa toxic (backward compat / backup) ---
TOXIC_THRESHOLD = 0.5

@app.post("/classify", response_model=ClassifyResponse)
def classify(request: ClassifyRequest):
    results = toxic_classifier(request.message)
    labels = results[0]
    all_labels = [LabelScore(label=l["label"], score=round(l["score"], 4)) for l in labels]
    flagged = [l for l in labels if l["score"] >= TOXIC_THRESHOLD]
    flagged.sort(key=lambda x: x["score"], reverse=True)
    is_flagged = len(flagged) > 0
    return ClassifyResponse(
        message=request.message,
        is_flagged=is_flagged,
        flag_reason=flagged[0]["label"] if is_flagged else None,
        confidence=round(flagged[0]["score"], 4) if is_flagged else None,
        all_labels=all_labels,
    )


@app.post("/classify/presidio/batch")
def classify_presidio_batch(requests: list[ClassifyRequest]):
    return [classify_presidio(r) for r in requests]
