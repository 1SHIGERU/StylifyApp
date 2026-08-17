"""
Ewaluacja porównawcza: Podejście A (reguły/rules_v1) vs Podejście B (Presidio regex).

Oba detektory uruchamiane są na zbiorze testowym bez zewnętrznych serwisów
(Python-only, bez spacy/Docker) — co pozwala na natychmiastowe odtworzenie wyników.

Podejście A = wierny port server/utils/rules.js: proste wyrażenia regularne,
  brak wykrywania social media, BLIK-requestów, zaliczek, toksyczności.
  Jest to punkt odniesienia (baseline) pokazujący ograniczenia czystych reguł.

Podejście B = wzorce regex wzorowane na Presidio: polskie formaty telefonów,
  IBAN PL+26, BLIK z kontekstem, social-media handles, frazy bypass, zaliczki,
  phishing URL, słownik toksyczności z obsługą odmian.

Wyjście:
  - metryki per klasa (precision / recall / F1)
  - makro i ważone F1
  - macierze pomyłek
  - przykłady błędów (FP / FN)
  - pliki: results/metrics/baseline.json, results/metrics/presidio.json
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

from sklearn.metrics import classification_report, confusion_matrix

ROOT   = Path(__file__).parent.parent.parent          # praca-magisterska/
TEST   = ROOT / "data" / "processed" / "test.jsonl"
OUTDIR = ROOT / "results" / "metrics"
OUTDIR.mkdir(parents=True, exist_ok=True)

LABELS = ["bypass", "fraud", "toxic", "benign"]


# ===========================================================================
# PODEJŚCIE A — rules_v1 (port server/utils/rules.js)
# Prosta logika regułowa: regex na telefon/email/IBAN/URL + lista fraz.
# NIE wykrywa: social media, BLIK-request, zaliczek, toksyczności.
# ===========================================================================

_A_PHONE = re.compile(
    r'(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{2,4}'
)
_A_EMAIL = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
_A_URL   = re.compile(r'https?://[^\s]+')
_A_IBAN  = re.compile(r'[A-Z]{2}\d{2}[A-Z0-9]{1,30}')

_A_PHRASES = [
    "na priv", "zapłać poza", "prześlij numer", "nr telefonu", "zadzwoń",
    "on private", "pay outside", "send me your phone", "message me privately",
    "contact me on whatsapp",
]


def _a_has_phone(t: str) -> bool:
    m = _A_PHONE.findall(t)
    return bool(m) and any(len(re.sub(r'\D', '', s)) >= 6 for s in m)


def rules_v1_predict(text: str) -> str:
    """
    Wierny port rules_v1 z server/utils/rules.js.

    Kolejność (oryginalna — telefon przed IBAN!):
      phone/email → bypass
      IBAN        → fraud
      URL         → fraud  (phishing link)
      fraza bypass → bypass
      brak        → benign
    Brak wykrywania: social media, BLIK-request, zaliczki, toksyczność.
    """
    t = text or ""
    if _a_has_phone(t):
        return "bypass"
    if _A_EMAIL.search(t):
        return "bypass"
    if _A_IBAN.search(t):
        return "fraud"
    if _A_URL.search(t):
        return "fraud"
    tl = t.lower()
    if any(p in tl for p in _A_PHRASES):
        return "bypass"
    return "benign"


# ===========================================================================
# PODEJŚCIE B — Presidio regex (wzorce z presidio_detector.py)
# Polskie formaty, bogatszy słownik bypass, BLIK-request, zaliczki,
# phishing URL, toksyczność z odmianami polskich słów.
# ===========================================================================

# --- Fraud ---
_B_IBAN = [
    re.compile(r'PL\d{26}'),
    re.compile(r'PL\s?\d{2}(\s?\d{4}){6}'),
]
_B_BLIK_DIGIT = re.compile(r'(?<!\d)\d{6}(?!\d)')
_B_BLIK_CTX   = re.compile(r'(?i)blik|kod blik|kod blika|płatn|zaplac|przelew')
_B_ADVANCE = re.compile(
    r'(?i)(zaliczk[ieęą]|zadatek|wpłać\s+z\s+góry|przelej\s+z\s+góry'
    r'|zapłać\s+z\s+góry|z\s+góry\s+przelej|z\s+góry\s+zapłać'
    r'|przed\s+wysyłk[aą]|advance\s+payment|pay\s+in\s+advance|upfront'
    r'|\d+\s*zł?\s+z\s+góry|z\s+góry,?\s+reszta'
    r'|CVV|numer\s+karty|numer\s+i\s+CVV'
    r'|przez\s+BLIK|BLIKiem|BLIK.{0,20}?kod|kod.{0,20}?BLIK|wyślij\s+\S*\s*kod'
    r'|tw[oó]j\s+kod|sw[oó]j\s+kod|kod\s+z\s+aplikacji|podaj\s+mi\s+kod'
    r'|przelew\s+BLIK|masz\s+BLIK|jaki\s+masz\s+BLIK)'
)
_B_URL = re.compile(r'https?://[^\s]+')

# --- Bypass ---
_B_PHONE = [
    re.compile(r'\+48[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{3}'),
    re.compile(r'(?<!\d)\d{3}[\s]\d{3}[\s]\d{3}(?!\d)'),
    re.compile(r'(?<!\d)\d{3}[\-]\d{3}[\-]\d{3}(?!\d)'),
    re.compile(r'(?<!\d)\d{9}(?!\d)'),
]
_B_EMAIL = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
_B_SOCIAL = [
    re.compile(r'@[A-Za-z0-9_\.]{3,30}'),
    re.compile(r'(?i)instagram[:/\s]+@?[A-Za-z0-9_\.]{3,30}'),
    re.compile(r'(?i)snapchat[:/\s]+@?[A-Za-z0-9_\.]{3,30}'),
    re.compile(r'(?i)telegram[:/\s]+@?[A-Za-z0-9_\.]{3,30}'),
    re.compile(r'(?i)whatsapp[:/\s]+[\+\d\s\-]{9,15}'),
    re.compile(r'(?i)tiktok[:/\s]+@?[A-Za-z0-9_\.]{3,30}'),
    re.compile(r'(?i)facebook[:/\s]+@?[A-Za-z0-9_\.]{3,30}'),
]
_B_BYPASS = [
    re.compile(r'(?i)poza\s+platform[aą]'),
    re.compile(r'(?i)poza\s+serwisem'),
    re.compile(r'(?i)poza\s+aplikacj[aą]'),
    re.compile(r'(?i)bez\s+platformy'),
    re.compile(r'(?i)bez\s+pośrednika'),
    re.compile(r'(?i)bez\s+prowizji'),
    re.compile(r'(?i)zaoszcz[eę]dzisz\s+na\s+prowizji'),
    re.compile(r'(?i)na\s+priv(atnie|at)?'),
    re.compile(r'(?i)zapłać?\s+(mi\s+)?bezpośrednio'),
    re.compile(r'(?i)napisz\s+na\s+prywat'),
    re.compile(r'(?i)omijaj[aą]c\s+(platform[eę]|serwis)'),
    re.compile(r'(?i)dogadajmy\s+si[eę]\s+bez'),
    re.compile(r'(?i)nie\s+(przez|na)\s+stron[eę]'),
    re.compile(r'(?i)pay\s+outside'),
    re.compile(r'(?i)off.?platform'),
]

# --- Toxic ---
_B_TOXIC = re.compile(
    r'(?i)(\bkurw|\bchuj|\bpierdol|\bjeba|\bspierdol|\bskurw|\bzapierdol'
    r'|\bopierdol|\bwypierdol|\bupierdol|\bpier\*+|\bpier\.+'
    r'|\bidiot|\bdebil|\bkretyn|\bdurn|\bgłupot|\bgłupek'
    r'|\bcham|\bświni|\bśmiec|\bszmata|\bgnój|\bbydl|\bgnojek'
    r'|\bosioł|\bosł|\bosłe|\bośle|\btroll'
    r'|\boszust|\boszuś|\bzłodziej|\bzłodzieje|\bnaciągacz'
    r'|\bshit\b|\bfuck|\basshole\b|\bbitch\b|\bbastard\b|\bcunt\b'
    r'|\bdick\b|\bprick\b|\bmoron\b|\bretard|\bfaggot\b|\bwhore\b|\bslut\b'
    r'|\bbezczel|\bwiem gdzie mieszkasz|\bpolaczek|\bbiedota'
    r'|\buważaj na siebie|\bbędziesz żałował|\bzgłosz[eę] ci[eę]'
    r'|\bbędzie źle|\bwynoś się|\bnie wracaj tu)'
)


def presidio_predict(text: str) -> str:
    """
    Wzorce regex wzorowane na Presidio + custom recognizers.

    Kolejność (poprawiona — IBAN przed telefonem):
      1. IBAN (PL-specyficzny)  → fraud
      2. BLIK 6-cyfr + kontekst → fraud
      3. Zaliczka / BLIK-request / CVV / URL → fraud
      4. Telefon (PL-format)    → bypass
      5. Email                  → bypass
      6. Social media handle    → bypass
      7. Fraza bypass           → bypass
      8. Toksyczność (odmiany)  → toxic
      9. brak                   → benign
    """
    t = text or ""

    if any(p.search(t) for p in _B_IBAN):
        return "fraud"
    if _B_BLIK_DIGIT.search(t) and _B_BLIK_CTX.search(t):
        return "fraud"
    if _B_ADVANCE.search(t):
        return "fraud"
    if _B_URL.search(t):
        return "fraud"

    if any(p.search(t) for p in _B_PHONE):
        return "bypass"
    if _B_EMAIL.search(t):
        return "bypass"
    if any(p.search(t) for p in _B_SOCIAL):
        return "bypass"
    if any(p.search(t) for p in _B_BYPASS):
        return "bypass"

    if _B_TOXIC.search(t):
        return "toxic"

    return "benign"


# ===========================================================================
# Ewaluacja
# ===========================================================================

def load_test() -> list[dict]:
    if not TEST.exists():
        sys.exit(f"Brak pliku testowego: {TEST}\nUruchom: python experiments/generate_dataset.py")
    with open(TEST, encoding="utf-8") as f:
        return [json.loads(l) for l in f if l.strip()]


def evaluate(records: list[dict], predict_fn, name: str) -> dict:
    y_true = [r["label"] for r in records]
    y_pred = [predict_fn(r["text"]) for r in records]

    report = classification_report(
        y_true, y_pred, labels=LABELS, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred, labels=LABELS).tolist()

    errors: dict[str, list] = {"FP": [], "FN": [], "wrong_class": []}
    for r, pred in zip(records, y_pred):
        true = r["label"]
        if pred != true:
            if pred != "benign" and true == "benign":
                errors["FP"].append({"text": r["text"], "true": true, "pred": pred})
            elif pred == "benign" and true != "benign":
                errors["FN"].append({"text": r["text"], "true": true, "pred": pred})
            else:
                errors["wrong_class"].append({"text": r["text"], "true": true, "pred": pred})

    return {
        "detector": name,
        "n_test": len(records),
        "per_class": {
            lbl: {
                "precision": round(report[lbl]["precision"], 4),
                "recall":    round(report[lbl]["recall"],    4),
                "f1":        round(report[lbl]["f1-score"],  4),
                "support":   report[lbl]["support"],
            }
            for lbl in LABELS
        },
        "macro_f1":    round(report["macro avg"]["f1-score"],    4),
        "weighted_f1": round(report["weighted avg"]["f1-score"], 4),
        "accuracy":    round(report["accuracy"],                 4),
        "confusion_matrix":  cm,
        "confusion_labels":  LABELS,
        "n_errors_fp":       len(errors["FP"]),
        "n_errors_fn":       len(errors["FN"]),
        "n_errors_wrong":    len(errors["wrong_class"]),
        "examples_fp":       errors["FP"][:5],
        "examples_fn":       errors["FN"][:5],
        "examples_wrong":    errors["wrong_class"][:5],
    }


def compare(results: list[dict]) -> None:
    """Tabela porównawcza dla 2–4 podejść (A, B, C, D)."""
    short = ["A", "B", "C", "D"][: len(results)]
    col_w = 12
    sep_w = 24 + col_w * len(results) + 3

    title = "A (rules_v1) -> B (Presidio) -> C (HerBERT) -> D (Hybrid)"
    print(f"\n{'='*max(sep_w, len(title)+4)}")
    print(f"  EWOLUCJA: {title}")
    print(f"{'='*max(sep_w, len(title)+4)}")

    header = f"  {'Metryka':<24}" + "".join(f"{l:>{col_w}}" for l in short)
    # Kolumny delta: zawsze B-A; jeśli C: C-B, C-A; jeśli D: D-C, D-A
    print(header)
    print("  " + "-" * sep_w)

    def row(label, key):
        vals = [r[key] for r in results]
        line = f"  {label:<24}" + "".join(f"{v:>{col_w}.3f}" for v in vals)
        diffs = []
        for i in range(1, len(vals)):
            d = vals[i] - vals[i-1]
            diffs.append(f"{d:>+7.3f}")
        if len(vals) > 1:
            diffs.append(f"{vals[-1]-vals[0]:>+7.3f}")
        line += "  " + "  ".join(diffs)
        print(line)

    def row_cls(label, lbl, key):
        vals = [r["per_class"][lbl][key] for r in results]
        line = f"  {label:<24}" + "".join(f"{v:>{col_w}.3f}" for v in vals)
        diffs = []
        for i in range(1, len(vals)):
            d = vals[i] - vals[i-1]
            diffs.append(f"{d:>+7.3f}")
        if len(vals) > 1:
            diffs.append(f"{vals[-1]-vals[0]:>+7.3f}")
        line += "  " + "  ".join(diffs)
        print(line)

    row("Accuracy",    "accuracy")
    row("Macro F1",    "macro_f1")
    row("Weighted F1", "weighted_f1")
    print("  " + "-" * sep_w)
    for lbl in LABELS:
        row_cls(f"F1 [{lbl}]", lbl, "f1")
    print("  " + "-" * sep_w)
    for lbl in LABELS:
        row_cls(f"Recall [{lbl}]", lbl, "recall")

    missing = []
    if len(results) < 3:
        missing.append("C: uruchom experiments/train_herbert.ipynb w Colab → herbert.json")
    if len(results) < 4:
        missing.append("D: wgraj herbert.json z polem y_pred (komorka [8] notebooka)")
    for m in missing:
        print(f"\n  [brak] {m}")


def load_herbert() -> dict | None:
    """Wczytuje wyniki HerBERT z pliku JSON (generowanego przez Colab)."""
    path = OUTDIR / "herbert.json"
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if "per_class" not in data or "macro_f1" not in data:
        print("[!] results/metrics/herbert.json ma niepoprawny format — pomijam C/D.")
        print("    Wygeneruj go ponownie notebookiem experiments/train_herbert.ipynb")
        return None
    return data


def evaluate_hybrid(records: list[dict], c_preds: list[str], name: str) -> dict:
    """
    Podejście D — Hybrid B+C.

    Logika:
      - Jeśli Presidio (B) wykryje cokolwiek innego niż benign → użyj B.
      - Jeśli B mówi benign → użyj predykcji HerBERT (C).

    Uzasadnienie: B ma precision=1.0 na wszystkich klasach (zero FP),
    więc gdy coś wykryje — zawsze ma rację. HerBERT uzupełnia przypadki,
    których B nie rozpoznaje (agresywny ton bez słów kluczowych).
    """
    y_true, y_pred_hybrid = [], []
    b_fired, c_fired = 0, 0

    for r, c_pred in zip(records, c_preds):
        b_pred = presidio_predict(r["text"])
        if b_pred != "benign":
            y_pred_hybrid.append(b_pred)
            b_fired += 1
        else:
            y_pred_hybrid.append(c_pred)
            c_fired += 1
        y_true.append(r["label"])

    report = classification_report(
        y_true, y_pred_hybrid, labels=LABELS, output_dict=True, zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred_hybrid, labels=LABELS).tolist()

    errors: dict[str, list] = {"FP": [], "FN": [], "wrong_class": []}
    for r, pred in zip(records, y_pred_hybrid):
        true = r["label"]
        if pred != true:
            if pred != "benign" and true == "benign":
                errors["FP"].append({"text": r["text"], "true": true, "pred": pred})
            elif pred == "benign" and true != "benign":
                errors["FN"].append({"text": r["text"], "true": true, "pred": pred})
            else:
                errors["wrong_class"].append({"text": r["text"], "true": true, "pred": pred})

    print(f"\n  [D] Routing: B obsłużył {b_fired}/{len(records)} wiadomości "
          f"({b_fired/len(records)*100:.1f}%), C — {c_fired} ({c_fired/len(records)*100:.1f}%)")

    return {
        "detector": name,
        "n_test": len(records),
        "per_class": {
            lbl: {
                "precision": round(report[lbl]["precision"], 4),
                "recall":    round(report[lbl]["recall"],    4),
                "f1":        round(report[lbl]["f1-score"],  4),
                "support":   report[lbl]["support"],
            }
            for lbl in LABELS
        },
        "macro_f1":    round(report["macro avg"]["f1-score"],    4),
        "weighted_f1": round(report["weighted avg"]["f1-score"], 4),
        "accuracy":    round(report["accuracy"],                 4),
        "confusion_matrix":  cm,
        "confusion_labels":  LABELS,
        "n_errors_fp":       len(errors["FP"]),
        "n_errors_fn":       len(errors["FN"]),
        "n_errors_wrong":    len(errors["wrong_class"]),
        "examples_fp":       errors["FP"][:5],
        "examples_fn":       errors["FN"][:5],
        "examples_wrong":    errors["wrong_class"][:5],
        "b_fired":           b_fired,
        "c_fired":           c_fired,
    }


def print_results(res: dict) -> None:
    name = res["detector"]
    print(f"\n{'='*62}")
    print(f"  {name}")
    print(f"{'='*62}")
    print(f"  Zbior testowy: {res['n_test']} przykladow\n")

    print(f"  {'Klasa':<10} {'Precision':>10} {'Recall':>10} {'F1':>10} {'N':>6}")
    print("  " + "-" * 50)
    for lbl in LABELS:
        pc = res["per_class"][lbl]
        print(f"  {lbl:<10} {pc['precision']:>10.3f} {pc['recall']:>10.3f} {pc['f1']:>10.3f} {int(pc['support']):>6}")
    print("  " + "-" * 50)
    print(f"  {'macro avg':<10} {'':>10} {'':>10} {res['macro_f1']:>10.3f}")
    print(f"  {'weighted':<10} {'':>10} {'':>10} {res['weighted_f1']:>10.3f}")
    print(f"  accuracy: {res['accuracy']:.3f}")

    print(f"\n  Macierz pomylek (wiersze=prawdziwe, kolumny=przewidziane):")
    print(f"  {'':12}" + "".join(f"{l:>10}" for l in LABELS))
    for i, lbl in enumerate(LABELS):
        print(f"  {lbl:<12}" + "".join(f"{v:>10}" for v in res["confusion_matrix"][i]))

    total_err = res["n_errors_fp"] + res["n_errors_fn"] + res.get("n_errors_wrong", 0)
    print(f"\n  Bledy lacznie: {total_err}  "
          f"(FP={res['n_errors_fp']}, FN={res['n_errors_fn']})")

    if res.get("examples_fn"):
        print("  Przyklady FN:")
        for e in res["examples_fn"][:3]:
            print(f"    [{e['true']}] \"{e['text'][:70]}\"")
    if res.get("examples_wrong"):
        print("  Przyklady zlej klasy:")
        for e in res["examples_wrong"][:3]:
            print(f"    [{e['true']}->>{e['pred']}] \"{e['text'][:70]}\"")


def main() -> None:
    records = load_test()
    print(f"Zaladowano {len(records)} przykladow testowych.")
    print(f"Rozklad klas: {Counter(r['label'] for r in records)}")

    res_a = evaluate(records, rules_v1_predict, "Podejscie A - rules_v1 (port server/utils/rules.js)")
    res_b = evaluate(records, presidio_predict,  "Podejscie B - Presidio regex (polskie wzorce + toksycznosc)")
    res_c_data = load_herbert()

    # Podejście C — z pliku Colab
    res_c = res_c_data  # już jest w formacie wynikowym

    # Podejście D — Hybrid, wymaga y_pred z C
    res_d = None
    if res_c_data and "y_pred" in res_c_data:
        c_preds = res_c_data["y_pred"]
        if len(c_preds) == len(records):
            res_d = evaluate_hybrid(
                records, c_preds,
                "Podejscie D - Hybrid B+C (Presidio pre-filter + HerBERT)"
            )
        else:
            print(f"[!] Liczba predykcji C ({len(c_preds)}) != liczba rekordow ({len(records)}) — pomijam D.")
    elif res_c_data:
        print("\n[!] herbert.json nie zawiera y_pred — pomijam Podejscie D.")
        print("    Uruchom ponownie komorki [8]-[9] w notebooku i wgraj nowy herbert.json.")

    print_results(res_a)
    print_results(res_b)
    if res_c:
        print_results(res_c)
    if res_d:
        print_results(res_d)

    all_results = [res_a, res_b] + ([res_c] if res_c else []) + ([res_d] if res_d else [])
    compare(all_results)

    for res, fname in [
        (res_a, "baseline.json"),
        (res_b, "presidio.json"),
        *( [(res_d, "hybrid.json")] if res_d else [] ),
    ]:
        path = OUTDIR / fname
        with open(path, "w", encoding="utf-8") as f:
            json.dump(res, f, ensure_ascii=False, indent=2)
        print(f"Zapisano: {path}")


if __name__ == "__main__":
    main()
