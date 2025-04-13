class ResitHandler implements Handler{
  getTargetWindow() {
    if (window && window.frames[0]) {
      return window.frames[0];
    }

    throw Error('Failed to get target window');
  }

  afterFill(n: number) {
    const targetWindow = this.getTargetWindow();
    const curInput = targetWindow.document.getElementById(String(n)) as HTMLInputElement;

    // getselblur is a predefined function
    // when the user inputs a score, the function will be called
    // and the resit score will be calculated
    // here we just simulate the same situation
    targetWindow.getselblur(n, 1, curInput);
  }

  afterSelect(n: number) {
    const targetWindow = this.getTargetWindow();
    const curSelect = targetWindow.document.getElementById('sel_QMTSQK' + n) as HTMLSelectElement;
    targetWindow.settsqk(n, 'QM', curSelect);
  }

  fillWith(sheetJSON: SheetJSON) {
    // get target document object
    const doc = this.getTargetWindow().document;

    // TODO: check deadline

    // select the second table tag
    const table = doc.querySelector('table:last-child');
    if (table === null) {
      throw Error('Target table not found');
    }

    let count = 0;
    const trs = table.querySelectorAll('tr');
    for (let i = 0; i < trs.length; i++) {
      const curtr = trs[i];

      const studentID = curtr.querySelectorAll('td')[1].textContent!.trim();
      const studentName = curtr.querySelectorAll('td')[2].textContent!.trim();

      for (const key in sheetJSON) {
        if (!sheetJSON[key]["学号"] || !sheetJSON[key]["姓名"])
          continue;

        const sheetJSONStudentID = sheetJSON[key]["学号"] ? sheetJSON[key]["学号"].toString().trim() : '';
        const sheetJSONStudentName = sheetJSON[key]["姓名"] ? sheetJSON[key]["姓名"].toString().trim() : '';

        if (studentID !== sheetJSONStudentID || studentName !== sheetJSONStudentName)
          continue;


        const score = parseFloat(sheetJSON[key]['补考成绩']);
        const note = sheetJSON[key]['备注']?.trim();

        let affected = false;
        const select = curtr.querySelector('#sel_QMTSQK' + (i + 1)) as  HTMLInputElement;
        const options = select.querySelectorAll('option');
        const oldOption = Array.from(options).find(option => option.value === select.value);
        if (!note) {
          if (oldOption!.textContent!.trim()) {
            select.value = '';
            this.afterSelect(i + 1);
            affected = true;
          }

          if (!isNaN(score)) {
            (curtr.querySelector('input[name="CHKQMCJ' + (i + 1) + '"]') as HTMLInputElement).value = String(score);
            this.afterFill(i + 1);
            affected = true;
          }
        } else {
          const newOption = Array.from(options).find(option => option.textContent === note);
          if (newOption && newOption != oldOption) {
            select.value = newOption.value;
            this.afterSelect(i + 1);
            affected = true;
          }
        }

        if (affected) {
          ++count;
        }

        break;
      }
    }

    return count;
  }
};

export default ResitHandler;
