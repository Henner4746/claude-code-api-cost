export type Row = { model: string; cost: number; tokens: number }

declare module 'claude-code' {
  interface PluginState {
    api: {
      rows: Row[]
      total: { cost: number; tokens: number }
      busy: boolean
      isOpen: boolean
    }
  }
}
