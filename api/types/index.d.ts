export type Row = { model: string; cost: number }

declare module 'claude-code' {
  interface PluginState {
    api: { rows: Row[]; isOpen: boolean }
  }
}
