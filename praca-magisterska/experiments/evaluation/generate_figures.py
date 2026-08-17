"""
Generuje wykresy i tabele LaTeX dla rozdziału 4 pracy magisterskiej.

Uruchomienie:
    cd praca-magisterska
    python experiments/evaluation/generate_figures.py
"""

from __future__ import annotations
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ROOT   = Path(__file__).parent.parent.parent
FIGDIR = ROOT / "chapters" / "figures"
TABDIR = ROOT / "chapters" / "tables_auto"
FIGDIR.mkdir(parents=True, exist_ok=True)
TABDIR.mkdir(parents=True, exist_ok=True)

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 11,
    "axes.titlesize": 12,
    "axes.labelsize": 11,
    "xtick.labelsize": 10,
    "ytick.labelsize": 10,
    "figure.dpi": 150,
})

LABELS       = ["bypass", "fraud", "toxic", "benign"]
MODULES      = ["A", "B", "C", "D"]
NAMES        = ["A\n(Regulowy)", "B\n(Presidio)", "C\n(HerBERT)", "D\n(Hybrydowy)"]
COLORS_ABCD  = ["#AAAAAA", "#4878CF", "#6ACC65", "#2C4E8A"]
COLOR_P, COLOR_R, COLOR_F1 = "#4878CF", "#6ACC65", "#D65F5F"


def load() -> dict:
    out = {}
    for name in ["baseline", "presidio", "herbert", "hybrid"]:
        with open(ROOT / "results" / "metrics" / f"{name}.json", encoding="utf-8") as f:
            out[name] = json.load(f)
    return out


def macro_p(m: dict) -> float:
    return round(sum(m["per_class"][l]["precision"] for l in LABELS) / 4, 4)

def macro_r(m: dict) -> float:
    return round(sum(m["per_class"][l]["recall"] for l in LABELS) / 4, 4)

def fmt(v: float) -> str:
    return f"{v:.3f}".replace(".", "{,}")


# ── Wykres 1: Makro F1 ──────────────────────────────────────────────────────

def fig_macro_comparison(metrics: dict) -> None:
    keys = ["baseline", "presidio", "herbert", "hybrid"]
    f1s  = [metrics[k]["macro_f1"] for k in keys]

    fig, ax = plt.subplots(figsize=(7, 4.5))
    bars = ax.bar(NAMES, f1s, color=COLORS_ABCD, width=0.55, edgecolor="white", linewidth=1.2)
    for bar, val in zip(bars, f1s):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.010,
                f"{val:.4f}", ha="center", va="bottom", fontsize=10, fontweight="bold")
    ax.set_ylim(0, 1.14)
    ax.set_ylabel("Makro F$_1$")
    ax.set_title("Makro F$_1$ — porownanie podejsc")
    ax.axhline(1.0, color="gray", linestyle="--", linewidth=0.8, alpha=0.5)
    ax.yaxis.grid(True, linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(FIGDIR / "fig_macro_comparison.pdf", bbox_inches="tight")
    plt.close(fig)
    print(f"  Zapisano: fig_macro_comparison.pdf")


# ── Wykres 2: F1 per klasa ──────────────────────────────────────────────────

def fig_per_class_f1(metrics: dict) -> None:
    keys  = ["baseline", "presidio", "herbert", "hybrid"]
    x     = np.arange(len(LABELS))
    width = 0.18

    fig, ax = plt.subplots(figsize=(9, 5))
    for i, (k, color) in enumerate(zip(keys, COLORS_ABCD)):
        vals   = [metrics[k]["per_class"][l]["f1"] for l in LABELS]
        offset = (i - 1.5) * width
        bars   = ax.bar(x + offset, vals, width, label=f"Modul {MODULES[i]}",
                        color=color, edgecolor="white", linewidth=0.8)
        for bar, val in zip(bars, vals):
            if val > 0.02:
                ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.012,
                        f"{val:.2f}", ha="center", va="bottom", fontsize=7.5, rotation=90)

    ax.set_xticks(x)
    ax.set_xticklabels(["bypass", "fraud", "toxic", "benign"])
    ax.set_ylim(0, 1.20)
    ax.set_ylabel("F$_1$")
    ax.set_title("F$_1$ per klasa — porownanie podejsc")
    ax.legend(loc="upper left", fontsize=9)
    ax.yaxis.grid(True, linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(FIGDIR / "fig_per_class_f1.pdf", bbox_inches="tight")
    plt.close(fig)
    print(f"  Zapisano: fig_per_class_f1.pdf")


# ── Wykres 3: Precyzja / Pelnosc / F1 ───────────────────────────────────────

def fig_prf_comparison(metrics: dict) -> None:
    keys = ["baseline", "presidio", "herbert", "hybrid"]
    x    = np.arange(len(keys))
    w    = 0.25

    ps  = [macro_p(metrics[k]) for k in keys]
    rs  = [macro_r(metrics[k]) for k in keys]
    f1s = [metrics[k]["macro_f1"] for k in keys]

    fig, ax = plt.subplots(figsize=(8, 4.5))
    b1 = ax.bar(x - w, ps,  w, label="Precyzja",  color=COLOR_P,  edgecolor="white")
    b2 = ax.bar(x,     rs,  w, label="Pelnosc",   color=COLOR_R,  edgecolor="white")
    b3 = ax.bar(x + w, f1s, w, label="F$_1$",     color=COLOR_F1, edgecolor="white")
    for bars in [b1, b2, b3]:
        for bar in bars:
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.008,
                    f"{bar.get_height():.3f}", ha="center", va="bottom", fontsize=7.5)
    ax.set_xticks(x)
    ax.set_xticklabels(NAMES)
    ax.set_ylim(0, 1.13)
    ax.set_ylabel("Wartosc metryki")
    ax.set_title("Precyzja, Pelnosc, F$_1$ (makro) — wszystkie podejscia")
    ax.legend(fontsize=9)
    ax.yaxis.grid(True, linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(FIGDIR / "fig_prf_comparison.pdf", bbox_inches="tight")
    plt.close(fig)
    print(f"  Zapisano: fig_prf_comparison.pdf")


# ── Wykres 4: Routing hybrydowy ──────────────────────────────────────────────

def fig_hybrid_routing(metrics: dict) -> None:
    h = metrics["hybrid"]
    b_fired = h.get("b_fired", 82)
    c_fired = h.get("c_fired", 38)
    total   = b_fired + c_fired

    fig, ax = plt.subplots(figsize=(5.5, 4.5))
    wedges, texts, autotexts = ax.pie(
        [b_fired, c_fired],
        labels=[
            f"Presidio (B)\n{b_fired} wiad. ({b_fired/total*100:.1f}%)",
            f"HerBERT (C)\n{c_fired} wiad. ({c_fired/total*100:.1f}%)",
        ],
        colors=["#4878CF", "#6ACC65"],
        autopct="%1.1f%%",
        startangle=90,
        wedgeprops={"edgecolor": "white", "linewidth": 2},
        textprops={"fontsize": 10},
    )
    for at in autotexts:
        at.set_fontsize(11)
        at.set_fontweight("bold")
        at.set_color("white")
    ax.set_title("Routing w potoku hybrydowym (Modul D)\nn=120 wiadomosci testowych", pad=12)
    fig.tight_layout()
    fig.savefig(FIGDIR / "fig_hybrid_routing.pdf", bbox_inches="tight")
    plt.close(fig)
    print(f"  Zapisano: fig_hybrid_routing.pdf")


# ── Wykres 5: Bledy klasyfikacji ─────────────────────────────────────────────

def fig_error_analysis(metrics: dict) -> None:
    keys = ["baseline", "presidio", "herbert", "hybrid"]
    fp   = [metrics[k]["n_errors_fp"]                  for k in keys]
    fn   = [metrics[k]["n_errors_fn"]                  for k in keys]
    wc   = [metrics[k].get("n_errors_wrong", 0)        for k in keys]
    x    = np.arange(len(keys))
    w    = 0.22

    fig, ax = plt.subplots(figsize=(8, 4.5))
    b1 = ax.bar(x - w, fp, w, label="FP (falszywie pozytywne)", color="#D65F5F", edgecolor="white")
    b2 = ax.bar(x,     fn, w, label="FN (falszywie negatywne)", color="#E8A838", edgecolor="white")
    b3 = ax.bar(x + w, wc, w, label="Zla klasa",                color="#4878CF", edgecolor="white")
    for bars in [b1, b2, b3]:
        for bar in bars:
            h = bar.get_height()
            if h > 0:
                ax.text(bar.get_x() + bar.get_width()/2, h + 0.35,
                        str(int(h)), ha="center", va="bottom", fontsize=9, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels(NAMES)
    ax.set_ylabel("Liczba bledow")
    ax.set_title("Bledy klasyfikacji (zbior testowy, n=120)")
    ax.legend(fontsize=9)
    ax.yaxis.grid(True, linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(FIGDIR / "fig_error_analysis.pdf", bbox_inches="tight")
    plt.close(fig)
    print(f"  Zapisano: fig_error_analysis.pdf")


# ── Wykres 6: Macierze pomylek ───────────────────────────────────────────────

def fig_confusion_matrices(metrics: dict) -> None:
    try:
        import seaborn as sns
        has_sns = True
    except ImportError:
        has_sns = False

    keys   = ["baseline", "presidio", "herbert", "hybrid"]
    titles = ["Modul A (Regulowy)", "Modul B (Presidio)",
              "Modul C (HerBERT)",  "Modul D (Hybrydowy)"]

    fig, axes = plt.subplots(2, 2, figsize=(11, 9))
    for ax, key, title in zip(axes.flatten(), keys, titles):
        cm = np.array(metrics[key]["confusion_matrix"])
        if has_sns:
            sns.heatmap(cm, annot=True, fmt="d", ax=ax,
                        xticklabels=LABELS, yticklabels=LABELS,
                        cmap="Blues", linewidths=0.5,
                        annot_kws={"size": 12})
        else:
            ax.imshow(cm, cmap="Blues")
            for i in range(4):
                for j in range(4):
                    ax.text(j, i, str(cm[i, j]), ha="center", va="center",
                            color="black" if cm[i, j] < cm.max() * 0.6 else "white",
                            fontsize=12, fontweight="bold")
            ax.set_xticks(range(4)); ax.set_xticklabels(LABELS)
            ax.set_yticks(range(4)); ax.set_yticklabels(LABELS)
        ax.set_title(title, pad=8)
        ax.set_xlabel("Przewidziana klasa")
        ax.set_ylabel("Prawdziwa klasa")

    fig.suptitle("Macierze pomylek — zbior testowy (n=120)", fontsize=13, y=1.01)
    fig.tight_layout()
    fig.savefig(FIGDIR / "fig_confusion_matrices.pdf", bbox_inches="tight")
    plt.close(fig)
    print(f"  Zapisano: fig_confusion_matrices.pdf")


# ── Wykres 7: Progresja F1 ───────────────────────────────────────────────────

def fig_f1_progression(metrics: dict) -> None:
    keys = ["baseline", "presidio", "herbert", "hybrid"]
    f1s  = [metrics[k]["macro_f1"] for k in keys]
    x    = np.arange(len(keys))

    fig, ax = plt.subplots(figsize=(7, 4.5))
    ax.plot(x, f1s, "o-", color="#2C4E8A", linewidth=2.5, markersize=9,
            markerfacecolor="white", markeredgewidth=2.5)
    for xi, f1 in zip(x, f1s):
        ax.text(xi, f1 + 0.022, f"{f1:.4f}", ha="center", va="bottom",
                fontsize=10, fontweight="bold")
    for i in range(1, len(f1s)):
        delta = f1s[i] - f1s[i-1]
        mx    = (x[i] + x[i-1]) / 2
        my    = (f1s[i] + f1s[i-1]) / 2
        ax.text(mx, my + 0.030, f"+{delta:.4f}", ha="center", fontsize=8.5,
                color="#D65F5F", fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels(NAMES)
    ax.set_ylim(0.15, 1.12)
    ax.set_ylabel("Makro F$_1$")
    ax.set_title("Progresja makro F$_1$: A $\\rightarrow$ B $\\rightarrow$ C $\\rightarrow$ D")
    ax.yaxis.grid(True, linestyle="--", alpha=0.4)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(FIGDIR / "fig_f1_progression.pdf", bbox_inches="tight")
    plt.close(fig)
    print(f"  Zapisano: fig_f1_progression.pdf")


# ── Tabele LaTeX ─────────────────────────────────────────────────────────────

HEADER = "% AUTO-GENEROWANY -- nie edytuj recznie!\n% Zrodlo: experiments/evaluation/generate_figures.py\n"


def write_per_class_table(path: Path, m: dict, caption: str, label: str) -> None:
    pc = m["per_class"]
    lines = [HEADER,
             r"\begin{table}[H]", r"\centering",
             f"\\caption{{{caption}}}", f"\\label{{{label}}}",
             r"\renewcommand{\arraystretch}{1.2}",
             r"\begin{tabular}{lrrrr}", r"\hline",
             r"\textbf{Klasa} & \textbf{Precyzja} & \textbf{Pelnosc} & "
             r"\textbf{F\textsubscript{1}} & \textbf{N} \\", r"\hline"]
    for lbl in LABELS:
        c = pc[lbl]
        lines.append(f"{lbl} & {fmt(c['precision'])} & {fmt(c['recall'])} & "
                     f"{fmt(c['f1'])} & {int(c['support'])} \\\\")
    lines += [r"\hline",
              f"\\textbf{{Makro}} & {fmt(macro_p(m))} & {fmt(macro_r(m))} & "
              f"{fmt(m['macro_f1'])} & 120 \\\\",
              r"\hline", r"\end{tabular}", r"\end{table}"]
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  Zapisano: {path.name}")


def write_comparison_table(path: Path, metrics: dict) -> None:
    rows = [
        ("baseline", "System regulowy (A)"),
        ("presidio", "\\presidio\\ + Regex (B)"),
        ("herbert",  "Fine-tuned \\herbert\\ (C)"),
        ("hybrid",   "Hybrydowy B+C (D)"),
    ]
    lines = [HEADER,
             r"\begin{table}[H]", r"\centering",
             r"\caption{Zbiorcze porownanie skutecznosci czterech podejsc}",
             r"\label{tab:comparison}",
             r"\renewcommand{\arraystretch}{1.2}",
             r"\begin{tabular}{lrrrr}", r"\hline",
             r"\textbf{Podejscie} & \textbf{Precyzja} & \textbf{Pelnosc} & "
             r"\textbf{F\textsubscript{1}} & \textbf{Dokladnosc} \\", r"\hline"]
    for key, label in rows:
        m = metrics[key]
        lines.append(f"{label} & {fmt(macro_p(m))} & {fmt(macro_r(m))} & "
                     f"{fmt(m['macro_f1'])} & {fmt(m['accuracy'])} \\\\")
    lines += [r"\hline", r"\end{tabular}", r"\end{table}"]
    path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  Zapisano: {path.name}")


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print("Wczytywanie danych...")
    metrics = load()

    print("\nGenerowanie wykresow (chapters/figures/):")
    fig_macro_comparison(metrics)
    fig_per_class_f1(metrics)
    fig_prf_comparison(metrics)
    fig_hybrid_routing(metrics)
    fig_error_analysis(metrics)
    fig_confusion_matrices(metrics)
    fig_f1_progression(metrics)

    print("\nGenerowanie tabel LaTeX (chapters/tables_auto/):")
    write_per_class_table(TABDIR / "baseline_metrics.tex", metrics["baseline"],
                          "Metryki per klasa --- Modul A (system regulowy)", "tab:baseline-metrics")
    write_per_class_table(TABDIR / "presidio_metrics.tex", metrics["presidio"],
                          "Metryki per klasa --- Modul B (Presidio + Regex)", "tab:presidio-metrics")
    write_per_class_table(TABDIR / "herbert_metrics.tex",  metrics["herbert"],
                          "Metryki per klasa --- Modul C (fine-tuned HerBERT)", "tab:herbert-metrics")
    write_per_class_table(TABDIR / "hybrid_metrics.tex",   metrics["hybrid"],
                          "Metryki per klasa --- Modul D (hybrydowy B+C)", "tab:hybrid-metrics")
    write_comparison_table(TABDIR / "comparison.tex", metrics)

    print("\nGotowe.")


if __name__ == "__main__":
    main()
