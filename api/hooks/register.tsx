import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Row } from '../types'

const PANE = 'api-kosten'
const SELF_COST = 0.4
const rowsAtom = atom({ plugin: 'api', key: 'rows' } as const, [])
const totalAtom = atom({ plugin: 'api', key: 'total' } as const, { cost: 0, tokens: 0 })
const busyAtom = atom({ plugin: 'api', key: 'busy' } as const, false)
const openAtom = atom({ plugin: 'api', key: 'isOpen' } as const, false)

const usd = (n: number) => `$${n.toFixed(2)}`
const tok = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'api',
      description: 'API-Wert dieser Session pro Modell',
    })
    const started = await next(e)
    void (async () => {
      const busy = await read($, busyAtom)
      if (busy) {
        return
      }
      await update($, busyAtom, () => true)
      try {
        const id = await $.session.id()
        const quick = await $.process.run(
          ['cmd', '/c', 'ccusage', 'session', '--id', id, '--json', '--offline'],
          { timeoutMs: 60000 },
        )
        const q = JSON.parse(quick.stdout)
        const known = await read($, totalAtom)
        const cost = Number(q.totalCost) || 0
        const tokens = Number(q.totalTokens) || 0
        if (known.cost !== cost || known.tokens !== tokens) {
          await update($, totalAtom, () => ({ cost, tokens }))
          $.ui.invalidate('ui.render')
          const started = (await $.session.usage()).startedAt
          const since = started
            ? new Date(started).toISOString().slice(0, 10).split('-').join('')
            : '20260101'
          const slow = await $.process.run(
            ['cmd', '/c', 'ccusage', 'session', '--json', '--offline', '--since', since],
            { timeoutMs: 120000 },
          )
          const hit = JSON.parse(slow.stdout).session.find((s: any) => s.period === id)
          const rows: Row[] = (hit?.modelBreakdowns ?? []).map((m: any) => ({
            model: String(m.modelName).replace('claude-', ''),
            cost: Number(m.cost) || 0,
            tokens:
              (Number(m.inputTokens) || 0) +
              (Number(m.outputTokens) || 0) +
              (Number(m.cacheCreationTokens) || 0) +
              (Number(m.cacheReadTokens) || 0),
          }))
          await update($, rowsAtom, () => rows)
          $.ui.invalidate('ui.render')
        }
      } catch {
        // keine Daten: Anzeige bleibt wie sie ist
      } finally {
        await update($, busyAtom, () => false)
      }
    })()
    return started
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    void (async () => {
      const busy = await read($, busyAtom)
      if (busy) {
        return
      }
      await update($, busyAtom, () => true)
      try {
        const id = await $.session.id()
        const quick = await $.process.run(
          ['cmd', '/c', 'ccusage', 'session', '--id', id, '--json', '--offline'],
          { timeoutMs: 60000 },
        )
        const q = JSON.parse(quick.stdout)
        const known = await read($, totalAtom)
        const cost = Number(q.totalCost) || 0
        const tokens = Number(q.totalTokens) || 0
        if (known.cost !== cost || known.tokens !== tokens) {
          await update($, totalAtom, () => ({ cost, tokens }))
          $.ui.invalidate('ui.render')
          const started = (await $.session.usage()).startedAt
          const since = started
            ? new Date(started).toISOString().slice(0, 10).split('-').join('')
            : '20260101'
          const slow = await $.process.run(
            ['cmd', '/c', 'ccusage', 'session', '--json', '--offline', '--since', since],
            { timeoutMs: 120000 },
          )
          const hit = JSON.parse(slow.stdout).session.find((s: any) => s.period === id)
          const rows: Row[] = (hit?.modelBreakdowns ?? []).map((m: any) => ({
            model: String(m.modelName).replace('claude-', ''),
            cost: Number(m.cost) || 0,
            tokens:
              (Number(m.inputTokens) || 0) +
              (Number(m.outputTokens) || 0) +
              (Number(m.cacheCreationTokens) || 0) +
              (Number(m.cacheReadTokens) || 0),
          }))
          await update($, rowsAtom, () => rows)
          $.ui.invalidate('ui.render')
        }
      } catch {
        // keine Daten: Anzeige bleibt wie sie ist
      } finally {
        await update($, busyAtom, () => false)
      }
    })()
    return done
  })

  on('command.run', { command: 'api' }, async ($, e, next) => {
    await $.ui.open({ id: PANE, title: 'API' })
    return { text: 'API-Panel geöffnet.' }
  })

  on('ui.render', { component: 'SessionMode' }, async ($, e, next) => {
    const total = await read($, totalAtom)
    const isOpen = await read($, openAtom)
    const { Box, Button, Text } = $.ui.resolve(e)
    return (
      <Box key="api-root" flexDirection="row">
        {e.props.modes.length > 0 && <Text dimColor>{e.props.modes.join(' & ')}  </Text>}
        <Button
          key="api"
          label={`API ${usd(total.cost)} · ${tok(total.tokens)} ${isOpen ? '▾' : '▸'}`}
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
    const total = await read($, totalAtom)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        {rows.map(r => (
          <Text dimColor>{r.model}  {usd(r.cost)}  {tok(r.tokens)}</Text>
        ))}
        <Text>Gesamt  {usd(total.cost)}  {tok(total.tokens)}</Text>
        <Text dimColor>Anthropic, geschätzt  ~{usd(total.cost * SELF_COST)}</Text>
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const rows: Row[] = await read($, rowsAtom)
    const total = await read($, totalAtom)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column">
        {rows.map(r => (
          <Text>{r.model}  {usd(r.cost)}  {tok(r.tokens)}</Text>
        ))}
        <Text bold>Gesamt (Listenpreis)  {usd(total.cost)}  {tok(total.tokens)}</Text>
        <Text>Anthropic-Selbstkosten, geschätzt  ~{usd(total.cost * SELF_COST)}</Text>
        <Text dimColor>Schätzung: ~40 % des Listenpreises, abgeleitet aus berichteten 50–60 % Bruttomarge. Keine offizielle Zahl.</Text>
      </Box>
    )
  })
}
