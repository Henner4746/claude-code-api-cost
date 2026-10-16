<div align="center">

# API

**Zeigt, was deine Claude-Code-Session zu API-Preisen kosten würde.**<br>
Ein kleiner Knopf in Claude Desktop. Ein Klick, Aufteilung pro Modell.

[English](README.md)

<img src="assets/preview.svg" alt="Vorschau: API-Knopf neben dem Modellnamen, aufgeklappte Liste über dem Eingabefeld" width="720">

</div>

## Was es macht

- Zeigt **`API $x.xx`** unten rechts neben dem Modellnamen, in jedem lokalen Chat.
- Ein Klick klappt über dem Eingabefeld eine Liste auf: **Kosten pro Modell, Summe und eine grobe Schätzung, was es Anthropic kostet**.
- Aktualisiert sich nach jeder Antwort. Liest deine lokalen Nutzungsdaten über [ccusage](https://github.com/ryoppippi/ccusage), nichts verlässt deinen Rechner.

> Die Zahlen sind **Listenpreise** der Anthropic-API, nicht deine echte Rechnung. Praktisch, wenn du einen Tarif oder einen Proxy nutzt und den Wert deines Verbrauchs wissen willst. Die Zeile „Anthropic“ ist eine grobe Schätzung (40 % des Listenpreises, aus berichteten Bruttomargen), keine offizielle Zahl.

## Installation

**1. ccusage installieren** (einmalig):

```
npm install -g ccusage
```

**2. Marketplace und Plugin hinzufügen** (zwei Befehle, in jedem Terminal):

```
claude plugin marketplace add Henner4746/claude-code-api-cost
claude plugin install api@henrik-mods --scope user
```

**3. Claude Desktop neu starten.** Der Knopf erscheint in jedem lokalen Chat.

Lieber klicken? In Claude Desktop: **+ neben dem Eingabefeld → Plugins → Add marketplace**, `Henner4746/claude-code-api-cost` eintragen, dann **Add plugin → api**. Dort lässt es sich jederzeit an- und ausschalten.

## Hinweise

| | |
|---|---|
| Voraussetzungen | Windows, Claude Desktop mit Code-Tab, Node.js (für ccusage) |
| Cloud-Chats | Nicht unterstützt, sie laden keine lokalen Plugins. |
| Position der Liste | Die aufgeklappte Liste sitzt über dem Eingabefeld und wird von Fragekästen verdeckt. |
| `claude plugin list` im Terminal | Eine ältere CLI meldet eventuell „failed to load“. Das Plugin nutzt das neuere Hook-Format, das die Desktop-App versteht. |

## Deinstallation

```
claude plugin uninstall api@henrik-mods
```

## Lizenz

[MIT](LICENSE)
