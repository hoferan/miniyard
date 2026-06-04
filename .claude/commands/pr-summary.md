---
name: pr-summary
description: Generiert eine fertige PR-Beschreibung basierend auf git diff zu main
---

# /pr-summary

Generiert eine fertige PR-Beschreibung.

## Was Claude tut

1. `git diff main` analysieren
2. PR-Template aus `.github/PULL_REQUEST_TEMPLATE.md` ausfüllen
3. Konventionellen Commit-Titel vorschlagen
4. Checklist-Punkte als erfüllt/offen markieren

## Ausgabe

Fertige PR-Beschreibung zum Einfügen in GitHub – kopierbereit.
