"""
Generator tabel LaTeX z wyników eksperymentów.

Czyta wszystkie pliki JSON z results/metrics/ i generuje fragmenty .tex
gotowe do wstawienia do pracy przez \\input{chapters/tables_auto/...}.

Uruchomienie:
    python experiments/evaluation/generate_latex_tables.py

Lub przez Makefile:
    make tables
"""
from __future__ import annotations

import json
from pathlib import Path
from datetime import datetime

# Ścieżki względem korzenia repo
ROOT = Path(__file__).resolve().parents[2]
METRICS_DIR = ROOT / "results" / "metrics"
TABLES_DIR = ROOT / "chapters" / "tables_auto"
TABLES_DIR.mkdir(parents=True, exist_ok=True)


def load_metrics(name: str) -> dict | None:
    path = METRICS_DIR / f"{name}.json"
    if not path.exists():
        print(f"[skip] brak {path.relative_to(ROOT)}")
        return None
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def fmt(x: float | None, decimals: int = 3) -> str:
    """Formatuje liczbę do tabeli LaTeX, zachowując myślnik dla braków."""
    if x is None:
        return "---"
    return f"{x:.{decimals}f}"


HEADER = """% AUTO-GENEROWANY plik - nie edytuj ręcznie!
% Wygenerowane: {timestamp}
% Źródło: experiments/evaluation/generate_latex_tables.py
% Regeneracja: make tables
"""


def gen_single_model_table(name: str, caption: str, label: str) -> None:
    """Tabela metryk dla jednego modelu (precision/recall/F1/accuracy)."""
    data = load_metrics(name)
    if data is None:
        return

    m = data["metrics"]
    body = rf"""
\begin{{table}}[H]
\centering
\caption{{{caption}}}
\label{{tab:{label}}}
\begin{{tabular}}{{lc}}
\toprule
Metryka & Wartość \\
\midrule
\precision\  & {fmt(m.get("precision"))} \\
\recall\     & {fmt(m.get("recall"))} \\
\fone\       & {fmt(m.get("f1"))} \\
\accuracy\   & {fmt(m.get("accuracy"))} \\
\bottomrule
\end{{tabular}}
\end{{table}}
"""
    out = TABLES_DIR / f"{name}_metrics.tex"
    out.write_text(
        HEADER.format(timestamp=datetime.now().isoformat(timespec="seconds")) + body,
        encoding="utf-8",
    )
    print(f"[ok] {out.relative_to(ROOT)}")


def gen_comparison_table() -> None:
    """Główna tabela porównawcza wszystkich trzech modeli."""
    models = ["baseline", "presidio", "herbert"]
    labels = {
        "baseline": "System regułowy",
        "presidio": r"\presidio\ + Regex",
        "herbert": r"Fine-tuned \herbert",
    }

    rows = []
    for m_name in models:
        data = load_metrics(m_name)
        if data is None:
            rows.append(f"{labels[m_name]} & --- & --- & --- & --- \\\\")
            continue
        met = data["metrics"]
        rows.append(
            f"{labels[m_name]} & {fmt(met.get('precision'))} & "
            f"{fmt(met.get('recall'))} & {fmt(met.get('f1'))} & "
            f"{fmt(met.get('accuracy'))} \\\\"
        )

    body = r"""
\begin{table}[H]
\centering
\caption{Porównanie skuteczności modeli detekcji nadużyć}
\label{tab:comparison}
\begin{tabular}{lcccc}
\toprule
Model & \precision\ & \recall\ & \fone\ & \accuracy\ \\
\midrule
""" + "\n".join(rows) + r"""
\bottomrule
\end{tabular}
\end{table}
"""
    out = TABLES_DIR / "comparison.tex"
    out.write_text(
        HEADER.format(timestamp=datetime.now().isoformat(timespec="seconds")) + body,
        encoding="utf-8",
    )
    print(f"[ok] {out.relative_to(ROOT)}")


def main() -> None:
    print(f"Generowanie tabel z {METRICS_DIR.relative_to(ROOT)}/ -> {TABLES_DIR.relative_to(ROOT)}/")
    gen_single_model_table("baseline", "Wyniki systemu regułowego", "baseline-metrics")
    gen_single_model_table("presidio", r"Wyniki \presidio\ + Regex", "presidio-metrics")
    gen_single_model_table("herbert", r"Wyniki fine-tuned \herbert", "herbert-metrics")
    gen_comparison_table()
    print("\nGotowe. Przekompiluj pracę: make pdflatex")


if __name__ == "__main__":
    main()
