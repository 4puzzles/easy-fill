/*
 *  Test communication between popup.js and contents-script.js.
 */
/*
function executeTestConnCMD(msg, sendResponse) {
  alert("Receive from popup.js: " + msg);
  sendResponse("I got your message！"); 
}
*/

// str1, str2, cjfs, vOBJ
function callGetBFselblur(elementID, row){
  let iframe = window.frames[0].document;
  let js = document.createElement('script');
  js.setAttribute('type', 'text/javascript');
  js.textContent = `
    (function() {
      let curInput = document.getElementById('${elementID}' + ${row});
      getBFselblur('${row}', '1', '1', curInput);
    })();
  `;

  iframe.head.appendChild(js);
  js.remove();
}

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
      if(!sheetJSON[key]["学号"] || !sheetJSON[key]["姓名"])
        continue;

      let sheetJSONStudentID = sheetJSON[key]["学号"] ? sheetJSON[key]["学号"].toString().trim() : '';
      let sheetJSONStudentName = sheetJSON[key]["姓名"] ? sheetJSON[key]["姓名"].toString().trim() : '';
      
      if(studentID != sheetJSONStudentID || studentName!= sheetJSONStudentName) 
        continue;
      
      //let score1  = sheetJSON[key]['平时'] ?  sheetJSON[key]['平时'].toString().trim() : '';
      //let score2 = sheetJSON[key]['末考'] ? sheetJSON[key]['末考'].toString().trim() : '';
      let score1 = parseFloat(sheetJSON[key]['平时']);
      let score2 = parseFloat(sheetJSON[key]['末考']);

      if(!isNaN(score1)) {  
        $('#CHKPSCJ' + i, curtr).val(score1) ;
        callGetBFselblur('CHKPSCJ', i);
      }

      if(!isNaN(score2)) {
        $('#CHKQMCJ' + i, curtr).val(score2);
        callGetBFselblur('CHKQMCJ', i);
      }

      //$('#CHKQZCJ' + i, curtr).val(sheetJSON[key]['中考'].toString().trim());
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
