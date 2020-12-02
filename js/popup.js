function initUploadComponent() {
  $("#fileUploadInput").change(function(event) {
    let fileUploadInput = $(event.target);
  
    // remove previews
    let fileUploadPreviews = fileUploadInput.next('.file-upload-previews').first();
    fileUploadPreviews.empty();
  
    // no file was chosen
    if(fileUploadInput.val()=='')
      return ;
  
      let fileUploadPreview = $(`
      <div class="file-upload-preview">
        <div class="file-upload-render">
          <i class="fas fa-file file-upload-file-icon"></i>
          <span class="file-upload-extension"></span>
        </div>
        <div class="file-upload-preview-details">
          <button class="btn btn-raised file-upload-remove-file-btn">
            <i class="far fa-trash-alt"></i>
          </button>
          <div class="file-upload-details-container">
            <div class="file-uplod-preview-details-inner">
              <p class="file-upload-file-name"></p>
              <p class="file-upload-preview-message">Click to replace</p>
            </div>
          </div>
        </div>
      </div>
    `);
  
    let fileExt = '';
    let file = fileUploadInput.prop('files')[0];
    if(file.type === 'application/vnd.ms-excel') {
      fileExt = 'xls';
    } else if(file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      fileExt = 'xlsx';
    } else {
      fileExt = '?';
    }
    fileUploadPreview.find('.file-upload-extension').first().text(fileExt);
    fileUploadPreview.find('.file-upload-file-name').first().text(file.name);
  
    fileUploadPreview.find('.file-upload-remove-file-btn').first().click(function(){
      fileUploadInput.val('');
      fileUploadPreview.remove();
    });
  
    fileUploadPreviews.append(fileUploadPreview);
  });
};



function show(event, $ripple) {
  // 鼠标右键不产生涟漪
  if (event instanceof MouseEvent && event.button === 2) {
    return;
  }

  const touchStartX = event.pageX;
  const touchStartY = event.pageY;

  // 涟漪位置
  const offset = $ripple.offset();
  const height = $ripple.innerHeight();
  const width = $ripple.innerWidth();
  const center = {
    x: touchStartX - offset.left,
    y: touchStartY - offset.top,
  };
  const diameter = Math.max(
    Math.pow(Math.pow(height, 2) + Math.pow(width, 2), 0.5),
    48,
  );

  // 涟漪扩散动画
  const translate =
    `translate3d(${-center.x + width / 2}px,` +
    `${-center.y + height / 2}px, 0) scale(1)`;

  // 涟漪的 DOM 结构，并缓存动画效果
  let div = $(
    `<div class="ripple-wave" ` +
      `style="width:${diameter}px;height:${diameter}px;` +
      `margin-top:-${diameter / 2}px;margin-left:-${diameter / 2}px;` +
      `left:${center.x}px;top:${center.y}px;"></div>`,
  )
  div.data('_ripple_wave_translate', translate);
  div.prependTo($ripple);
  div.each(function() {
    return this.clientLeft;
  });
  div.css('transform', translate);
}

function transitionEnd($el, callback) {
  function fireCallback(event) {
    if (event.target !== this) {
      return;
    }

    // @ts-ignore
    callback.call(this, event);

    $el.off(event, fireCallback);
  }

  $el.on('transitionend', fireCallback);
}

function removeRipple($wave) {
  if (!$wave.length || $wave.data('_ripple_wave_removed')) {
    return;
  }

  $wave.data('_ripple_wave_removed', true);

  let removeTimer = setTimeout(() => $wave.remove(), 400);
  const translate = $wave.data('_ripple_wave_translate');

  $wave.addClass('ripple-wave-fill');
  $wave.css('transform', translate.replace('scale(1)', 'scale(1.01)'));

  transitionEnd($wave,()=> {
      clearTimeout(removeTimer);

      $wave.addClass('ripple-wave-out');
      $wave.css('transform', translate.replace('scale(1)', 'scale(1.01)'));

      removeTimer = setTimeout(() => $wave.remove(), 700);

      setTimeout(() => {
        transitionEnd($wave, () => {
          clearTimeout(removeTimer);
          $wave.remove();
        });
      }, 0);
  });

}

function hide(event) {
  const $ripple = $(event.target);

  $ripple.children('.ripple-wave').each((_, wave) => {
    removeRipple($(wave));
  });

  $ripple.off('mousemove mouseup mouseleave', hide);
}


function showRipple(event) {
   // Chrome 59 点击滚动条时，会在 document 上触发事件
  if (event.target === document) {
    return;
  }

  const $target = $(event.target);

  // 获取含 .ripple 类的元素
  const $ripple = $target.hasClass('ripple')
    ? $target
    : $target.parents('.ripple').first();

  if (!$ripple.length) {
    return;
  }

  show(event, $ripple);

  $ripple.on('mousemove mouseup mouseleave', hide);
}

/* $(() => {
  $(document).on('mousedown', showRipple);
}); */







// global variables
let logger = {};

// check if any file was selected
function checkFile(fileUploadInput) {
  return new Promise((resolve, reject) => {
    logger.log('check file...', 'INFO');

    if (!fileUploadInput.val()) {
      logger.log('no file was selected', 'ERROR');
      reject();
      return;
    }

    logger.log('check file done!', 'INFO');
    resolve(fileUploadInput.prop("files")[0]);
  });
}

// parse file
function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    logger.log('start parsing...',  'INFO');

    let reader = new FileReader();
    reader.onload = function(event) {
      let rawData = event.target.result;

      try {
        let wb = XLSX.read(rawData, {
          type: "array"
        });

        sheetJSON = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        logger.log('parse finished', 'INFO');
        resolve(sheetJSON);
      } catch (e) {
        logger.log('parse error: ' + e, 'ERROR');
        reject();
      }

      return ;
    };

    reader.readAsArrayBuffer(file);
  });
}

// fill out the form
function fillForm(json) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ url: "http://*/jwweb/XSCJ/*", windowType: "popup" }, function(tabs) {
      if(tabs.length <=0 ) {
        logger.log('can\'t find target page', 'ERROR');
        reject();
        return ;
      }

      chrome.tabs.sendMessage(tabs[0].id, { cmd: "FILL_FORM", sheetJSON: json }, function(resp) {
        if(resp.status==='successful') {
          logger.log(resp.message, 'INFO');
          resolve();
        }
        else {
          logger.log(resp.message, 'ERROR');
          reject();
        }
      });
    });
  });
}


function startProcessing() {
  let progress = $(`
    <div class="progress">
      <div class="progress-container">
        <div class="progress-message">
          <p>message</p>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-indeterminate"></div>
        </div>
      </div>
    </div>
  `);

  logger.log = function(msg, level) {
    progress.find('.progress-message p').first().text(msg);
  }

  $("#startBtn").after(progress);
  progress.fadeIn('slow');

  checkFile($("#fileUploadInput"))
    .then(parseExcelFile)
    .then(fillForm)
    .then(()=>{
      logger.log('DONE!', 'SUCCESS');
      progress.find('.progress-message p').first().css('color', 'green');
      progress.find('.progress-bar').first().fadeTo(200, '0');
      setTimeout(() => {
        progress.fadeOut('slow', function(){ progress.remove(); });
      }, 5000);
    })
    .catch(()=>{
      progress.find('.progress-message p').first().css('color', 'red');
      progress.find('.progress-bar .progress-bar-indeterminate').first().css('background-color', 'red');
      setTimeout(() => {
        progress.fadeOut('slow', function(){ progress.remove(); });
      }, 5000);
    });  
}



$(() => {
  // ripple initialization
  $(document).on('mousedown', showRipple);

  // initialize upload component
  initUploadComponent();

  // add click event to start button
  $("#startBtn").click(startProcessing);
});
