"""
Baseline regułowy - keyword matching dla detekcji nadużyć.

Zapisuje wyniki do results/metrics/baseline.json w formacie zgodnym
z generate_latex_tables.py.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).resolve().parents[2]
METRICS_OUT = ROOT / "results" / "metrics" / "baseline.json"


# --- Słowniki / wzorce ---

BYPASS_KEYWORDS = [
    "whatsapp", "wp", "telegram", "signal",
    "instagram", "ig", "insta",
    "messenger", "fb",
    "pisz na", "znajdź mnie",
    # ... uzupełnij
]

FRAUD_PATTERNS = [
    r"\bblik\b",
    r"\biban\b",
    r"\bzaliczk[aęy]\b",
    r"przelew\s+(poza|bezpośrednio)",
]

TOXIC_KEYWORDS: list[str] = [
    # uzupełnij - słownik wulgaryzmów / mowy nienawiści
]


def detect(text: str) -> dict[str, bool]:
    """Zwraca słownik flag dla każdej kategorii nadużycia."""
    text_low = text.lower()
    return {
        "bypass": any(kw in text_low for kw in BYPASS_KEYWORDS),
        "fraud": any(re.search(p, text_low) for p in FRAUD_PATTERNS),
        "toxic": any(kw in text_low for kw in TOXIC_KEYWORDS),
    }


def evaluate(test_data: list[dict]) -> dict:
    """
    test_data: lista {"text": str, "labels": {"bypass": bool, ...}}
    Zwraca metryki w formacie zgodnym z naszym JSON-schemą.
    """
    # TODO: implementacja precision/recall/F1 dla każdej kategorii
    # użyj sklearn.metrics
    raise NotImplementedError("Zaimplementuj po przygotowaniu test setu")


def main() -> None:
    # TODO: wczytaj test set z data/processed/test.jsonl
    # results = evaluate(test_data)

    # Tymczasowo - placeholder z poprzedniego runa
    print("[baseline] TODO: wczytaj prawdziwe dane testowe")
    print(f"[baseline] Wyniki w: {METRICS_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
