---
name: bugfix
description: Strukturierter Bugfix-Workflow ohne Brainstorm-Overhead
argument-hint: "[kurze Fehlerbeschreibung]"
---

# /bugfix

Workflow B – Bugfix ohne Brainstorm.

## Prompt-Template

```
/bugfix

Problem: [was ist kaputt]
Datei / Komponente: [wo]
Erwartetes Verhalten: [was sollte passieren]
Aktuelles Verhalten: [was passiert stattdessen]
Reproduzierbar: [immer / manchmal / unter Bedingung X]
```

## Was Claude tut

1. Betroffene Datei lesen, Ursache benennen
2. Falls `logic.ts` betroffen: Failing Test für den Bug schreiben, dann fixen
3. Minimaler Fix – keine unnötigen Änderungen
4. PR-Beschreibung mit Ursache, Fix und betroffenen Tests
