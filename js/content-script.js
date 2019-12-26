/*
 *  Test communication between popup.js and contents-script.js.
 */
function executeTestEchoCMD(msg, sendResponse) {
  alert("Receive from popup.js: " + msg);
  sendResponse("我收到了你的消息！"); 
}


function executeTestExample(sheetJSON) {
  $('input').each(function(){
    for(let key in sheetJSON) {
      if($(this).attr('id') == "input"+sheetJSON[key]["学号"]) {
        $(this).val(sheetJSON[key]["成绩"]);
        break;
      }
    }
  }); 
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

    let studentID = $("td", curtr).eq(1).text();
    let studentName = $("td", curtr).eq(2).text();
    for(let key in sheetJSON) {
      if(studentID != sheetJSON[key]["学号"].trim() || studentName!= sheetJSON[key]["姓名"].trim()) 
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
 *    Handle request from popup.js.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
  if (request.cmd == "TEST") {
    executeTestEchoCMD(request.msg, sendResponse);
  } else if(request.cmd == 'FILL_FORM') {
    executeFillFormCMD(request.sheetJSON);
  }
});
