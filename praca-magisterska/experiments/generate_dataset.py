"""
Generator syntetycznego datasetu do detekcji nadużyć w polskojęzycznym czacie marketplace.

Generuje po N przykładów dla każdej z 4 klas:
  bypass  — obejście platformy (telefon, e-mail, social media, frazy poza serwisem)
  fraud   — oszustwo (BLIK, IBAN, phishing, zaliczki)
  toxic   — toksyczność (wulgaryzmy, groźby, mowa nienawiści)
  benign  — normalne wiadomości marketplace

Wyjście: data/processed/{dataset,train,val,test}.jsonl
"""

import json
import random
import re
from pathlib import Path

random.seed(42)

OUT_DIR = Path(__file__).parent.parent / "data" / "processed"
OUT_DIR.mkdir(parents=True, exist_ok=True)

N_PER_CLASS = 300  # docelowo: 300 każda klasa = 1200 łącznie


# ---------------------------------------------------------------------------
# Helpers — losowe "realistyczne" wartości
# ---------------------------------------------------------------------------

def phone():
    prefixes = ["500","501","502","503","504","505","506","507","508","509",
                "510","511","512","513","514","515","516","517","518","519",
                "600","601","602","603","604","605","606","607","608","609",
                "660","661","662","663","664","665","666","700","730","731",
                "732","733","734","735","736","737","738","739","780","781",
                "782","783","784","785","786","787","788","789","790","791"]
    p = random.choice(prefixes)
    rest = f"{random.randint(100,999)}{random.randint(100,999)}"
    fmt = random.choice([
        f"{p}{rest}",
        f"{p} {rest[:3]} {rest[3:]}",
        f"{p}-{rest[:3]}-{rest[3:]}",
        f"+48{p}{rest}",
        f"+48 {p} {rest[:3]} {rest[3:]}",
        f"+48{p} {rest[:3]} {rest[3:]}",
    ])
    return fmt

def email():
    names = ["jan.kowalski","anna.nowak","piotr.wisniewski","maria.wojcik",
             "adam.kaminski","karolina.lewandowska","tomasz.zielinski",
             "agnieszka.szymanska","michal.wozniak","barbara.kozlowska",
             "pawel.jankowski","katarzyna.wojciechowska","marek.kwiatkowski",
             "monika.kaczmarek","lukasz.mazur","justyna.piotrowska",
             "krzysztof.grabowski","aleksandra.nowicka","rafal.pawlowski",
             "ewa.michalska","user123","sprzedaje2024","kup.od.mnie",
             "kontakt.handel","transakcja.ok"]
    domains = ["gmail.com","wp.pl","onet.pl","interia.pl","o2.pl","poczta.fm",
               "yahoo.com","outlook.com","hotmail.com","protonmail.com"]
    return f"{random.choice(names)}@{random.choice(domains)}"

def iban():
    return f"PL{random.randint(10,99)}{''.join([str(random.randint(0,9)) for _ in range(26)])}"

def blik():
    return str(random.randint(100000, 999999))

def handle():
    parts = ["jan","anna","piotr","maria","adam","karol","tomek","aga",
             "michal","bartek","pawel","kasia","marek","monika","lukasz",
             "krzysztof","rafal","ewa","marcin","joanna","olx","sprzedam",
             "kupię","handel","okazja","tanio","szybko"]
    style = random.choice([
        f"{random.choice(parts)}{random.randint(1,999)}",
        f"{random.choice(parts)}_{random.choice(parts)}",
        f"{random.choice(parts)}.{random.choice(parts)}",
        f"{random.choice(parts)}{random.choice(parts)}{random.randint(10,99)}",
    ])
    return style

def city():
    return random.choice(["Warszawa","Kraków","Wrocław","Gdańsk","Poznań",
                           "Katowice","Łódź","Lublin","Szczecin","Bydgoszcz",
                           "Białystok","Gdynia","Rzeszów","Toruń","Sosnowiec"])

def item():
    return random.choice([
        "kurtkę","buty","telefon","laptop","rower","hulajnogę","kanapę",
        "krzesła","stół","książki","ubrania","zegarek","torebkę","perfumy",
        "zabawki","klocki lego","konsolę","telewizor","aparat fotograficzny",
        "gitarę","szafkę","lustro","dywany","garnki","płyty winylowe",
        "narty","deskorolkę","wózek dziecięcy","fotelik samochodowy"])

def price():
    return random.choice([
        f"{random.randint(10,50)} zł",
        f"{random.randint(50,200)} zł",
        f"{random.randint(200,1000)} zł",
        f"{random.randint(1000,5000)} zł",
        f"{random.randint(10,500)}",
    ])

def social(platform=None):
    platforms = {
        "instagram": random.choice(["insta","instagram","ig","instatagram"]),
        "snapchat":  random.choice(["snap","snapchat","sc"]),
        "telegram":  random.choice(["telegram","tg","tlgrm"]),
        "whatsapp":  random.choice(["whatsapp","whats","wa","watsap"]),
        "tiktok":    random.choice(["tiktok","tt","tik tok"]),
        "facebook":  random.choice(["facebook","fb","fejsbuk"]),
    }
    if platform:
        return platforms[platform]
    return random.choice(list(platforms.values())), random.choice(list(platforms.keys()))

def fake_link():
    domains = ["inpost-odbiorca.pl","allegro-platnosc.net","olx-weryfikacja.com",
               "odbiór-paczki.pl","platnosc-allegro.xyz","dostawa-inpost.net",
               "weryfikacja-konta.pl","potwierdzenie-platnosci.com"]
    return f"https://{random.choice(domains)}/{random.randint(1000,9999)}"


# ---------------------------------------------------------------------------
# Generatory przykładów per klasa
# ---------------------------------------------------------------------------

def gen_bypass() -> list[str]:
    examples = []

    # --- Telefon (bezpośrednie podanie numeru) ---
    phone_intros = [
        "Mój numer to", "Zadzwoń pod", "Tel:", "Numer:", "Kontakt:",
        "Dzwoń na", "Możesz dzwonić", "Zadzwoń do mnie:", "Mój tel to",
        "Numer telefonu:", "Napisz albo zadzwoń:", "Kontakt telefoniczny:",
    ]
    for _ in range(40):
        intro = random.choice(phone_intros)
        examples.append(f"{intro} {phone()}")

    phone_contexts = [
        "Napisz na whatsapp {ph}",
        "Kontaktuj się przez whatsapp: {ph}",
        "Whatsapp: {ph}",
        "WA {ph}",
        "Viber {ph}",
        "Kontakt viber: {ph}",
        "Możemy gadać na watsapie pod {ph}",
        "Napisz na watsap {ph} to dogadamy szczegóły",
        "Pod tym numerem jestem na whatsapp {ph}",
    ]
    for _ in range(25):
        t = random.choice(phone_contexts)
        examples.append(t.format(ph=phone()))

    # --- E-mail ---
    email_intros = [
        "Napisz na maila:", "Mail:", "E-mail:", "Kontakt mailowy:",
        "Wyślij na:", "Adres email:", "Mój mail to", "Pisz na maila",
        "Możesz napisać na:", "Kontakt: mail", "Email kontaktowy:",
    ]
    for _ in range(30):
        intro = random.choice(email_intros)
        examples.append(f"{intro} {email()}")

    # --- Instagram ---
    ig_templates = [
        "Dodaj mnie na insta @{h}",
        "Mój instagram to @{h}",
        "instagram: @{h}",
        "ig: @{h}",
        "Znajdziesz mnie na instagramie jako @{h}",
        "Napisz na ig @{h}",
        "@{h} — tam jestem na instagramie",
        "Mój insta @{h} pisz tam",
        "instagram @{h}",
        "Insta: {h}",
        "Na instagramie jestem {h} możemy tam pogadać",
    ]
    for _ in range(25):
        examples.append(random.choice(ig_templates).format(h=handle()))

    # --- Snapchat ---
    snap_templates = [
        "Snapchat: {h}",
        "Snap: {h}",
        "Mój snap to {h}",
        "Dodaj na snapie: {h}",
        "sc: {h}",
        "Snapchat {h} tam dogadamy",
    ]
    for _ in range(15):
        examples.append(random.choice(snap_templates).format(h=handle()))

    # --- Telegram ---
    tg_templates = [
        "Telegram: @{h}",
        "tg: @{h}",
        "Napisz na telegramie @{h}",
        "Jestem na tg jako @{h}",
        "Mój telegram @{h}",
    ]
    for _ in range(15):
        examples.append(random.choice(tg_templates).format(h=handle()))

    # --- TikTok / inne ---
    other_templates = [
        "TikTok: @{h}",
        "tiktok: {h}",
        "FB: {h}",
        "Facebook: {h}",
        "Mój fejsbuk to {h}",
    ]
    for _ in range(15):
        examples.append(random.choice(other_templates).format(h=handle()))

    # --- Frazy bypass bez danych kontaktowych ---
    bypass_phrases = [
        "Dogadajmy się poza serwisem, będzie szybciej",
        "Możemy to załatwić bez pośrednika",
        "Zapłać mi bezpośrednio, po co te prowizje",
        "Przenieśmy transakcję poza platformę",
        "Na priv możemy ustalić cenę",
        "Napisz na priv to pogadamy",
        f"Wpadnij do mnie do {city()}, bez wysyłki taniej",
        "Zapłać gotówką przy odbiorze, bez platformy",
        "Możemy się umówić bezpośrednio, nie przez aplikację",
        "Lepiej bez platformy, zaoszczędzisz na prowizji",
        "Piszcie na priv nie tutaj",
        "Dogadamy się na priv będzie okej",
        "Napisz prywatnie to powiem gdzie jestem",
        f"Odezwij się poza tym serwisem, tu nie chcę rozmawiać",
        "Transakcja poza aplikacją, normalnie przez przelew",
        f"Mogę sprzedać bezpośrednio, bez portalu, zaoszczędzisz",
        "Zróbmy to z ręki do ręki, bez pośredników",
        "Przelej mi na konto bezpośrednio bez tej platformy",
        "Piszemy poza tym serwisem okej?",
        "Nie chcę przez platformę, za drogo dla nas obojga",
        "Możemy się dogadać inaczej niż przez portal",
        f"Spotkajmy się w {city()} i robimy bez portalu",
        "Napisz w prywatnej wiadomości",
        "Dogadajmy się prywatnie",
        "Lepsza cena jak nie przez serwis",
        "Płatność bezpośrednio na konto, bez platformy",
        "Sprzedam taniej poza portalem",
        "Piszemy prywatnie, tu za dużo ludzi widzi",
        "Kontaktujemy się bez tego serwisu",
        "Bez pośrednika taniej dla obu stron",
    ]
    for phrase in bypass_phrases:
        examples.append(phrase)

    # --- Fragmenty (odwzorowanie tur: bypass podzielony na kilka wiadomości) ---
    fragmented = [
        f"mój numer to {phone()} napisz",
        f"zadzwoń pod {phone()}",
        f"tel {phone()} tam wszystko wyjaśnię",
        f"@{handle()} tu jestem na ig",
        f"instagram @{handle()}",
        f"mail do mnie: {email()}",
        f"{phone()} whatsapp",
        f"kontakt: {email()}",
        f"snap {handle()} tam pogadamy",
        f"telegram @{handle()}",
        f"pisz na {email()} chętnie sprzedam",
        f"numer: {phone()} zadzwoń wieczorem",
    ]
    for f_ex in fragmented:
        examples.append(f_ex)

    # Shuffle i uzupełnij wariacjami do N
    random.shuffle(examples)
    base_pool = examples[:]
    while len(examples) < N_PER_CLASS:
        base = random.choice(base_pool)
        variation = random.choice([
            base + ".",
            base + "?",
            "Hej, " + base.lower(),
            base + " ok?",
            base + " daj znać",
            base + " — odpisz",
            "Słuchaj, " + base.lower(),
            base + " ;)",
        ])
        examples.append(variation)
    return examples[:N_PER_CLASS]


def gen_fraud() -> list[str]:
    examples = []

    # --- BLIK ---
    blik_templates = [
        "Wyślij mi kod BLIK {bk} to przelew gotowy",
        "Podaj kod BLIK to opłacę od razu",
        "Możesz mi podać blik? Najszybciej tak",
        "Kod BLIK {bk} — wpisujesz to i masz przelew",
        "Wyślij BLIK {bk}",
        "Blik: {bk}, wpisz do aplikacji",
        "Mój kod blik to {bk} wyślij taki sam",
        "Podaj mi kod z aplikacji, 6 cyfr",
        "Potrzebuję twój kod BLIK żeby opłacić",
        "Jaki masz BLIK? Przelew BLIK najszybszy",
        "Wyślij mi kod blik ({bk}) potwierdzę transakcję",
        "BLIK: {bk} — kliknij zatwierdź w aplikacji",
        "Podaj kod blik, {bk} to przykład jak wygląda",
        "Zapłacę przez BLIK, wyślij swój kod",
        "Kod do blika: {bk}, zatwierdź w telefonie",
        "Błyskawiczny przelew przez BLIK — podaj kod",
        "Wyślij BLIK to masz pieniądze od razu {bk}",
        "Przelewam BLIKiem, potrzebuję twój kod",
        "BLIK mi wyślij to gotowe {bk}",
        "Zapłać BLIK-iem, podaj mi ten 6-cyfrowy kod",
    ]
    for _ in range(60):
        bk = blik()
        examples.append(random.choice(blik_templates).format(bk=bk))

    # --- IBAN ---
    iban_templates = [
        "Przelej na: {ib}",
        "Numer konta: {ib}",
        "Konto do przelewu: {ib}",
        "Wpłać na konto {ib}",
        "IBAN: {ib}",
        "Przelew na {ib} właściciel Jan Kowalski",
        "Przelej {price} na {ib}",
        "Konto bankowe: {ib} — przelej zaliczkę",
        "Nr konta: {ib}, tytuł: zaliczka",
        "Wpłać zaliczkę na {ib}",
        "Rachunek: {ib} przelej kasę",
        "Mój numer konta to {ib} przelej ile ustaliliśmy",
        "Dane do przelewu: {ib}",
        "Konto {ib} — jak przelew przyjdzie wyślę",
        "Transfer na: {ib}",
        "Przelej na moje konto {ib} a ja wysyłam",
        "Płatność przelewem: {ib}",
        "Na ten numer konta proszę: {ib}",
        "Mój IBAN: {ib} możesz przelać",
        "Nr rachunku: {ib}",
    ]
    for _ in range(60):
        ib = iban()
        pr = price()
        examples.append(random.choice(iban_templates).format(ib=ib, price=pr))

    # --- Phishing linki ---
    phishing_templates = [
        "Kliknij tu żeby odebrać paczkę: {link}",
        "Twoja paczka czeka na potwierdzenie: {link}",
        "Odbiór InPost — kliknij: {link}",
        "Allegro prosi o weryfikację: {link}",
        "Potwierdź dane do odbioru: {link}",
        "Link do płatności: {link}",
        "Opłać wysyłkę tutaj: {link}",
        "Weryfikacja konta: {link}",
        "Musisz potwierdzić zamówienie: {link}",
        "Paczka zablokowana — odblokuj: {link}",
        "Dopłać {price} za ubezpieczenie paczki: {link}",
        "Twój kurier czeka, potwierdź adres: {link}",
        "Płatność za pobraniem przez internet: {link}",
        "Odbierz wygraną nagrodę: {link}",
        "OLX smart — zweryfikuj transakcję: {link}",
        "Allegro smart weryfikacja wymagana: {link}",
        "Inpost locker kod odbioru: {link}",
    ]
    for _ in range(50):
        examples.append(random.choice(phishing_templates).format(
            link=fake_link(), price=price()
        ))

    # --- Zaliczka / scam przed wysyłką ---
    advance_templates = [
        f"Musisz wpłacić zaliczkę {price()} żeby zarezerwować",
        f"Wpłać {price()} zadatku to odkładam na bok",
        "Przelej zadatek a wysyłam od razu",
        f"Zaliczka {price()} wymagana, reszta przy odbiorze",
        "Mam kilku chętnych, kto pierwszy wpłaci zaliczkę dostaje",
        f"Bez zaliczki nie rezerwuję, minimalna to {price()}",
        "Przelej mi coś na zaliczkę, dowolną kwotę",
        "Wysyłam jak zobaczę zaliczkę na koncie",
        f"Transakcja pewna jak wpłacisz {price()} z góry",
        f"Pierwsze {price()} z góry, reszta jak paczka dojdzie",
        "Zapłać z góry to wysyłam tego samego dnia",
        "Połowę teraz, połowę po odbiorze — tak działamy",
        f"Rezerwacja: {price()} zaliczka bezzwrotna",
        "Jeśli chcesz żebym czekał, przelej zaliczkę",
        "Kilka osób chce to kupić, zaliczka decyduje",
    ]
    for t in advance_templates:
        examples.append(t)

    # --- Przepłata (overpayment scam) ---
    overpay_templates = [
        f"Przelałem {price()} za dużo, odeślij nadwyżkę",
        "Przez pomyłkę wysłałem za dużo, oddaj resztę",
        "Mój bank przelał podwójnie, proszę o zwrot",
        f"Zapłaciłem {price()} a miało być mniej, przelej z powrotem",
        "Sprawdź czy nie masz za dużo na koncie, ode mnie",
        "Przelew się zdublował, oddaj nadwyżkę to problem banku",
        f"Musiałem przelać {price()} ale to za dużo, odeślij połowę",
    ]
    for t in overpay_templates:
        examples.append(t)

    # --- Dane karty ---
    card_templates = [
        "Podaj numer karty to przelew natychmiast",
        "CVV i numer karty — szybka płatność",
        "Potrzebuję 16 cyfr karty i datę ważności",
        "Płacę kartą, podaj numer i CVV",
        "Wyślij dane karty to zakup potwierdzony",
        "Jaki masz numer na karcie? CVV też",
        "Podaj numer karty kredytowej, zapłacę teraz",
    ]
    for t in card_templates:
        examples.append(t)

    random.shuffle(examples)
    base_pool = examples[:]
    while len(examples) < N_PER_CLASS:
        base = random.choice(base_pool)
        variation = random.choice([
            base + ".",
            base + "!",
            "Uwaga: " + base.lower(),
            base + " Sprawdź.",
            base + " Potwierdź.",
            base + " — odpowiedz.",
        ])
        examples.append(variation)
    return examples[:N_PER_CLASS]


def gen_toxic() -> list[str]:
    examples = []

    # --- Wulgaryzmy i obelgi (ogólne) ---
    insults_direct = [
        "Ty idioto, kto ci powiedział że to tyle warte",
        "Jesteś kompletnym debilem",
        "Co za kretyn z ciebie",
        "Zamknij się, głupku",
        "Ty cwaniaku, nie wierzę w ani jedno słowo",
        "Ale z ciebie baran",
        "Absolutny idiota, szkoda czasu",
        "Nie gadaj głupot, debilu",
        "Co ty za bzdury piszesz, kretynie",
        "Ty skończony durnień",
        "Co za palant z ciebie",
        "Odp*** się ode mnie",
        "Pier*** się z tą ceną",
        "Sp*** stąd z takimi ofertami",
        "Co ty za śmieć sprzedajesz",
        "Ty złodzieju, co to za cena",
        "Jaki ty jesteś głupi, serio",
        "Nie gadaj głupot debilu",
        "Ty skończony półgłówku",
        "Idź się lecz",
        "Ty chamie, jak można tak rozmawiać",
        "Oszust z ciebie jakiś",
        "Ty matole, ta cena to żart",
        "Co za bezczelność, wynoś się",
        "Ty śmieciu, nie wracaj tu",
        "Co ty za bydlę jesteś",
        "Ty baranie, nie rozumiesz polskiego?",
        "Skończ z tymi głupotami idioto",
        "Co za mendę z ciebie",
        "Ty kłamco, nic nie mówisz prawdy",
    ]
    examples.extend(insults_direct)

    # --- Obelgi z kontekstem transakcyjnym ---
    insults_context = [
        f"Ta cena to żart, ty debilem chyba jesteś",
        "Takich złodziei jak ty trzeba zgłaszać",
        "Ty oszuście, gdzie mój towar",
        "Czekam tydzień i nic, ty idioto",
        "Wystawiłeś śmiecia a piszesz że nowy, kłamca",
        "Co za bezczelny złodziej, oddaj kasę",
        "Kupiłem graty od tego durnia",
        "Ty chamie, tak się nie sprzedaje",
        "Sprzedajesz g**** a nie produkt",
        "Zepsuty towar i jeszcze nie odbiera, idiota",
        f"Ty świniu, zwróć mi pieniądze",
        "Ten sprzedawca to kompletny dureń",
        "Co za bzdury piszesz, nie masz pojęcia",
        "Ty chuju, wystawiasz fejk opinie",
        "Łachudra, nie dotrzymałeś słowa",
        "Co za gnojek z tego sprzedawcy",
        "Ty ośle, nie wiesz nawet co sprzedajesz",
        "Wyp*** z tą ofertą",
        "Ta oferta to ściema od gł***",
        "Ty bydlaku, zwracaj kasę",
        "Śmieć nie towar, ty oszuście",
        f"Co za sc*** oferta, wstydź się",
        "Debil wystawił ten produkt",
        "Ty krętaczu, znowu kłamiesz",
        "Kupowanie od ciebie to strata czasu, idioto",
    ]
    examples.extend(insults_context)

    # --- Groźby ---
    threats = [
        "Lepiej oddaj kasę bo pożałujesz",
        "Zwróć mi pieniądze albo będziesz miał kłopoty",
        "Wiem gdzie mieszkasz, uważaj na siebie",
        "Nie żartuj ze mną, pożałujesz tego",
        "Jak nie oddasz kasy to ci obiecuję problemy",
        "Zgłoszę cię wszędzie i zniszczę ci życie",
        "Mam twój adres z paczki, pamiętaj o tym",
        "Przyjadę do ciebie i odegnam swoje pieniądze",
        "Nie musisz zgłaszać bo i tak cię znajdę",
        "Będziesz żałował że mnie okradłeś",
        "Jeszcze pożałujesz tej transakcji",
        "Masz ostatnią szansę, bo inaczej będzie źle",
        "Znam twoje dane, lepiej mi zapłać",
        "Nie żartuj, albo oddasz albo będzie źle",
        "Widzę gdzie się logowałeś, uważaj",
        "Zgłoszę cię policji i do rodziny",
        "Znajdę cię przez te dane co mam",
        "Pożałujesz jeśli nie oddasz moich pieniędzy",
        "Wiem kto ty jesteś, nie uciekniesz",
        "Lepiej spłać lub znikaj z miasta",
    ]
    examples.extend(threats)

    # --- Mowa nienawiści / dyskryminacja ---
    hate_speech = [
        "Nie kupuję od takich jak ty",
        "Typowe dla waszego sortu — kradniecie wszyscy",
        "Nie ufam takim osobom z twojej okolicy",
        "Tacy jak wy zawsze oszukują",
        "Wy wszyscy jesteście złodziejami",
        "Nie sprzedaję biedniakom co targują się o każdą złotówkę",
        "Typowy Polaczek — wszystko tanio i byle jak",
        "Ze wsi to i nie rozumiesz jak działają transakcje",
        "Tacy oszuści to powinni siedzieć",
        "Twoja kategoria ludzi nie jest godna zaufania",
        "Wszyscy sklepikarze to złodzieje",
        "Nie ufam kupującym z twoich stron",
        "Wy wschodni to wszyscy tacy sami",
        "Biedota targuje się jak na targu",
        "Z takimi nie warto gadać, zero klasy",
    ]
    examples.extend(hate_speech)

    # --- Ogólna agresja / spam agresywny ---
    aggressive = [
        "Nie odpisujesz?! ODPOWIEDZ NATYCHMIAST",
        "Czekam już 30 minut, co to za bałagan",
        "ZWRÓĆ KASĘ TERAZ",
        "Nie próbuj mnie ignorować",
        "Odpiszesz czy mam zgłosić?",
        "Ostatni raz pytam zanim zgłoszę",
        "Ty mnie zdenerwujesz za bardzo",
        "Wkurwiasz mnie tym milczeniem",
        "Co to za trollowanie, odpiszesz czy nie",
        "Nie wkur*** mnie bardziej",
        "Jesteś nikim do robienia interesów",
        "Z tobą nie da się gadać normalnie",
        "Koniec rozmowy, ty patafian",
        "Co za żenada, ty i ta oferta",
        "Kompletnie nie da się z tobą gadać",
        "Tracę czas na takich jak ty",
        "Zniszczyłem lepszych niż ty",
        "Mam na ciebie sposób",
        "Odstawić takiego cwaniaka",
        "Nie ma na to siły, co za kretyn",
        "Ty i twoja oferta to żenada",
        "Nie możesz normalnie?! Co z tobą",
        "Zero szacunku, zero klasy",
        "Wkur***sz mnie do reszty",
        "Nie rozmawiaj ze mną tak więcej",
    ]
    examples.extend(aggressive)

    # Shuffle i uzupełnij do N
    random.shuffle(examples)
    # Uzupełnij powtórkami z wariacjami jeśli za mało
    while len(examples) < N_PER_CLASS:
        base = random.choice(examples[:80])
        # drobna wariacja: dodaj wykrzyknik, zmień wielkość, dodaj "!!"
        variation = random.choice([
            base + "!",
            base + "!!",
            base.upper(),
            base.capitalize(),
            "Słuchaj, " + base.lower(),
            base + " Serio.",
        ])
        examples.append(variation)
    return examples[:N_PER_CLASS]


def gen_benign() -> list[str]:
    examples = []

    items = [item() for _ in range(200)]

    # --- Pytania o produkt ---
    product_questions = [
        f"Czy {random.choice(items)} jest jeszcze dostępne?",
        f"Jaki jest stan techniczny tego produktu?",
        f"Czy możliwa jest wysyłka do {city()}?",
        f"Ile to waży? Pytam ze względu na wysyłkę",
        f"Czy {random.choice(items)} ma jakieś wady lub zarysowania?",
        f"Jak długo używane? Czy jest paragon lub gwarancja?",
        f"Czy to oryginał czy podróbka?",
        f"Zdjęcia są aktualne? Kiedy zrobione?",
        f"Z jakiego roku jest ten produkt?",
        f"Czy możesz zrobić więcej zdjęć?",
        f"Co jest dołączone do zestawu?",
        f"Czy produkt był naprawiany?",
        f"Jak działa, wszystko sprawne?",
        f"Dlaczego sprzedajesz?",
        f"Jak duże wymiary?",
        f"Czy mogę sprawdzić przy odbiorze?",
        f"Czy jest możliwość zwrotu jeśli coś nie pasuje?",
        f"Ile czasu używałeś/aś?",
        f"Gdzie kupiony i za ile?",
        f"Czy kabel/ładowarka są w komplecie?",
    ]
    for _ in range(60):
        examples.append(random.choice(product_questions))

    # --- Negocjacje ceny ---
    price_negotiations = [
        f"Czy możliwa jakaś obniżka? Proponuję {price()}",
        f"Mogę dać {price()}, czy to do przyjęcia?",
        f"Ostateczna cena to {price()}? Czy jest margines?",
        f"Za {price()} biorę od ręki",
        f"Cena jest do negocjacji?",
        f"Zrobisz rabat przy zakupie kilku rzeczy?",
        f"Ile zejdziesz z ceny? Mogę {price()}",
        f"Sprzedasz za {price()} i mamy deal",
        f"Trochę za drogo dla mnie, czy możesz zejść?",
        f"Oferta: {price()}, jak tak to biorę",
        f"Co byś powiedział na {price()}?",
        f"Ostatnia cena to {price()}?",
        f"Czy cena obejmuje wysyłkę?",
        f"Jak kupię dwie sztuki to masz {price()} za obie?",
        f"Mogę zapłacić {price()} od ręki, decyzja?",
        f"Czy {price()} to OK dla ciebie?",
        f"Chętnie kupię za {price()}, ale nie więcej",
        f"Za {price()} sprzedasz czy trzymasz cenę?",
        f"Cena finalna czy można gadać?",
        f"Przy szybkiej sprzedaży schodzisz do {price()}?",
    ]
    for _ in range(60):
        examples.append(random.choice(price_negotiations))

    # --- Wysyłka i logistyka ---
    shipping = [
        f"Czy wysyłasz paczkomatem?",
        f"Jakie są opcje wysyłki?",
        f"Inpost czy kurier?",
        f"Czy możliwy odbiór osobisty w {city()}?",
        f"Jak pakujesz? Bezpiecznie?",
        f"Orientacyjny czas wysyłki?",
        f"Czy cena zawiera wysyłkę?",
        f"Paczkomat czy kurier, co proponujesz?",
        f"Wysyłasz za granicę? Np. do Niemiec?",
        f"Jak szybko możesz wysłać?",
        f"Mogę odebrać osobiście w {city()}?",
        f"Wolę paczkomat jeśli można",
        f"Jakie paczkomaty w pobliżu?",
        f"Wysyłka tego samego dnia możliwa?",
        f"Który kurier? DPD, DHL czy InPost?",
        f"Jak długo wysyłka do {city()}?",
        f"Czy możesz zabezpieczyć lepiej przy wysyłce?",
        f"Czy jest śledzenie przesyłki?",
        f"Wolę odbiór osobisty w {city()} jeśli możliwe",
        f"Wysyłasz w tym tygodniu?",
    ]
    for _ in range(50):
        examples.append(random.choice(shipping))

    # --- Ogólne uprzejme wiadomości ---
    general = [
        "Dzień dobry, mam pytanie o tę ofertę",
        "Witam, czy produkt jest nadal w sprzedaży?",
        "Dzień dobry! Zainteresowany/a tym produktem",
        "Hej, czy możemy ustalić szczegóły?",
        "Cześć, kiedy możliwy odbiór?",
        "Witaj, czy możesz opisać dokładniej stan?",
        "Dzień dobry, kupuję na prezent — opakowanie OK?",
        "Cześć, interesuje mnie ta oferta",
        "Hej, jest jeszcze do kupienia?",
        "Dzień dobry, mam kilka pytań jeśli można",
        "Super oferta, mam jedno pytanie",
        "Dobry towar, ale cena wysoka. Pogadamy?",
        "Bardzo interesująca oferta",
        "Kupuję, jak płacimy?",
        "OK, dogadajmy szczegóły wysyłki",
        "Dziękuję za odpowiedź, biorę!",
        "Umówmy się na konkretną godzinę odbioru",
        "Potwierdzam zakup, kiedy wysyłka?",
        "Wszystko OK, czekam na paczkę",
        "Dostałem, dziękuję! Polecam sprzedawcę",
        f"Mieszkam w {city()}, odbiór możliwy?",
        "Przelew zrobiony, kiedy wysyłasz?",
        "Potwierdzam odbiór, wszystko się zgadza",
        "Polecam, szybka i sprawna transakcja",
        "Towar zgodny z opisem, dziękuję",
        "Kupiłem, bardzo zadowolony",
        "Świetna obsługa, polecam!",
        "Szybka realizacja, towar zadbany",
        "Wszystko gra, transakcja bez zarzutów",
        "Mega szybka wysyłka, polecam sprzedawcę",
    ]
    examples.extend(general)

    random.shuffle(examples)

    while len(examples) < N_PER_CLASS:
        examples.append(random.choice(product_questions + price_negotiations + shipping + general))

    return examples[:N_PER_CLASS]


# ---------------------------------------------------------------------------
# Zapis datasetu
# ---------------------------------------------------------------------------

def save_jsonl(path: Path, records: list[dict]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def main() -> None:
    print("Generowanie datasetu...")

    classes = {
        "bypass": gen_bypass(),
        "fraud":  gen_fraud(),
        "toxic":  gen_toxic(),
        "benign": gen_benign(),
    }

    all_records = []
    for label, texts in classes.items():
        for text in texts:
            all_records.append({
                "text":   text.strip(),
                "label":  label,
                "source": "synthetic_v1",
            })
        print(f"  {label}: {len(texts)} przykładów")

    random.shuffle(all_records)
    print(f"  Łącznie: {len(all_records)} przykładów")

    # Podział train/val/test: 80 / 10 / 10
    n = len(all_records)
    n_train = int(n * 0.80)
    n_val   = int(n * 0.10)

    train = all_records[:n_train]
    val   = all_records[n_train:n_train + n_val]
    test  = all_records[n_train + n_val:]

    save_jsonl(OUT_DIR / "dataset.jsonl", all_records)
    save_jsonl(OUT_DIR / "train.jsonl",   train)
    save_jsonl(OUT_DIR / "val.jsonl",     val)
    save_jsonl(OUT_DIR / "test.jsonl",    test)

    print(f"\nZapisano do {OUT_DIR}:")
    print(f"  dataset.jsonl : {len(all_records)}")
    print(f"  train.jsonl   : {len(train)}")
    print(f"  val.jsonl     : {len(val)}")
    print(f"  test.jsonl    : {len(test)}")

    # Statystyki
    print("\nRozkład klas w train:")
    from collections import Counter
    c = Counter(r["label"] for r in train)
    for lbl, cnt in sorted(c.items()):
        print(f"  {lbl:8s}: {cnt}")


if __name__ == "__main__":
    main()
