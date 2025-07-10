interface Handler {
  fillWith(sheetJSON: SheetJSON): number
  clearHighlight(): void
  getContextMenuItems(): Array<MenuItem>
}

interface SheetJSON {
  [index: number]: {
    [key: string]: string
  }
}
