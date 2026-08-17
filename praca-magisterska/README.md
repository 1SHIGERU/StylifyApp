# Praca magisterska — Detekcja nadużyć w czacie marketplace

Repozytorium pracy magisterskiej (Politechnika Śląska, Wydział AEI) + eksperymenty ML.
Oparte na **oficjalnym szablonie LaTeX SZJK Politechniki Śląskiej** (autor: Krzysztof Simiński),
rozszerzonym o pipeline eksperymentów (HerBERT, Presidio, baseline regułowy)
i automatyczne generowanie tabel wyników do pracy.

Workflow asystowany przez **Claude Code** — narzędzie CLI od Anthropic, które działa
w terminalu/VS Code, ma dostęp do całego repo i może edytować pliki + uruchamiać skrypty.

## ⚠ Pliki, których NIE wolno modyfikować

Szablon uczelni narzuca formatowanie zgodne z SZJK. Te pliki zostawiamy nietknięte:

- `config/settings.tex` — pakiety, marginesy, fonty, page styles
- `config/titlepage.tex` — strona tytułowa
- `graf/politechnika_sl_logo_bw_pion_pl.pdf` — logo uczelni

**Wszystkie nasze customizacje** (dodatkowe pakiety, kolorowanie listingów Pythona,
komendy `\herbert`, `\fone`, `\presidio`) idą do **`config/my-settings.tex`**
— to jedyny dozwolony plik na modyfikacje konfiguracji.

## Setup (Windows / macOS / Linux)

### 1. LaTeX

**Windows:** zainstaluj [MiKTeX](https://miktex.org/download). Przy pierwszej kompilacji
MiKTeX dociągnie pakiety automatycznie.

**macOS:** `brew install --cask mactex` (pełny TeX Live, ~4 GB).

**Linux:** `sudo apt install texlive-full` lub minimalnie:
```
sudo apt install texlive-latex-recommended texlive-latex-extra texlive-bibtex-extra \
                 texlive-lang-polish texlive-fonts-recommended texlive-pictures lmodern
```

Sprawdź: `pdflatex --version` powinno coś wypluć.

### 2. VS Code + rozszerzenia

Otwórz repo w VS Code, zaakceptuj rekomendowane rozszerzenia (popup w prawym dolnym rogu):

- **LaTeX Workshop** (James Yu) — kompilacja, podgląd PDF, snippety
- **LTeX** (opcjonalnie) — sprawdzanie gramatyki/ortografii w polskim tekście
- **Python** (Microsoft) — dla skryptów eksperymentów
- **Ruff** — formatowanie/linting Python
- **Claude Code** (Anthropic) — integracja z Claude Code

### 3. Claude Code

Wymagany Node.js ≥ 18. Sprawdź: `node --version`.

```bash
npm install -g @anthropic-ai/claude-code
```

W katalogu projektu odpal:

```bash
cd praca-magisterska
claude
```

Pierwszy raz poprosi o zalogowanie kontem Anthropic (otwiera przeglądarkę).
Od tego momentu możesz pisać do mnie po polsku — widzę całe repo, czytam pliki,
edytuję, uruchamiam skrypty.

Plik `CLAUDE.md` w korzeniu repo zawiera kontekst projektu (temat, konwencje,
ograniczenia szablonu uczelni) — Claude Code automatycznie go czyta przy starcie sesji.

### 4. Środowisko Python

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 5. Pierwsza kompilacja LaTeX

W VS Code otwórz `main.tex`, naciśnij **Ctrl+Alt+B** (LaTeX Workshop: Build).
PDF pojawi się w `main.pdf`.

Lub z linii poleceń:
```bash
make pdflatex   # pdflatex + bibtex + pdflatex x2 (oryginalny makefile uczelni)
```

Drugi makefile (`Makefile`, z dużej litery) obsługuje nasze rozszerzenia:
```bash
make thesis        # alias dla `make pdflatex`
make experiments   # uruchom wszystkie eksperymenty
make tables        # zregeneruj tabele LaTeX z wyników JSON
make all           # pełen pipeline: experiments + tables + thesis
make clean         # wyczyść artefakty LaTeX
```

## Personalizacja

Otwórz `main.tex` i wypełnij sekcję `PERSONALIZACJA PRACY – DANE PRACY` (linie 70-97):

- `\FirstNameAuthor`, `\SurnameAuthor` — Twoje imię i nazwisko
- `\IdAuthor` — numer albumu
- `\Supervisor` — promotor (z tytułem)
- `\Program` — kierunek studiów
- `\Specialisation` — specjalność
- `\Departament` — katedra promotora
- `\Consultant` — promotor pomocniczy/opiekun (lub zostaw puste)

Tytuł pracy jest już wpisany.

## Struktura projektu

```
praca-magisterska/
├── main.tex                  # plik główny (szablon uczelni, z naszym tytułem)
├── makefile                  # ORYGINALNY makefile uczelni (nie ruszać)
├── Makefile                  # NASZ makefile (eksperymenty + thesis)
├── config/
│   ├── settings.tex          # ⚠ NIE MODYFIKOWAĆ (oficjalne formatowanie SZJK)
│   ├── titlepage.tex         # ⚠ NIE MODYFIKOWAĆ
│   └── my-settings.tex       # nasze pakiety, komendy, kolorowanie Pythona
├── chapters/                 # rozdziały (struktura narzucona przez szablon)
│   ├── 00.tex                # informacje redakcyjne (streszczenie, abstract)
│   ├── 01.tex                # Wstęp
│   ├── 02.tex                # Analiza tematu (przegląd literatury)
│   ├── 03.tex                # Przedmiot pracy (architektura systemu)
│   ├── 04.tex                # Badania (DOMINUJĄCY rozdział - wszystkie wyniki)
│   ├── 05.tex                # Podsumowanie
│   ├── 06.tex                # Dokumentacja techniczna (dodatek)
│   ├── 07.tex                # Spis skrótów i symboli (dodatek)
│   ├── 08.tex                # Lista plików dodatkowych (dodatek)
│   ├── tables_auto/          # AUTO-GENEROWANE tabele wyników (.tex)
│   └── figures/              # wykresy z matplotlib (.pdf)
├── biblio/
│   └── biblio.bib            # bibliografia (klucze: bib:nazwa)
├── graf/
│   └── politechnika_sl_logo_bw_pion_pl.pdf  # ⚠ NIE RUSZAĆ
├── experiments/              # kod eksperymentów
│   ├── baseline-rules/       # system regułowy (keyword matching)
│   ├── presidio-pii/         # Microsoft Presidio + regex
│   ├── herbert-finetuning/   # fine-tuning HerBERT
│   └── evaluation/           # porównanie modeli, generowanie tabel LaTeX
├── data/
│   ├── raw/                  # surowe dane z systemu moderacji (TP/FP) - .gitignore!
│   ├── annotated/            # po anotacji - .gitignore!
│   └── processed/            # train/val/test splits
├── results/
│   ├── metrics/              # JSON-y z wynikami każdego eksperymentu
│   └── confusion-matrices/   # macierze pomyłek
├── scripts/                  # narzędzia pomocnicze
├── requirements.txt          # zależności Python
├── .gitignore
├── .vscode/                  # konfiguracja VS Code
├── CLAUDE.md                 # kontekst projektu dla Claude Code
└── README.md                 # ten plik
```

## Kluczowy workflow: kod → wyniki → LaTeX

Zasada: **liczby w pracy nigdy nie są wpisywane ręcznie**. Każdy eksperyment kończy się
zapisem do `results/metrics/<eksperyment>.json` w jednolitym schemacie.
Skrypt `experiments/evaluation/generate_latex_tables.py` czyta JSON-y i generuje
`.tex` w `chapters/tables_auto/`. W rozdziale 04 (Badania) używasz
`\input{chapters/tables_auto/comparison.tex}` — po przetrenowaniu modelu wystarczy
`make tables && make thesis` żeby zaktualizować PDF.

Schemat JSON dla pojedynczego eksperymentu:
```json
{
  "model": "allegro/herbert-base-cased",
  "task": "abuse_detection",
  "metrics": {
    "precision": 0.912, "recall": 0.887, "f1": 0.899, "accuracy": 0.932
  },
  "training": { "epochs": 3, "batch_size": 16, "learning_rate": 2e-05 },
  "n_test_samples": 0,
  "timestamp": "2026-..."
}
```

## Praca z Claude Code — przykładowe komendy

Po odpaleniu `claude` w katalogu projektu mówisz po polsku, co chcesz:

- *„Dodaj sekcję o metodologii w rozdziale 03 - opisz baseline regułowy na podstawie kodu"*
- *„Uruchom evaluation pipeline i wstaw nowe wyniki do tabeli porównawczej"*
- *„Popraw bibliografię - uzupełnij dane Nguyen et al. 2025 (cytowanie bib:bypass)"*
- *„Skompiluj pracę i pokaż mi pierwsze błędy LaTeX-a"*
- *„Sekcja 4.5 jest za długa, skróć do 1 strony"*

Czytam wszystkie pliki, więc nie musisz mi nic kopiować.
