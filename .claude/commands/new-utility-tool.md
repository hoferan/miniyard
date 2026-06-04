---
name: new-utility-tool
description: Startet den vollständigen Workflow für ein neues Utility Tool (Brainstorm → Spec → TDD → Implement → Docs)
argument-hint: "[Tool-Name oder kurze Idee]"
---

# /new-utility-tool

Startet Workflow A für ein neues **Utility Tool** (Rechner, Umrechner, Text-Tool, etc.).

## Ablauf

**Schritt 1 – Brainstorm**
Claude stellt folgende Fragen (alle, bevor Code geschrieben wird):
1. Was soll das Tool genau berechnen / verarbeiten?
2. Welche Inputs gibt es? (Typen, Einheiten, Validierung)
3. Was ist der Output? (Zahl, Text, Liste?)
4. Gibt es eine Formel oder bekannte Logik?
5. Welche Edge Cases müssen behandelt werden? (0, negativ, leer, ungültig)
6. Wie sieht die mobile Interaktion aus? (Slider, Input-Felder, Buttons?)

**Schritt 2 – Spec**
Claude fasst schriftlich zusammen und wartet auf Bestätigung. Keine Weiterfahrt ohne OK.

**Schritt 3 – Tests zuerst**
`src/tools/<name>/logic.test.ts` mit allen Testfällen schreiben.
Tests sind rot – korrekt so.

**Schritt 4 – Implementierung**
`src/tools/<name>/logic.ts` → alle Tests grün.
`src/tools/<name>/index.tsx` → Tailwind, mobile-first.

**Schritt 5 – Dokumentation**
- `README.md` Tool-Liste aktualisieren
- `docs/tools/<name>.md` falls Logik komplex ist

**Schritt 6 – PR-Beschreibung**
Fertige PR-Beschreibung nach Template ausgeben.
