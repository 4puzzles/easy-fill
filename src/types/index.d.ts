// TODO: fix parameter type
interface Window {
  // 对输入的成绩进行检查
  getBFselblur(str1: string, str2: '1' | '9', cjfs: '1', vOBJ: HTMLInputElement): void,

  // 对输入的成绩进行检查
  getselblur(str1: number, str2: number, vOBJ: HTMLInputElement): void,

  // 特殊情况下拉框事件
  settsqk(i: number, lb: string, obj: HTMLSelectElement): void
}

interface Handler {
  fillWith(sheetJSON: SheetJSON)
}

interface SheetJSON {
  [index: number]: {
    [key: string]: string
  }
}
