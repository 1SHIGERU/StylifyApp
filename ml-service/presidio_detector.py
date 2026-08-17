"""
Podejście B: Microsoft Presidio + Custom Regex

Wykrywa PII (dane osobowe) i próby obejścia platformy w polskojęzycznym czacie.
Używane do porównania z systemem regułowym (A) i HerBERT (C) w rozdziale 4 pracy.

Kategorie wynikowe (zgodne z taksonomią z rozdziału 2):
    personal_data_request  — numery telefonów, adresy e-mail
    payment_scam           — numery IBAN, kody BLIK, karty płatnicze, zaliczki, phishing
    platform_bypass        — social media handles, frazy o kontakcie poza platformą
    toxic_content          — wulgaryzmy, groźby, mowa nienawiści
    benign                 — brak wykrytych zagrożeń
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from presidio_analyzer import (
    AnalyzerEngine,
    Pattern,
    PatternRecognizer,
    RecognizerRegistry,
)
from presidio_analyzer.nlp_engine import NlpEngineProvider

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Progi decyzyjne
# ---------------------------------------------------------------------------
BLOCK_THRESHOLD = 0.75  # >= próg + encja blokująca → block
WARN_THRESHOLD = 0.50  # >= próg → warn

# Encje, które przy wysokim confidence skutkują twardym blokiem
BLOCK_ENTITIES = {
    "PHONE_NUMBER",
    "EMAIL_ADDRESS",
    "IBAN_CODE",
    "CREDIT_CARD",
    "ADVANCE_PAYMENT",
    "BLIK_REQUEST",
    "PHISHING_LINK",
    "SOCIAL_MEDIA_HANDLE",
    "BYPASS_PHRASE",
}

# Mapowanie encji Presidio → kategoria pracy
ENTITY_TO_LABEL: dict[str, str] = {
    "PHONE_NUMBER": "personal_data_request",
    "EMAIL_ADDRESS": "personal_data_request",
    "IBAN_CODE": "payment_scam",
    "CREDIT_CARD": "payment_scam",
    "BLIK_CODE": "payment_scam",
    "BLIK_REQUEST": "payment_scam",
    "ADVANCE_PAYMENT": "payment_scam",
    "PHISHING_LINK": "payment_scam",
    "SOCIAL_MEDIA_HANDLE": "platform_bypass",
    "BYPASS_PHRASE": "platform_bypass",
    "TOXIC_CONTENT": "toxic_content",
}


# ---------------------------------------------------------------------------
# Budowanie analizatora (wywoływane raz przy starcie serwisu)
# ---------------------------------------------------------------------------


def _build_analyzer() -> AnalyzerEngine:
    """Konfiguruje Presidio z polskim modelem spacy i niestandardowymi rozpoznawaczami."""
    nlp_config = {
        "nlp_engine_name": "spacy",
        "models": [{"lang_code": "pl", "model_name": "pl_core_news_sm"}],
    }
    nlp_engine = NlpEngineProvider(nlp_configuration=nlp_config).create_engine()

    registry = RecognizerRegistry()
    registry.supported_languages = ["pl"]

    # 1. Polskie numery telefonów
    registry.add_recognizer(
        PatternRecognizer(
            supported_entity="PHONE_NUMBER",
            supported_language="pl",
            patterns=[
                Pattern(
                    "pl_intl", r"\+48[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{3}", score=0.95
                ),
                Pattern(
                    "pl_9digit_sp", r"(?<!\d)\d{3}[\s]\d{3}[\s]\d{3}(?!\d)", score=0.85
                ),
                Pattern(
                    "pl_9digit", r"(?<!\d)\d{3}[\-]?\d{3}[\-]?\d{3}(?!\d)", score=0.75
                ),
            ],
            context=[
                "telefon",
                "numer",
                "tel",
                "zadzwoń",
                "zadzwon",
                "dzwoń",
                "dzwon",
                "kontakt",
                "whatsapp",
                "viber",
                "dzwonić",
            ],
        )
    )

    # 2. Polskie numery IBAN (PL + 26 cyfr)
    registry.add_recognizer(
        PatternRecognizer(
            supported_entity="IBAN_CODE",
            supported_language="pl",
            patterns=[
                Pattern("iban_pl_raw", r"PL\d{26}", score=0.98),
                Pattern("iban_pl_spaced", r"PL\s?\d{2}(\s?\d{4}){6}", score=0.97),
            ],
            context=["konto", "przelew", "iban", "numer konta", "przelej", "wpłać"],
        )
    )

    # 3. Kod BLIK (6 cyfr w kontekście płatniczym)
    registry.add_recognizer(
        PatternRecognizer(
            supported_entity="BLIK_CODE",
            supported_language="pl",
            patterns=[
                Pattern("blik_6digit", r"(?<!\d)\d{6}(?!\d)", score=0.55),
            ],
            context=["blik", "kod", "zapłać", "zaplatac", "płatność", "platnosc"],
        )
    )

    # 4. Prośba o kod BLIK lub dane płatnicze (bez faktycznego numeru)
    registry.add_recognizer(
        PatternRecognizer(
            supported_entity="BLIK_REQUEST",
            supported_language="pl",
            patterns=[
                Pattern("przez_blik", r"(?i)przez\s+BLIK", score=0.85),
                Pattern("blikiem", r"(?i)BLIKiem", score=0.85),
                Pattern("blik_kod", r"(?i)BLIK[\w\s]{0,20}kod", score=0.90),
                Pattern("kod_blik", r"(?i)kod[\w\s]{0,20}BLIK", score=0.90),
                Pattern("wyslij_kod", r"(?i)wyślij\s+\w*\s*kod", score=0.80),
                Pattern("twoj_kod", r"(?i)tw[oó]j\s+kod", score=0.80),
                Pattern("swoj_kod", r"(?i)sw[oó]j\s+kod", score=0.80),
                Pattern("kod_aplikacji", r"(?i)kod\s+z\s+aplikacji", score=0.85),
                Pattern("podaj_kod", r"(?i)podaj\s+mi\s+kod", score=0.85),
                Pattern("przelew_blik", r"(?i)przelew\s+BLIK", score=0.85),
                Pattern("masz_blik", r"(?i)masz\s+BLIK", score=0.80),
                Pattern("cvv", r"(?i)\bCVV\b", score=0.90),
                Pattern("numer_karty", r"(?i)numer\s+karty", score=0.85),
                Pattern("numer_i_cvv", r"(?i)numer\s+i\s+CVV", score=0.95),
            ],
            context=["blik", "zapłać", "płatność", "kod", "karta", "przelew"],
        )
    )

    # 5. Zaliczka / płatność z góry
    registry.add_recognizer(
        PatternRecognizer(
            supported_entity="ADVANCE_PAYMENT",
            supported_language="pl",
            patterns=[
                Pattern("zaliczka", r"(?i)zaliczk[ieęą]", score=0.90),
                Pattern("zadatek", r"(?i)zadatek", score=0.90),
                Pattern("wplac_z_gory", r"(?i)wpłać\s+z\s+góry", score=0.90),
                Pattern("przelej_z_gory", r"(?i)przelej\s+z\s+góry", score=0.90),
                Pattern("zaplac_z_gory", r"(?i)zapłać\s+z\s+góry", score=0.90),
                Pattern("z_gory_przelej", r"(?i)z\s+góry\s+przelej", score=0.90),
                Pattern("z_gory_reszta", r"(?i)z\s+góry,?\s+reszta", score=0.85),
                Pattern("kwota_z_gory", r"(?i)\d+\s*zł?\s+z\s+góry", score=0.85),
                Pattern("przed_wysylka", r"(?i)przed\s+wysyłk[aą]", score=0.85),
                Pattern(
                    "advance_payment",
                    r"(?i)advance\s+payment|pay\s+in\s+advance|upfront",
                    score=0.85,
                ),
            ],
            context=["zapłać", "przelej", "zaliczka", "rezerwacja", "transakcja"],
        )
    )

    # 6. Phishing / podejrzane linki
    registry.add_recognizer(
        PatternRecognizer(
            supported_entity="PHISHING_LINK",
            supported_language="pl",
            patterns=[
                Pattern("http_link", r"https?://[^\s]{5,}", score=0.80),
            ],
            context=["kliknij", "wejdź", "zaloguj", "link", "strona", "zapłać"],
        )
    )

    # 7. Social media handles — główny wektor obejścia platformy
    registry.add_recognizer(
        PatternRecognizer(
            supported_entity="SOCIAL_MEDIA_HANDLE",
            supported_language="pl",
            patterns=[
                Pattern("at_handle", r"@\s*[A-Za-z0-9_\.]{3,30}", score=0.85),
                Pattern(
                    "instagram_handle",
                    r"(?i)instagram[:/\s]+@?\s*[A-Za-z0-9_\.]{3,30}",
                    score=0.95,
                ),
                Pattern(
                    "ig_abbrev",
                    r"(?i)\bIG\b[:/\s]*@?\s*[A-Za-z0-9_\.]{0,30}",
                    score=0.90,
                ),
                Pattern(
                    "snapchat_handle",
                    r"(?i)snapchat[:/\s]+@?\s*[A-Za-z0-9_\.]{3,30}",
                    score=0.95,
                ),
                Pattern(
                    "telegram_handle",
                    r"(?i)telegram[:/\s]+@?\s*[A-Za-z0-9_\.]{3,30}",
                    score=0.95,
                ),
                Pattern(
                    "whatsapp_handle",
                    r"(?i)whatsapp[:/\s]+[\+\d\s\-]{9,15}",
                    score=0.95,
                ),
                Pattern(
                    "tiktok_handle",
                    r"(?i)(tiktok|tt)[:/\s]+@?\s*[A-Za-z0-9_\.]{3,30}",
                    score=0.90,
                ),
                Pattern(
                    "fb_handle",
                    r"(?i)(facebook|fb)[:/\s]+@?\s*[A-Za-z0-9_\.]{3,30}",
                    score=0.90,
                ),
                Pattern(
                    "dodaj_na_ig",
                    r"(?i)dodaj\s+(mnie\s+)?na\s+(ig|fb|tt|insta|tiktok|snapchat|telegramie?)",
                    score=0.92,
                ),
                Pattern(
                    "napisz_na_ig",
                    r"(?i)napisz\s+(do\s+mnie\s+)?na\s+(ig|fb|tt|insta|tiktok|snapchat|telegramie?)",
                    score=0.92,
                ),
                Pattern(
                    "znajdz_na",
                    r"(?i)znajdziesz\s+mnie\s+na\s+(ig|fb|tt|insta|tiktok|snapchat|telegramie?)",
                    score=0.92,
                ),
                # "pójdźmy/przejdźmy/poszli/dogadajmy się na FB/IG" — przeniesienie rozmowy
                Pattern(
                    "poszli_na_sm",
                    r"(?i)(pójd\w*|przejd\w*|dogada\w*|przenie\w*|kontaktu\w*|poszl\w*|poszł\w*|pisz\w*|idziemy|pogada\w*)\s+[\w\s]{0,25}(na|przez|do)\s+(ig|fb|tt|insta(gram)?|tiktok|snapchat|telegramie?|fejsi\w*|fejsa\w*)",
                    score=0.90,
                ),
                Pattern(
                    "szansa_na_sm",
                    r"(?i)szans[aą]\s+[\w\s]{0,35}na\s+(ig|fb|tt|insta(gram)?|tiktok|snapchat|fejsi\w*|fejsa\w*)",
                    score=0.88,
                ),
                Pattern(
                    "fejsie_handle",
                    r"(?i)(fejsie?|fejsa|fejs)[:/\s]*@?\s*[A-Za-z0-9_\.]*",
                    score=0.90,
                ),
            ],
            context=[
                "dodaj",
                "napisz",
                "znajdziesz",
                "kontakt",
                "priv",
                "dm",
                "wiadomość",
                "ig",
                "fb",
                "insta",
                "szansa",
                "pójdźmy",
                "przejdźmy",
            ],
        )
    )

    # 8. Frazy obejścia platformy (bypass phrases) — rozszerzone
    registry.add_recognizer(
        PatternRecognizer(
            supported_entity="BYPASS_PHRASE",
            supported_language="pl",
            patterns=[
                Pattern("poza_platforma", r"(?i)poza\s+platform[aą]", score=0.85),
                Pattern("poza_serwisem", r"(?i)poza\s+serwisem", score=0.85),
                Pattern("poza_aplikacja", r"(?i)poza\s+aplikacj[aą]", score=0.85),
                Pattern("bez_platformy", r"(?i)bez\s+platformy", score=0.80),
                Pattern("bez_posrednika", r"(?i)bez\s+pośrednika", score=0.80),
                Pattern("bez_prowizji", r"(?i)bez\s+prowizji", score=0.75),
                Pattern(
                    "zaoszczedz", r"(?i)zaoszcz[eę]dzisz\s+na\s+prowizji", score=0.80
                ),
                Pattern("na_priv", r"(?i)na\s+priv(atnie|at)?", score=0.80),
                Pattern(
                    "bezposrednio", r"(?i)zapłać?\s+(mi\s+)?bezpośrednio", score=0.80
                ),
                Pattern("napisz_prywat", r"(?i)napisz\s+na\s+prywat", score=0.80),
                Pattern(
                    "omijajac", r"(?i)omijaj[aą]c\s+(platform[eę]|serwis)", score=0.85
                ),
                Pattern("dogadajmy", r"(?i)dogadajmy\s+si[eę]\s+bez", score=0.80),
                Pattern(
                    "nie_przez_strone", r"(?i)nie\s+(przez|na)\s+stron[eę]", score=0.75
                ),
                Pattern("pay_outside", r"(?i)pay\s+outside", score=0.85),
                Pattern("off_platform", r"(?i)off.?platform", score=0.85),
                # obejście przez ominięcie prowizji — obsługa wariantów bez diakrytyków
                Pattern("ominac_prowizje", r"(?i)omin[aą][cć]\w*\s+prowizj\w*", score=0.85),
                Pattern("prowizje_ominac", r"(?i)prowizj\w*\s+omin[aą][cć]\w*", score=0.85),
                Pattern(
                    "ominac_platf", r"(?i)omin[aą][cć]\w*\s+(platform\w*|serwis)", score=0.85
                ),
                # "pojdziemy / przejdziemy / idźmy gdzie indziej"
                Pattern(
                    "gdzie_indziej",
                    r"(?i)(p[oó]jd[źz]\w*|przejd[źz]\w*|przejdziemy|pojdziemy|id[źz]my|idziemy)\s+[\w\s]{0,20}gdzie\s+indziej",
                    score=0.85,
                ),
                # samo "gdzie indziej" z kontekstem prowizji/transakcji
                Pattern(
                    "gdzie_indziej_ctx",
                    r"(?i)gdzie\s+indziej",
                    score=0.75,
                ),
                Pattern("poza_stylify", r"(?i)poza\s+stylify", score=0.90),
                Pattern(
                    "inaczej_zaplac",
                    r"(?i)(inaczej|innymi\s+kana[łl]ami)\s+zapła[cć]",
                    score=0.80,
                ),
            ],
            context=[
                "przelew",
                "zapłać",
                "płatność",
                "kontakt",
                "transakcja",
                "spotkaj",
                "prowizja",
                "prowizji",
                "ominąć",
                "ominac",
                "omineli",
                "omineli",
                "szansa",
                "pojdziemy",
                "przejdziemy",
            ],
        )
    )

    # 9. Toksyczna treść — wulgaryzmy i groźby
    registry.add_recognizer(
        PatternRecognizer(
            supported_entity="TOXIC_CONTENT",
            supported_language="pl",
            patterns=[
                Pattern(
                    "wulgaryzmy_pl",
                    (
                        r"(?i)(\bkurw|\bchuj|\bpierdol|\bjeba|\bspierdol|\bskurw|\bzapierdol"
                        r"|\bopierdol|\bwypierdol|\bupierdol|\bpier\*+|\bpier\.+"
                        r"|\bidiot|\bdebil|\bkretyn|\bdurn|\bgłupot|\bgłupek"
                        r"|\bcham|\bświni|\bśmiec|\bszmata|\bgnój|\bbydl|\bgnojek"
                        r"|\bosioł|\bosł|\bosłe|\bośle|\btroll"
                        r"|\boszuś|\bzłodzieje|\bnaciągacz"
                        r"|\bbezczel|\bpolaczek|\bbiedota)"
                    ),
                    score=0.80,
                ),
                Pattern(
                    "wulgaryzmy_en",
                    (
                        r"(?i)(\bshit\b|\bfuck|\basshole\b|\bbitch\b|\bbastard\b|\bcunt\b"
                        r"|\bdick\b|\bprick\b|\bmoron\b|\bretard|\bfaggot\b|\bwhore\b|\bslut\b)"
                    ),
                    score=0.85,
                ),
                Pattern(
                    "grozby",
                    (
                        r"(?i)(\bwiem gdzie mieszkasz|\buważaj na siebie|\bbędziesz żałował"
                        r"|\bzgłosz[eę] ci[eę]|\bbędzie źle|\bwynoś się|\bnie wracaj tu)"
                    ),
                    score=0.85,
                ),
            ],
        )
    )

    return AnalyzerEngine(
        nlp_engine=nlp_engine,
        registry=registry,
        supported_languages=["pl"],
    )


# Singleton — inicjalizowany przy pierwszym wywołaniu get_analyzer()
_analyzer: AnalyzerEngine | None = None


def get_analyzer() -> AnalyzerEngine:
    global _analyzer
    if _analyzer is None:
        logger.info("Inicjalizacja Presidio AnalyzerEngine (pl_core_news_sm)...")
        _analyzer = _build_analyzer()
        logger.info("Presidio gotowy.")
    return _analyzer


# ---------------------------------------------------------------------------
# Wynik analizy
# ---------------------------------------------------------------------------


@dataclass
class DetectedEntity:
    type: str
    label: str
    value: str
    confidence: float
    start: int
    end: int


@dataclass
class PresidioResult:
    action: str  # 'allow' | 'warn' | 'block'
    label: str  # kategoria z taksonomii pracy
    confidence: float
    entities: list[DetectedEntity] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Główna funkcja analizy
# ---------------------------------------------------------------------------


def analyze(text: str) -> PresidioResult:
    """
    Uruchamia Presidio na tekście i zwraca strukturalny wynik moderacji.

    Logika decyzyjna:
    - Jeśli wykryto encję z BLOCK_ENTITIES z confidence >= BLOCK_THRESHOLD → block
    - Jeśli wykryto cokolwiek z confidence >= WARN_THRESHOLD → warn
    - W przeciwnym razie → allow
    """
    analyzer = get_analyzer()
    raw_results = analyzer.analyze(text=text, language="pl")

    if not raw_results:
        return PresidioResult(action="allow", label="benign", confidence=0.0)

    # Sortuj malejąco po score
    raw_results.sort(key=lambda r: r.score, reverse=True)

    entities = [
        DetectedEntity(
            type=r.entity_type,
            label=ENTITY_TO_LABEL.get(r.entity_type, "suspicious"),
            value=text[r.start : r.end],
            confidence=round(r.score, 4),
            start=r.start,
            end=r.end,
        )
        for r in raw_results
    ]

    top = raw_results[0]
    top_label = ENTITY_TO_LABEL.get(top.entity_type, "suspicious")

    if top.entity_type in BLOCK_ENTITIES and top.score >= BLOCK_THRESHOLD:
        return PresidioResult(
            action="block",
            label=top_label,
            confidence=round(top.score, 4),
            entities=entities,
        )

    if top.score >= WARN_THRESHOLD:
        return PresidioResult(
            action="warn",
            label=top_label,
            confidence=round(top.score, 4),
            entities=entities,
        )

    return PresidioResult(
        action="allow",
        label="benign",
        confidence=round(top.score, 4),
        entities=entities,
    )
