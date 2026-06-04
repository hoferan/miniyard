# miniyard – Claude Code Instructions

## Projektübersicht

**miniyard** ist eine modulare Playground-Applikation mit drei Kategorien:

| Kategorie | Beschreibung | Pfad |
|---|---|---|
| **Utility Tools** | Rechner, Umrechner, Text-Tools, mathematische Funktionen | `src/tools/` |
| **Minigames** | Browser-Spiele, Mobile-first | `src/games/` |
| **API Explorers** | Hands-on Demos mit öffentlichen APIs | `src/explorers/` |

Solo-Entwickler. Lern- und Showcase-Projekt.

### Stack
- **Framework:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Testing:** Jest + React Testing Library
- **Hosting:** Netlify mit PR Preview Deployments
- **Error Tracking:** Sentry
- **Code Review:** CodeRabbit (automatisch auf jedem PR)
- **Dependencies:** Dependabot (wöchentlich, Montag)

### Branch-Strategie
Ausschliesslich `main`. **Kein direkter Push.** Jede Änderung via PR.

---

## Projektstruktur

```
src/
  app/                        # Next.js App Router Pages & Layouts
  components/                 # Geteilte UI-Komponenten
  tools/
    <tool-name>/
      index.tsx               # React UI-Komponente
      logic.ts                # Reine Logik – kein React, kein DOM
      logic.test.ts           # Tests für logic.ts (TDD)
  games/
    <game-name>/
      index.tsx
      logic.ts
      logic.test.ts
  explorers/
    <api-name>/
      index.tsx
      api.ts                  # API-Calls, Fetching
      api.test.ts
  lib/                        # Shared utilities & helpers
docs/
  tools/                      # Dokumentation pro Tool (optional)
  adr/                        # Architecture Decision Records (optional)
```

**Goldene Regel:** Logik (`logic.ts`) ist immer von der UI (`index.tsx`) getrennt. Reine Funktionen, einfach testbar, kein React-Import.

---

## Workflow-Entscheidungsbaum

```
Neue Aufgabe erhalten
       │
       ├─ Neues Tool / Minigame / API Explorer?
       │         └─ JA → Workflow A (Brainstorm → Spec → TDD → Implement → Docs → Review)
       │
       ├─ Bugfix?
       │         └─ JA → Workflow B (Analyse → Fix → Test → PR)
       │
       ├─ UI-Anpassung / Styling?
       │         └─ JA → Workflow C (Direkt → PR)
       │
       └─ Refactor / Cleanup?
                 └─ JA → Workflow C (Änderung, Tests grün halten → PR)
```

---

## Workflow A: Neues Tool / Feature (Pflicht)

### Schritt 1 – Brainstorm
**Bevor irgendeine Zeile Code geschrieben wird**, stellt Claude aktiv Rückfragen:
- Was genau soll das Tool tun? Was nicht?
- Welche Inputs, welche Outputs?
- Welche Edge Cases (0, negativ, leer, ungültig)?
- Mobile-first: Wie interagiert der User auf dem Smartphone?
- Gibt es ähnliche Tools im Projekt, die wiederverwendet werden können?

Claude wartet auf Antworten. Keine Annahmen treffen.

### Schritt 2 – Spec (schriftlich bestätigen)
Claude fasst die Anforderungen zusammen und wartet auf Bestätigung:

```
## Spec: [Tool-Name]
Kategorie: [Utility / Minigame / API Explorer]
Funktion: [1–2 Sätze]
Inputs: [Liste mit Typ und Validierung]
Outputs: [Liste]
Logik / Algorithmus: [Kernformel oder Ablauf]
Edge Cases: [Liste]
Neue Dateien:
  - src/[tools|games|explorers]/[name]/logic.ts
  - src/[tools|games|explorers]/[name]/logic.test.ts
  - src/[tools|games|explorers]/[name]/index.tsx
Dokumentation:
  - README.md aktualisieren (Tool-Liste)
  - docs/tools/[name].md falls komplex
```

**Keine Implementierung ohne explizite Bestätigung der Spec.**

### Schritt 3 – Tests zuerst (TDD, nicht verhandelbar)
Claude schreibt `logic.test.ts` vollständig **bevor** `logic.ts` existiert:
- Happy Path (Normalfall)
- Edge Cases (0, negativ, leerer String, null/undefined)
- Fehlerfälle / ungültige Inputs
- Boundary-Werte

Tests sind **rot** – das ist korrekt und beabsichtigt.

### Schritt 4 – Implementierung
`logic.ts` implementieren bis alle Tests grün.
Danach `index.tsx`: Tailwind, mobile-first, keine inline styles.

### Schritt 5 – Dokumentation aktualisieren (Pflicht)
Nach jeder Implementierung:
- **`README.md`**: Tool/Minigame/Explorer in der entsprechenden Liste ergänzen
- **`docs/tools/<name>.md`**: Nur bei komplexer Logik oder externen APIs
- Kommentare im Code falls die Logik nicht selbsterklärend ist

### Schritt 6 – Review-Checkliste
Claude prüft selbst vor dem PR:
- [ ] Alle Tests grün (`npm test`)
- [ ] Keine hardcodierten Werte in `logic.ts`
- [ ] Keine unnötigen npm-Pakete
- [ ] Sentry error boundary bei externen Calls
- [ ] Mobile-Ansicht funktioniert (Tailwind responsive)
- [ ] README und Docs aktuell

---

## Workflow B: Bugfix

1. Betroffene Datei lesen, Fehlerursache **benennen** bevor gefixt wird
2. Falls `logic.ts` betroffen: Failing Test für den Bug schreiben, **dann** fixen
3. Minimaler Fix – keine unnötigen Änderungen an anderen Dateien
4. PR-Beschreibung: Ursache + Fix + betroffene Tests

---

## Workflow C: Direktänderung (Styling, Config, Docs)

Keine Spec nötig. Direkt ändern, PR erstellen, kurze Beschreibung.

---

## Dokumentationsregeln (immer einhalten)

| Was geändert? | Was aktualisieren? |
|---|---|
| Neues Tool / Game / Explorer | README.md Tool-Liste + ggf. `docs/tools/` |
| Neue ENV Variable | README.md Setup-Abschnitt |
| Neue npm Dependency | README.md Tech Stack falls relevant |
| Breaking Change an Struktur | Kommentar im Code + README |
| Komplexe API-Integration | `docs/tools/<name>.md` |

Claude prüft **immer** ob Dokumentation angepasst werden muss – ohne explizite Aufforderung.

---

## Konventionen

- **Commits:** Conventional Commits – `feat:`, `fix:`, `test:`, `chore:`, `docs:`, `refactor:`
- **Sprache:** Code + Kommentare auf Englisch
- **Komponenten:** Funktionale Komponenten, Hooks, kein Class-basiertes React
- **Logik:** Immer in `logic.ts` auslagern – pure functions, kein Side-Effect
- **Styling:** Tailwind utility classes, kein inline CSS, kein separates CSS ausser `globals.css`
- **Fehlerbehandlung:** `Sentry.captureException()` bei unerwarteten Fehlern und API-Calls
- **Secrets:** Nur via `.env.local` (lokal) / Netlify Environment Variables (prod)

---

## Verbote (niemals, unter keinen Umständen)

- ❌ Direkter Push auf `main`
- ❌ Implementierung ohne bestätigte Spec (bei neuen Features)
- ❌ Tests überspringen, deaktivieren oder auskommentieren
- ❌ `.env`-Dateien anfassen oder Inhalt loggen
- ❌ Neue npm-Pakete ohne kurze Begründung
- ❌ Sentry entfernen oder deaktivieren
- ❌ Dokumentation nach einer Änderung nicht aktualisieren
