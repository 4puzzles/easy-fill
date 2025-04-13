class FinalHandler implements Handler {
  getTargetWindow(): Window {
    if (window && window.frames[0]) {
      return window.frames[0];
    }

    throw Error('Failed to get target window');
  }

  inputHook(str1: string, str2: '1'|'9',  input: HTMLInputElement): void {
    const targetWindow = this.getTargetWindow();

    // getBFselblur is a predefined function
    // when the user inputs a score, the function will be called
    // and the final score will be calculated
    // here we just simulate the same situation
    targetWindow.getBFselblur(str1, str2, '1', input);
  }

  fillWith(sheetJSON: SheetJSON): number {
    // get target document object
    const doc = this.getTargetWindow().document;

    // TODO: check deadline
    // the first table tag is about deadline information

    // select the second table tag
    const table = doc.querySelector('table:last-child');
    if (table === null) {
      throw Error('Target table not found');
    }

    let count = 0;
    for (let i = 1; ; i++) {
      const trID = "#hh" + i;
      const curtr = table.querySelector(trID);

      // no more students
      if (curtr === null) {
        break;
      }

      const studentID = curtr.querySelectorAll('td')[1].textContent!.trim();
      const studentName = curtr.querySelectorAll('td')[2].textContent!.trim();

      for (const key in sheetJSON) {
        if (!sheetJSON[key]["学号"] || !sheetJSON[key]["姓名"])
          continue;

        const sheetJSONStudentID = sheetJSON[key]["学号"] ? sheetJSON[key]["学号"].toString().trim() : '';
        const sheetJSONStudentName = sheetJSON[key]["姓名"] ? sheetJSON[key]["姓名"].toString().trim() : '';

        if (studentID !== sheetJSONStudentID || studentName !== sheetJSONStudentName)
          continue;


        const score1 = parseFloat(sheetJSON[key]['平时']);
        const score2 = parseFloat(sheetJSON[key]['末考']);

        let affected = false;
        if (!isNaN(score1)) {
          const input = curtr.querySelector('#CHKPSCJ' + i) as HTMLInputElement;
          input.value = String(score1);
          this.inputHook(String(i), '9', input);
          affected = true;
        }

        if (!isNaN(score2)) {
          const input = curtr.querySelector('#CHKQMCJ' + i) as HTMLInputElement;
          input.value = String(score2);
          this.inputHook(String(i), '1', input);
          affected = true;
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

export default FinalHandler;
