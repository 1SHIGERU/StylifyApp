# CLAUDE.md — kontekst projektu Stylify

Ten plik czyta Claude Code automatycznie przy starcie sesji w katalogu Stylify.
Zawiera kontekst, którego nie chcesz powtarzać.

## Czym jest ten projekt

**Stylify** — platforma marketplace (kod produkcyjny).

W tym repo znajduje się też **praca magisterska** opisująca rozwój komponentu
detekcji nadużyć dla Stylify. Kod systemu i tekst pracy żyją obok siebie.

Struktura katalogów (Claude Code odkrywa szczegóły sam, gdy ich potrzebuje):
- `client/` — frontend
- `server/` — backend Node.js, **zawiera istniejący system moderacji**
  oparty na regułach (keyword matching) — to jest baseline dla pracy magisterskiej
- `ml-service/` — serwis ML (nowy, w rozwoju w ramach pracy)
- `fotki produktów/` — assety, raczej nieistotne dla pracy
- `praca-magisterska/` — praca magisterska + eksperymenty ML
- `docker-compose.yaml` — orkiestracja środowiska

## Praca magisterska — kontekst

**Politechnika Śląska, Wydział AEI.** Pisana po polsku, w LaTeX-u, na oficjalnym
szablonie SZJK uczelni (autor: Krzysztof Simiński).

**Temat:** Detekcja nadużyć w czacie platformy marketplace.

**Pytanie badawcze:** *Które podejście najlepiej wykrywa nadużycia
w polskojęzycznym czacie marketplace i o ile skuteczniejsze jest ML od prostych reguł?*

**Trzy porównywane podejścia:**
- **A.** System regułowy (keyword matching) — baseline. **Już istnieje w `server/`** —
  źródło ground truth dla porównań w rozdziale 4.
- **B.** Microsoft Presidio + Regex — wykrywanie PII / obejścia platformy
- **C.** Fine-tuned HerBERT — polski model językowy (Allegro)

**Trzy kategorie nadużyć:** obejście platformy (kontakty poza), fraud (BLIK,
wyłudzenia), toksyczność (wulgaryzmy, mowa nienawiści).

## Pełny kontekst pracy magisterskiej

Drugi plik **`praca-magisterska/CLAUDE.md`** zawiera szczegółowe instrukcje
dla pracy nad samą pracą — ograniczenia szablonu uczelni, struktura rozdziałów,
schemat JSON dla wyników, czego nie modyfikować. **Przeczytaj go, gdy będziesz
pracować nad rozdziałami albo eksperymentami** — większość zadań tam trafi.

## Co wolno, czego nie wolno

### Wolno (i jest zachęcane):
- Czytać kod w `server/`, `client/`, `ml-service/` żeby pisać o nim w pracy
- Uruchamiać skrypty eksperymentów w `praca-magisterska/experiments/`
- Modyfikować rozdziały pracy w `praca-magisterska/chapters/`
- Modyfikować `praca-magisterska/config/my-settings.tex`

### NIE WOLNO (twarde reguły):
- Modyfikować plików oficjalnego szablonu uczelni:
  - `praca-magisterska/config/settings.tex`
  - `praca-magisterska/config/titlepage.tex`
  - `praca-magisterska/graf/politechnika_sl_logo_bw_pion_pl.pdf`
- Wpisywać liczb wyników eksperymentów ręcznie do LaTeX-a
  (zawsze przez `\input{chapters/tables_auto/...}`)
- Commitować zawartości `praca-magisterska/data/raw/`
  ani `praca-magisterska/data/annotated/` (RODO!)
- Modyfikować kodu produkcyjnego Stylify (`client/`, `server/`) bez wyraźnej
  prośby ode mnie — jesteśmy tu od pracy magisterskiej, nie refaktoryzacji marketplace'u

## Workflow

Praca magisterska kompiluje się przez:
```bash
cd praca-magisterska
make pdflatex      # pdflatex + bibtex + pdflatex x2
```

Eksperymenty:
```bash
cd praca-magisterska
make experiments   # uruchom wszystkie eksperymenty
make tables        # zregeneruj tabele LaTeX z wyników JSON
make all           # pełen pipeline: experiments + tables + thesis
```

Szczegóły w `praca-magisterska/README.md` i `praca-magisterska/CLAUDE.md`.

## Stan pracy

- [x] Setup projektu (szablon uczelni + pipeline eksperymentów)
- [ ] Personalizacja `main.tex` (imię, nazwisko, nr albumu, promotor, kierunek, katedra)
- [ ] Streszczenie + abstract (`chapters/00.tex`)
- [ ] Rozdział 01: Wstęp
- [ ] Rozdział 02: Analiza tematu
- [ ] Rozdział 03: Przedmiot pracy (architektura — można czytać `server/` i `ml-service/`)
- [ ] Rozdział 04: Badania
- [ ] Rozdział 05: Podsumowanie
- [ ] Bibliografia: uzupełnić dane Nguyen et al. 2025 i Nature 2025 PII
- [ ] Baseline regułowy — opisać na podstawie istniejącego kodu w `server/`
- [ ] Presidio + regex — implementacja
- [ ] Anotacja datasetu
- [ ] Fine-tuning HerBERT
- [ ] Ewaluacja porównawcza
