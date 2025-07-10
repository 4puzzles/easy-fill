import type { MenuItem } from "@imengyu/vue3-context-menu"

enum State {
  Success,
  Unchanged,
  Failed,
}

interface RowState {
  row: HTMLTableRowElement
  n: number,
  pscjOldValue: string,
  mkcjOldValue: string,
  bzOldValue: string,
  bz1OldValue: string,
  state: State
}

class FinalHandler implements Handler {
  static MAX_ROW_LIMIT = 1000 // prevent infinite loops

  rowStates: Array<RowState>
  targetTable: HTMLTableElement | null

  constructor() {
    this.rowStates = []
    this.targetTable = null
  }

  getTargetTable(): HTMLTableElement {
    if (!window || !window.frames[0]) {
      throw Error('Failed to get target window')
    }

    const table = window.frames[0].document.querySelector<HTMLTableElement>('#keywords')
    if(!table) {
      throw Error('Failed to get target table')
    }

    return table
  }

  inputHook(input: HTMLInputElement): void {
    // onkeyup="parent.valueChange(this,event);"
    // onclick="parent.InputOrSelectOnclick(this);"
    // onkeypress="parent.FormatScore(event,this);"
    // onblur="parent.DataFormat(this);"

    // trigger valueChange function
    input.dispatchEvent(new KeyboardEvent('keyup'))

    // trigger DataFormat function
    input.dispatchEvent(new FocusEvent('blur'))
  }

  selectHook(select: HTMLSelectElement): void {
    // onchange="parent.valueChange(this,event);"
    // onclick="parent.InputOrSelectOnclick(this);"

    select.dispatchEvent(new Event('change'))
  }

  getStudentID(row: HTMLTableRowElement, n: number): string {
    const td = row.querySelector<HTMLTableCellElement>('#tr' + n + '_yhxh')
    if(!td) {
      throw Error('Failed to get the cell of student ID')
    }
    if(!td.textContent) {
      throw Error('Invalid cell of student ID')
    }

    return td.textContent.trim()
  }

  getStudentName(row: HTMLTableRowElement, n: number): string {
    const td = row.querySelector<HTMLTableCellElement>('#tr' + n + '_xm')
    if(!td) {
      throw Error('Failed to get the cell of student name')
    }
    if(!td.textContent) {
      throw Error('Invalid cell of student name')
    }

    return td.textContent.trim()
  }

  getPSCJ(row: HTMLTableRowElement, n: number): HTMLInputElement {
    const input = row.querySelector<HTMLInputElement>('#tr' + n + '_pscj_')
    if(!input) {
      throw Error('Failed to get PSCJ cell')
    }

    return input
  }

  getMKCJ(row: HTMLTableRowElement, n: number): HTMLInputElement {
   const input = row.querySelector<HTMLInputElement>('#tr' + n + '_mkcj_')
    if(!input) {
      throw Error('Failed to get MKCJ cell')
    }

    return input
  }

  getBZ(row: HTMLTableRowElement, n: number): HTMLSelectElement {
    const select = row.querySelector<HTMLSelectElement>('#tr' + n + '_bz_')
    if (!select) {
      throw Error('Failed to get BZ cell')
    }

    return select
  }

  getBZ1(row: HTMLTableRowElement, n: number): HTMLInputElement {
    const input = row.querySelector<HTMLInputElement>('#tr' + n + '_bz1_')
    if (!input) {
      throw Error('Failed to get BZ1 cell')
    }

    return input
  }

  setPSCJ(row: HTMLTableRowElement, i: number, newValue: string): boolean {
    if (isNaN(Number(newValue))) {
      return false
    }

    const input = this.getPSCJ(row, i)
    input.value = newValue
    this.inputHook(input)

    if(input.value === '') {
      return false
    }

    return true
  }

  setMKCJ(row: HTMLTableRowElement, i: number, newValue: string): boolean {
    const select = this.getBZ(row, i)
    if(select.value !== '') {
      return newValue === '' ? true : false
    }

    if (isNaN(Number(newValue))) {
      return false
    }

    const input = this.getMKCJ(row, i)
    input.value = newValue
    this.inputHook(input)

    if(input.value === '') {
      return false
    }

    return true
  }

  setBZ(row: HTMLTableRowElement, i: number, newValue: string): boolean {
    const select = this.getBZ(row, i)
    const options = select.querySelectorAll('option')
    const newOption = Array.from(options).find(option => option.textContent === newValue)
    if(!newOption) {
      return false
    }

    select.value = newOption.value
    this.selectHook(select)
    return true
  }

  setBZ1(row: HTMLTableRowElement, i: number, newValue: string): boolean {
    const input = this.getBZ1(row, i)

    input.value = newValue
    return true
  }

  setHighlight(row: HTMLTableRowElement, state: State): void {
    switch(state) {
      case State['Success']:
        row.style.background = ' #52c41a'
        break
      case State['Unchanged']:
        // do nothing
        break
      case State['Failed']:
        row.style.background = ' #faad14'
        break
      default:
    }
  }

  clearHighlight(): void {
    this.rowStates.forEach(rowState => rowState.row.style.background = '')
  }

  createRowState(row: HTMLTableRowElement, n: number): RowState {
    const rowState: RowState = {
      row,
      n,
      pscjOldValue: '',
      mkcjOldValue: '',
      bzOldValue: '',
      bz1OldValue: '',
      state: State['Unchanged']
    }
    rowState.pscjOldValue = this.getPSCJ(rowState.row, rowState.n).value
    rowState.mkcjOldValue = this.getMKCJ(rowState.row, rowState.n).value

    const select = this.getBZ(rowState.row, rowState.n)
    const options = select.querySelectorAll('option')
    const selectedOption = Array.from(options).find(option => option.value === select.value)
    rowState.bzOldValue = selectedOption?.textContent ?? ''

    rowState.bz1OldValue = this.getBZ1(rowState.row, rowState.n).value

    return rowState
  }

  rollbackRowState(rowState: RowState): void {
    const row = rowState.row
    const n = rowState.n

    this.setBZ(row, n, rowState.bzOldValue)
    this.setPSCJ(row, n, rowState.pscjOldValue)
    if(rowState.bzOldValue === '') {
      this.setMKCJ(row, n ,rowState.mkcjOldValue)
    }
    this.setBZ1(row, n, rowState.bz1OldValue)
  }

  undo() {
    this.clearHighlight()
    for(const rowState of this.rowStates) {
      this.rollbackRowState(rowState)
    }
    this.rowStates = []
  }

  getContextMenuItems(): Array<MenuItem> {
    const items: Array<MenuItem> = [
      {
        label: "清除高亮",
        svgIcon: '#icon-highlight-off',
        onClick: () => {
          this.clearHighlight()
        },
      },
    ]

    // refresh detection
    const currentTargetTable = this.getTargetTable()
    if(this.targetTable != currentTargetTable) {
      this.rowStates = []
    } else if(this.rowStates.length !== 0) {
      items.push({
        label: "撤销",
        svgIcon: '#icon-undo',
        onClick: () => {
          this.undo()
        },
      })
    }
    return items
  }

  fillWith(sheetJSON: SheetJSON): number {
    // get target table object
    this.targetTable = this.getTargetTable()

    this.clearHighlight()
    this.rowStates = []

    let count = 0
    for (let i = 0; i < FinalHandler.MAX_ROW_LIMIT; i++) {
      const row = this.targetTable.querySelector<HTMLTableRowElement>("#tr" + i)

      // no more students
      if (row === null) {
        break
      }

      const studentID = this.getStudentID(row, i)
      const studentName = this.getStudentName(row, i)

      for (const key in sheetJSON) {
        if (!sheetJSON[key]["学号"] || !sheetJSON[key]["姓名"])
          continue

        const sheetJSONStudentID = sheetJSON[key]["学号"]?.toString().trim() ?? ''
        const sheetJSONStudentName = sheetJSON[key]["姓名"]?.toString().trim() ?? ''

        if (studentID !== sheetJSONStudentID || studentName !== sheetJSONStudentName)
          continue

        const rowState = this.createRowState(row, i)

        const pscj = sheetJSON[key]['平时成绩']?.toString().trim() ?? ''
        const mkcj = sheetJSON[key]['期末成绩']?.toString().trim() ?? ''
        const bz = sheetJSON[key]['备注']?.toString().trim() ?? ''
        const bz1 = sheetJSON[key]['说明']?.toString().trim() ?? ''

        const resultBZ = this.setBZ(row, i, bz)
        const resultPSCJ = this.setPSCJ(row, i, pscj)
        const resultMKCJ = this.setMKCJ(row, i, mkcj)
        const resultBZ1 = this.setBZ1(row, i, bz1)

        if(resultBZ && resultPSCJ && resultMKCJ && resultBZ1) {
          rowState.state = State['Success']
          ++count
        } else {
          this.rollbackRowState(rowState)
          rowState.state = State['Failed']
        }

        this.setHighlight(row, rowState.state)
        this.rowStates.push(rowState)

        break
      }
    }

    return count
  }
}

export default FinalHandler
