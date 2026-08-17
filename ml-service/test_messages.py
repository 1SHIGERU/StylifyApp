# -*- coding: utf-8 -*-
import httpx
import json
import sys
import os

# Wymuszenie UTF-8 na Windows
os.environ["PYTHONIOENCODING"] = "utf-8"
if sys.platform == "win32":
    import ctypes
    ctypes.windll.kernel32.SetConsoleOutputCP(65001)

ML_SERVICE_URL = "http://localhost:8000"

test_messages = [
    # Dane osobowe / proba obejscia platformy
    {"message": "Okay podaje ci moj numer: +48 501 529 082", "category": "[DANE]  "},
    {"message": "Napisz do mnie na maila: jan.kowalski@gmail.com, nie gadajmy tu", "category": "[DANE]  "},
    {"message": "Znajdziesz mnie na insta: @jan_kowalski123", "category": "[DANE]  "},
    {"message": "Moj WhatsApp to 601234567, tam dogadamy cene", "category": "[DANE]  "},

    # Proba oszustwa / fraud
    {"message": "Zaplac mi na BLIK 123456, nie przez platforme, taniej bedzie", "category": "[FRAUD] "},
    {"message": "Przelej mi na konto PL61109010140000071219812874 i wysle", "category": "[FRAUD] "},
    {"message": "Zaufaj mi, jestem sprawdzony sprzedawca, plac z gory poza serwisem", "category": "[FRAUD] "},
    {"message": "Moge dac 50% taniej ale tylko przez Vinted, tu za drogo", "category": "[FRAUD] "},

    # Obelgi / toksycznosc
    {"message": "Ty idioto, zwracasz bo jestes za glupi zeby przeczytac opis", "category": "[OBELGA]"},
    {"message": "Oszust z ciebie, wszystkich tak robisz w chuja", "category": "[OBELGA]"},
    {"message": "Spierdalaj z moja oferta, nie dla takich jak ty", "category": "[OBELGA]"},

    # Grozby
    {"message": "Uwazaj bo wiem gdzie mieszkasz", "category": "[GROZBA]"},
    {"message": "Jak nie zwrocisz kasy to pozalujesz", "category": "[GROZBA]"},

    # Normalne wiadomosci (NIE powinny byc flagowane)
    {"message": "Hej, czy ta kurtka jest jeszcze dostepna?", "category": "[OK]    "},
    {"message": "Czy mozliwa jest wysylka kurierem?", "category": "[OK]    "},
    {"message": "Dobra, biore! Jak zaplacic?", "category": "[OK]    "},
]

def score_bar(score, width=20):
    filled = int(score * width)
    return "[" + "#" * filled + "-" * (width - filled) + "]"

def run_tests():
    print("=" * 80)
    print("TEST ML SERVICE - Stylify Chat Moderation")
    print(f"   URL: {ML_SERVICE_URL}")
    print("=" * 80)

    try:
        response = httpx.get(f"{ML_SERVICE_URL}/health", timeout=5)
        print(f"[OK] Serwis dziala: {response.json()}\n")
    except Exception as e:
        print(f"[BLAD] Serwis niedostepny: {e}")
        print("   Upewnij sie ze docker-compose up --build ml-service jest uruchomiony!")
        return

    payload = [{"message": m["message"]} for m in test_messages]
    print("Wysylam wiadomosci do klasyfikacji...\n")

    try:
        response = httpx.post(
            f"{ML_SERVICE_URL}/classify/batch",
            json=payload,
            timeout=60
        )
        results = response.json()
    except Exception as e:
        print(f"[BLAD] Blad zapytania: {e}")
        return

    print(f"{'Kategoria':<10} {'Flagowana?':<11} {'Powod':<22} {'Confidence':<12} Wiadomosc")
    print("-" * 100)

    flagged_count = 0
    false_positives = 0

    for test, result in zip(test_messages, results):
        is_flagged    = result["is_flagged"]
        flag_str      = ">> TAK" if is_flagged else "   NIE"
        reason        = result["flag_reason"] or "-"
        conf          = f"{result['confidence']:.2%}" if result["confidence"] else "-"
        msg_short     = test["message"][:42] + "..." if len(test["message"]) > 42 else test["message"]
        cat           = test["category"]

        print(f"{cat:<10} {flag_str:<11} {reason:<22} {conf:<12} {msg_short}")

        if is_flagged and cat != "[OK]    ":
            flagged_count += 1
        if is_flagged and cat == "[OK]    ":
            false_positives += 1

    total_bad  = len([m for m in test_messages if m["category"] != "[OK]    "])
    total_good = len([m for m in test_messages if m["category"] == "[OK]    "])

    print("\n" + "=" * 80)
    print("PODSUMOWANIE")
    print(f"   Wykryte naduzywcia : {flagged_count}/{total_bad}")
    print(f"   False positives    : {false_positives}/{total_good}  (normalne blednie flagowane)")
    print(f"   Skutecznosc        : {flagged_count / total_bad * 100:.1f}%")
    print("=" * 80)

    print("\nSZCZEGOLY WSZYSTKICH ETYKIET\n")
    for test, result in zip(test_messages, results):
        print(f"  {test['category']}  {test['message'][:65]}")
        for lbl in sorted(result["all_labels"], key=lambda x: x["score"], reverse=True):
            bar = score_bar(lbl["score"])
            print(f"    {lbl['label']:<22} {lbl['score']:.4f}  {bar}")
        print()

    print("=" * 80)
    print("WNIOSKI")
    pct = flagged_count / total_bad * 100
    if pct < 50:
        print("  Model slabo radzi sobie z polskim tekstem.")
        print("  Mozliwe rozwiazania:")
        print("  1. Tlumaczenie wiadomosci EN przed klasyfikacja (deep_translator)")
        print("  2. Zmiana modelu na: xlm-roberta-base")
        print("  3. Fine-tuning na polskich danych z Twojego chatu")
    elif pct < 80:
        print("  Model daje srednie wyniki - warto rozwazyc fine-tuning.")
    else:
        print("  Model dziala dobrze na polskim tekscie!")
    print("=" * 80)


if __name__ == "__main__":
    run_tests()