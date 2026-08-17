# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import httpx

ML_SERVICE_URL = "http://localhost:8000"

test_messages = [
    # TOXIC - ogolna toksycznosc
    {"message": "You are absolutely worthless and nobody likes you.", "category": "[TOXIC]  "},
    {"message": "This is the dumbest thing I have ever seen in my life.", "category": "[TOXIC]  "},
    {"message": "Get out of here, you pathetic loser.", "category": "[TOXIC]  "},

    # SEVERE_TOXIC - bardzo silna toksycznosc
    {"message": "I hope you die a slow and painful death you piece of garbage.", "category": "[SEVERE] "},
    {"message": "You are the most disgusting subhuman creature I have ever encountered.", "category": "[SEVERE] "},
    {"message": "Kill yourself, nobody would even notice you are gone.", "category": "[SEVERE] "},

    # OBSCENE - wulgaryzmy
    {"message": "What the f*** is wrong with you, you stupid a**hole.", "category": "[OBSCENE]"},
    {"message": "Go f*** yourself you piece of s***.", "category": "[OBSCENE]"},
    {"message": "Shut the f*** up you dumb b****.", "category": "[OBSCENE]"},

    # THREAT - grozby
    {"message": "I know where you live and I will come find you.", "category": "[THREAT] "},
    {"message": "Watch your back, I am going to make you regret this.", "category": "[THREAT] "},
    {"message": "You better pay me or something very bad will happen to you.", "category": "[THREAT] "},

    # INSULT - obrazy i zniewagi
    {"message": "You are a complete idiot, brain-dead and incompetent.", "category": "[INSULT] "},
    {"message": "Only a total moron would say something that stupid.", "category": "[INSULT] "},
    {"message": "You are a fat, ugly, brainless waste of space.", "category": "[INSULT] "},

    # IDENTITY_HATE - mowa nienawisci
    {"message": "People like you don't belong in this country, go back where you came from.", "category": "[ID_HATE]"},
    {"message": "Your kind has always been inferior, history proves it.", "category": "[ID_HATE]"},
    {"message": "Women should stay in the kitchen and stop pretending they can do real work.", "category": "[ID_HATE]"},

    # NORMALNE - nie powinny byc flagowane
    {"message": "Hey, is this item still available for purchase?", "category": "[OK]     "},
    {"message": "Can you ship it by Friday? I need it for the weekend.", "category": "[OK]     "},
    {"message": "Great seller, package arrived on time, thank you!", "category": "[OK]     "},
]


def run_tests():
    print("=" * 80)
    print("TEST ML SERVICE - English messages (all 6 categories)")
    print(f"   URL: {ML_SERVICE_URL}")
    print("=" * 80)

    try:
        response = httpx.get(f"{ML_SERVICE_URL}/health", timeout=5)
        print(f"[OK] Service running: {response.json()}\n")
    except Exception as e:
        print(f"[ERROR] Service unavailable: {e}")
        print("   Make sure docker-compose up ml-service is running!")
        return

    payload = [{"message": m["message"]} for m in test_messages]

    print("Sending messages for classification...\n")
    try:
        response = httpx.post(
            f"{ML_SERVICE_URL}/classify/batch",
            json=payload,
            timeout=60
        )
        results = response.json()
    except Exception as e:
        print(f"[ERROR] Request failed: {e}")
        return

    # Tabela wynikow
    print(f"{'Category':<12} {'Flagged?':<10} {'Top reason':<22} {'Confidence':<12} {'Message'}")
    print("-" * 115)

    flagged_count = 0
    false_positives = 0

    for test, result in zip(test_messages, results):
        is_flagged = result["is_flagged"]
        flag_str = ">> YES" if is_flagged else "   NO "
        reason = result["flag_reason"] or "-"
        confidence = f"{result['confidence']:.2%}" if result["confidence"] else "-"
        msg_short = test["message"][:50] + "..." if len(test["message"]) > 50 else test["message"]
        category = test["category"]

        print(f"{category:<12} {flag_str:<10} {reason:<22} {confidence:<12} {msg_short}")

        if is_flagged and category != "[OK]     ":
            flagged_count += 1
        if is_flagged and category == "[OK]     ":
            false_positives += 1

    total_bad = len([m for m in test_messages if m["category"] != "[OK]     "])
    total_good = len([m for m in test_messages if m["category"] == "[OK]     "])

    print("\n" + "=" * 80)
    print("SUMMARY")
    print(f"   Detected abuse:           {flagged_count}/{total_bad}")
    print(f"   False positives:          {false_positives}/{total_good}")
    print(f"   Accuracy:                 {flagged_count / total_bad * 100:.1f}%")
    print("=" * 80)

    # Szczegoly per kategoria
    print("\nRESULTS PER CATEGORY\n")
    categories = ["[TOXIC]  ", "[SEVERE] ", "[OBSCENE]", "[THREAT] ", "[INSULT] ", "[ID_HATE]"]
    for cat in categories:
        cat_messages = [(t, r) for t, r in zip(test_messages, results) if t["category"] == cat]
        cat_flagged = sum(1 for _, r in cat_messages if r["is_flagged"])
        print(f"  {cat} : {cat_flagged}/{len(cat_messages)} detected")

    # Szczegoly wszystkich etykiet
    print("\nALL LABEL SCORES PER MESSAGE\n")
    for test, result in zip(test_messages, results):
        print(f"[{test['category'].strip()}] {test['message'][:65]}")
        for label in sorted(result["all_labels"], key=lambda x: x["score"], reverse=True):
            filled = int(label["score"] * 20)
            bar = "#" * filled + "-" * (20 - filled)
            marker = " <-- FLAGGED" if label["score"] >= 0.5 else ""
            print(f"   {label['label']:<20} {label['score']:.4f}  [{bar}]{marker}")
        print()


if __name__ == "__main__":
    run_tests()
