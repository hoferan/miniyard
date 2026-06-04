---
name: new-api-explorer
description: Startet den vollständigen Workflow für einen neuen API Explorer (Brainstorm → Spec → TDD → Implement → Docs)
argument-hint: "[API-Name oder URL]"
---

# /new-api-explorer

Startet Workflow A für einen neuen **API Explorer**.

## Ablauf

**Schritt 1 – Brainstorm**
Claude stellt folgende Fragen:
1. Welche API? URL zur Dokumentation?
2. Welche Endpoints werden genutzt?
3. Braucht es einen API Key? (→ `.env.local` + Netlify Env Variable)
4. Was sieht der User? (Daten, Visualisierung, interaktive Abfrage?)
5. Fehlerfall: Was passiert wenn die API nicht antwortet?
6. Rate Limits oder Kosten zu beachten?

**Schritt 2 – Spec**
Endpoints, Request/Response-Struktur, Fehlerbehandlung, UI-Konzept.
Wartet auf Bestätigung.

**Schritt 3 – Tests zuerst**
`src/explorers/<name>/api.test.ts` – Response-Parsing, Fehlerbehandlung, Edge Cases.
Echte API-Calls werden gemockt.

**Schritt 4 – Implementierung**
`src/explorers/<name>/api.ts` → Fetching, Parsing, Sentry-Integration.
`src/explorers/<name>/index.tsx` → UI, Loading State, Error State.

**Schritt 5 – Dokumentation**
- `README.md` API Explorers-Liste aktualisieren
- `docs/tools/<name>.md` mit API-Referenz, benötigten ENV Variablen, Rate Limits
- `.env.local.example` falls neuer API Key nötig

**Schritt 6 – PR-Beschreibung**
Fertige PR-Beschreibung nach Template ausgeben.
