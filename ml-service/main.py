from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Stylify ML Service")

# -------------------------------------------------------------------
# Model: unitary/multilingual-toxic-xlm-roberta
# Obsługuje język polski, wykrywa: toxic, severe_toxic, obscene,
# threat, insult, identity_hate
# Pobierany raz przy starcie, cache w volumie Docker
# -------------------------------------------------------------------
logger.info("Ładowanie modelu... (pierwsze uruchomienie może potrwać kilka minut)")

classifier = pipeline(
    "text-classification",
    model="unitary/multilingual-toxic-xlm-roberta",
    top_k=None  # zwraca wszystkie etykiety z confidence
)

logger.info("Model załadowany pomyślnie!")


# -------------------------------------------------------------------
# Schematy requestu / response
# -------------------------------------------------------------------
class ClassifyRequest(BaseModel):
    message: str
    user_id: str | None = None      # opcjonalnie, do logowania


class LabelScore(BaseModel):
    label: str
    score: float


class ClassifyResponse(BaseModel):
    message: str
    is_flagged: bool                 # True jeśli cokolwiek przekracza próg
    flag_reason: str | None          # główna etykieta która przekroczyła próg
    confidence: float | None         # jej confidence
    all_labels: list[LabelScore]     # wszystkie etykiety z wynikami


# -------------------------------------------------------------------
# Próg powyżej którego wiadomość jest flagowana
# -------------------------------------------------------------------
THRESHOLD = 0.5


@app.get("/")
def root():
    return {"status": "ok", "service": "Stylify ML Service"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/classify", response_model=ClassifyResponse)
def classify(request: ClassifyRequest):
    logger.info(f"Klasyfikacja wiadomości: '{request.message[:50]}...' (user: {request.user_id})")

    # Wywołanie modelu
    results = classifier(request.message)
    # results = [[{"label": "toxic", "score": 0.98}, ...]]
    labels = results[0]

    all_labels = [LabelScore(label=l["label"], score=round(l["score"], 4)) for l in labels]

    # Sprawdź czy jakikolwiek label przekracza próg
    flagged_labels = [l for l in labels if l["score"] >= THRESHOLD]
    flagged_labels.sort(key=lambda x: x["score"], reverse=True)

    is_flagged = len(flagged_labels) > 0
    flag_reason = flagged_labels[0]["label"] if is_flagged else None
    confidence = round(flagged_labels[0]["score"], 4) if is_flagged else None

    logger.info(f"Wynik: is_flagged={is_flagged}, reason={flag_reason}, confidence={confidence}")

    return ClassifyResponse(
        message=request.message,
        is_flagged=is_flagged,
        flag_reason=flag_reason,
        confidence=confidence,
        all_labels=all_labels
    )


@app.post("/classify/batch")
def classify_batch(requests: list[ClassifyRequest]):
    """Klasyfikacja wielu wiadomości naraz (np. do testów)"""
    return [classify(r) for r in requests]
