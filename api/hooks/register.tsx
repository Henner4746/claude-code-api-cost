import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Row } from '../types'

const PANE = 'api-kosten'
const SELF_COST = 0.4
const rowsAtom = atom({ plugin: 'api', key: 'rows' } as const, [])
const openAtom = atom({ plugin: 'api', key: 'isOpen' } as const, false)

const usd = (n: number) => `$${n.toFixed(2)}`

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'api',
      description: 'API-Wert dieser Session pro Modell',
    })
    const started = await next(e)
    $.ui.status(undefined)
    void (async () => {
      try {
        const id = await $.session.id()
        const r = await $.process.run(
          ['cmd', '/c', 'ccusage', 'session', '--json', '--offline', '--since', '20260101'],
          { timeoutMs: 120000 },
        )
        const hit = JSON.parse(r.stdout).session.find((s: any) => s.period === id)
        const rows: Row[] = (hit?.modelBreakdowns ?? []).map((m: any) => ({
          model: String(m.modelName).replace('claude-', ''),
          cost: Number(m.cost),
        }))
        await update($, rowsAtom, () => rows)
      } catch {
        // keine Daten: Anzeige bleibt wie sie ist
      }
    })()
    return started
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    $.ui.status(undefined)
    void (async () => {
      try {
        const id = await $.session.id()
        const r = await $.process.run(
          ['cmd', '/c', 'ccusage', 'session', '--json', '--offline', '--since', '20260101'],
          { timeoutMs: 120000 },
        )
        const hit = JSON.parse(r.stdout).session.find((s: any) => s.period === id)
        const rows: Row[] = (hit?.modelBreakdowns ?? []).map((m: any) => ({
          model: String(m.modelName).replace('claude-', ''),
          cost: Number(m.cost),
        }))
        await update($, rowsAtom, () => rows)
      } catch {
        // keine Daten: Anzeige bleibt wie sie ist
      }
    })()
    return done
  })

  on('command.run', { command: 'api' }, async ($, e, next) => {
    await $.ui.open({ id: PANE, title: 'API' })
    return { text: 'API-Panel geöffnet.' }
  })

  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const rows: Row[] = await read($, rowsAtom)
    const isOpen = await read($, openAtom)
    const total = rows.reduce((a, b) => a + b.cost, 0)
    const { Box, Button, Text } = $.ui.resolve(e)
    return (
      <Box key="api-root" flexDirection="row">
        {e.props.modes.length > 0 && <Text dimColor>{e.props.modes.join(' & ')}  </Text>}
        <Button
          key="api"
          label={`API ${usd(total)} ${isOpen ? '▾' : '▸'}`}
          onPress={async () => {
            await update($, openAtom, v => !v)
            $.ui.invalidate('ui.render')
          }}
        />
      </Box>
    )
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const isOpen = await read($, openAtom)
    if (!isOpen || e.props.hasSurvey) {
      return next(e)
    }
    const rows: Row[] = await read($, rowsAtom)
    const total = rows.reduce((a, b) => a + b.cost, 0)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        {rows.map(r => (
          <Text dimColor>{r.model}  {usd(r.cost)}</Text>
        ))}
        <Text>Gesamt  {usd(total)}</Text>
        <Text dimColor>Anthropic, geschätzt  ~{usd(total * SELF_COST)}</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const rows: Row[] = await read($, rowsAtom)
    const total = rows.reduce((a, b) => a + b.cost, 0)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        {rows.map(r => (
          <Text>{r.model}  {usd(r.cost)}</Text>
        ))}
        <Text bold>Gesamt (Listenpreis)  {usd(total)}</Text>
        <Text>Anthropic-Selbstkosten, geschätzt  ~{usd(total * SELF_COST)}</Text>
        <Text dimColor>Schätzung: ~40 % des Listenpreises, abgeleitet aus berichteten 50–60 % Bruttomarge. Keine offizielle Zahl.</Text>
      </Box>
    )
  })
}
