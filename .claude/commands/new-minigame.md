---
name: new-minigame
description: Startet den vollständigen Workflow für ein neues Minigame (Brainstorm → Spec → TDD → Implement → Docs)
argument-hint: "[Spielname oder kurze Idee]"
---

# /new-minigame

Startet Workflow A für ein neues **Minigame**.

## Ablauf

**Schritt 1 – Brainstorm**
Claude stellt folgende Fragen:
1. Was ist das Spielziel? Wie gewinnt / verliert man?
2. Wie wird gesteuert? (Touch, Tap, Tastatur, Swipe?)
3. Gibt es Punkte, Timer, oder Highscore?
4. Wie schnell / langsam ist das Spieltempo?
5. Welche Schwierigkeitsstufen (falls vorhanden)?
6. Smartphone-Ansicht: passt das Spiel auf ein kleines Display?

**Schritt 2 – Spec**
Claude fasst schriftlich zusammen: Spielziel, Mechanik, State-Modell, Rendering-Ansatz.
Wartet auf Bestätigung.

**Schritt 3 – Tests zuerst**
`src/games/<name>/logic.test.ts` – Spiellogik (State-Transitions, Score-Berechnung, Win/Lose-Bedingungen).
Kein DOM, kein React in den Tests.

**Schritt 4 – Implementierung**
`src/games/<name>/logic.ts` → reine Spiellogik, alle Tests grün.
`src/games/<name>/index.tsx` → Game Loop, Rendering, Touch-Events.

**Schritt 5 – Dokumentation**
- `README.md` Minigames-Liste aktualisieren
- Steuerung im Code kommentieren falls nicht offensichtlich

**Schritt 6 – PR-Beschreibung**
Fertige PR-Beschreibung nach Template ausgeben.
