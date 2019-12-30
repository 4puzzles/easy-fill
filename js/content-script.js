/*
 *  Test communication between popup.js and contents-script.js.
 */
/*
function executeTestConnCMD(msg, sendResponse) {
  alert("Receive from popup.js: " + msg);
  sendResponse("我收到了你的消息！"); 
}
*/


/*
 *  
 */
function executeFillFormCMD(sheetJSON) {
  let iframe = window.frames[0].document;
  let table = $('table', iframe);

  for(let i=1; ;i++) {
    let trID = "#hh"+ i;
    let curtr = $(trID, table);


    // no more students
    if(curtr.length == 0) {
      break;
    }

    let studentID = $("td", curtr).eq(1).text().trim();
    let studentName = $("td", curtr).eq(2).text().trim();
    for(let key in sheetJSON) {
      let sheetJSONStudentID = sheetJSON[key]["学号"] ? sheetJSON[key]["学号"].toString().trim() : '';
      let sheetJSONStudentName = sheetJSON[key]["姓名"] ? sheetJSON[key]["姓名"].toString().trim() : '';
      
      if(studentID != sheetJSONStudentID || studentName!= sheetJSONStudentName) 
        continue;
      
      let score1  = sheetJSON[key]['平时'] ?  sheetJSON[key]['平时'].toString().trim() : '';
      let score2 = sheetJSON[key]['末考'] ? sheetJSON[key]['末考'].toString().trim() : '';
      $('#CHKPSCJ' + i, curtr).val(score1);
      //$('#CHKQZCJ' + i, curtr).val(sheetJSON[key]['中考'].toString().trim());
      $('#CHKQMCJ' + i, curtr).val(score2);
      //$('#CHKJNCJ' + i, curtr).val(sheetJSON[key]['技能'].toString().trim());
      //$('#CHKZHCJ' + i, curtr).val(sheetJSON[key]['综合'].toString().trim());

      break;
    }
  }
}


/*
 *    Handle requests from popup.js.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  try {
    if(request.cmd == 'FILL_FORM') {
      executeFillFormCMD(request.sheetJSON);
    }
    /*
     else if(request.cmd == 'TEST_CONN') {
       executeTestConnCMD(request.msg, sendResponse);
     }
    */
  } catch (e) {
    let errMsg = e.stack;
    sendResponse(errMsg);
  }
  sendResponse('success');
});
