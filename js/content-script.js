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

    let studentID = $("td", curtr).eq(1).text();
    let studentName = $("td", curtr).eq(2).text();
    for(let key in sheetJSON) {
      if(studentID != sheetJSON[key]["学号"].toString().trim() || studentName!= sheetJSON[key]["姓名"].toString().trim()) 
        continue;
      
      $('#CHKPSCJ' + i, curtr).val(sheetJSON[key]['平时']);
      //$('#CHKQZCJ' + i, curtr).val(sheetJSON[key]['中考']);
      $('#CHKQMCJ' + i, curtr).val(sheetJSON[key]['末考']);
      //$('#CHKJNCJ' + i, curtr).val(sheetJSON[key]['技能']);
      //$('#CHKZHCJ' + i, curtr).val(sheetJSON[key]['综合']);

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
