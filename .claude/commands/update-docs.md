---
name: update-docs
description: Prüft ob README, docs/ und Kommentare nach einer Änderung noch aktuell sind und aktualisiert sie
---

# /update-docs

Prüft und aktualisiert alle Dokumentation nach einer Änderung.

## Was Claude prüft

1. **README.md** – Sind alle Tools, Games, Explorers in den Listen?
   Fehlt etwas? Ist ein Tool umbenannt oder entfernt worden?

2. **docs/tools/** – Gibt es komplexe Logik oder API-Integrationen ohne Dokumentation?

3. **ENV Variablen** – Sind alle `.env`-Keys im README Setup-Abschnitt dokumentiert?

4. **Code-Kommentare** – Ist komplexe Logik (`logic.ts`) selbsterklärend oder braucht es Kommentare?

## Wann verwenden

- Nach einer Implementierung die docs vergessen wurden
- Vor einem PR als finaler Check
- Wenn `README.md` outdated wirkt
