// global variables
let sheetJSON; // a varaible stores the JSON data parsed by XLSX

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseExcelFile() {
  // clear parse-result div.
  $("#parse-result-div").html("");

  let parseResultMsg = `
  <div id="parse-result-msg"></div>
  `;

  // If no file is selected, return.
  if (!$("#upload-input").val()) {
    $("#parse-result-div").append(parseResultMsg);
    $("#parse-result-msg").text(chrome.i18n.getMessage("errNoFileSeletedMsg"));
    return;
  }

  // add progress bar and show animation
  let progress = `
  <div class="progress">
    <div
      id="progress-bar"
      class="progress-bar"
      role="progressbar"
      aria-valuenow="0"
      aria-valuemin="0"
      aria-valuemax="100"
    ></div>
   </div>`;

  $("#parse-result-div").append(progress);
  $("#progress-bar").css("animation", "progress-bar-run 1s ease forwards");

  let files = $("#upload-input").prop("files");
  let reader = new FileReader();
  reader.onload = async function(e) {
    let rawData = e.target.result;

    try {
      let wb = XLSX.read(rawData, {
        type: "array"
      });

      sheetJSON = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    } catch (e) {
      console.log(e);
      
      await sleep(1000);

      $("#progress-bar").addClass("bg-danger");
      $("#parse-result-div").append(parseResultMsg);
      $("#parse-result-msg").text(chrome.i18n.getMessage("errParseFailedMsg"));
      
      return ;
    }

    await sleep(1000);

    $("#progress-bar").addClass("bg-success");
    $("#parse-result-div").append(parseResultMsg);
    $("#parse-result-msg").text(chrome.i18n.getMessage("succParseFinishedMsg"));
    
    //$('#parse-result').append(parseResultMsg);
    //$('#parse-result-msg').text('File is successfully parsed!');
    /* $("#parse-result").html(
      JSON.stringify(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]))
    ); */
  };

  reader.readAsArrayBuffer(files[0]);
}

function sendMessageToContentScript(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
      if (callback) callback(response);
    });
  });
}

function fillForm() {
  sendMessageToContentScript(
    { cmd: "FILL_FORM", sheetJSON: sheetJSON },
    function(response) {
      console.log(response);
    }
  );
}

$(function() {
  // internationalize
  $('#upload-label').text(chrome.i18n.getMessage("uploadLabel"));
  $('#parse-btn').text(chrome.i18n.getMessage("parseBtn"));
  $('#fill-btn').text(chrome.i18n.getMessage("fillBtn"));

  // set up parse button event
  $("#parse-btn").click(parseExcelFile);

  // set up fill button event
  $("#fill-btn").click(fillForm);
});
