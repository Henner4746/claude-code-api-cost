# api

Mod für Claude Desktop (Code-Tab). Zeigt unten rechts neben dem Modellnamen einen Knopf `API $x.xx` mit dem, was die aktuelle Session zu Anthropic-Listenpreisen kosten würde. Ein Klick klappt über dem Eingabefeld die Aufteilung pro Modell auf, dazu die Summe und eine grobe Schätzung der Anthropic-Selbstkosten (40 % des Listenpreises, abgeleitet aus berichteten Bruttomargen, keine offizielle Zahl).

## Voraussetzungen

- Windows, Claude Desktop mit Code-Tab
- [`ccusage`](https://github.com/ryoppippi/ccusage) global installiert: `npm install -g ccusage`

## Installation

In Claude Desktop: Plus neben dem Eingabefeld, Plugins, Add marketplace, dann den Pfad oder `Henner4746/claude-code-api-cost` eintragen und das Plugin `api` hinzufügen.

Im Terminal:

```
claude plugin marketplace add Henner4746/claude-code-api-cost
claude plugin install api@henrik-mods --scope user
```

Danach die App neu starten. Der Knopf erscheint in jedem lokalen Chat.

## Hinweise

- Der Knopf liest die Werte nach jeder Antwort neu aus `ccusage session --json`.
- Die Liste liegt im Bereich über dem Eingabefeld und wird von Fragekästen verdeckt.
- Cloud-Chats laden keine lokalen Plugins.
