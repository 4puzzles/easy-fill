<template>
  <div :style="style">
    <SmileOutlined class="icon" v-show="state==='ready'" :style="{ color: '#08c' }"/>
    <LoadingOutlined class="icon" v-show="state==='loading'" :style="{ color: '#08c' }"/>
    <FrownOutlined class="icon" v-show="state==='error'" :style="{ color: '#ff4d4f' }"/>
    <input
      ref="input"
      class="file-upload-input"
      type="file"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      @change="handleChange($event)"
    >
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { message } from 'ant-design-vue';
import { SmileOutlined, LoadingOutlined, FrownOutlined } from '@ant-design/icons-vue';
import * as XLSX from 'xlsx';

import config from './config.js';
import console from './console.js';

export default defineComponent({
  name: "easy-fill-button",

  components: {
    SmileOutlined,
    LoadingOutlined,
    FrownOutlined,
  },

  setup() {
    const state = ref('ready');
    const input = ref(null);

    const checkFile = (fileUploadInput) => {
      return new Promise((resolve, reject) => {
        console.info('start to check file ...');
        if (fileUploadInput.value === '') {
          reject(new Error('no file is selected'));
          return;
        }
        console.info('file checked');
        resolve(fileUploadInput.files[0]);
      });
    }

    const parseExcelFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const rawData = event.target.result;

          try {
            const wb = XLSX.read(rawData, {
              type: "array"
            });

            const sheetJSON = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            console.info('excel file parsed: %o', sheetJSON);
            resolve(sheetJSON);
          } catch (e) {
            reject(e);
          }

          return ;
        };

        console.info('start to parse excel file ...');
        reader.readAsArrayBuffer(file);
      });
    }

    const callGetBFselblur = (elementID, row) => {
      const targetWindow = window.frames[0];
      const curInput = targetWindow.document.getElementById(elementID + row);

      // getBFselblur is a predefined function
      // when the user inputs a score, the function will be called
      // and the final score will be calculated
      // here we just simulate the same situation
      targetWindow.getBFselblur(String(row), '1', '1', curInput);
    }

    /*
    const processSheetJSON = (sheetJSON) => {
      return new Promise((resolve, reject) => {
        // get target document object
        const doc = window.frames[0].document;

        // TODO: check deadline
        // the first table tag is about deadline information

        // select the second table tag
        const table = doc.querySelector('table:last-child');
        if(table === null) {
          reject(new Error('Target table not found'));
          return ;
        }

        let count = 0;
        for(let i=1; ;i++) {
          const trID = "#hh"+ i;
          const curtr = table.querySelector(trID);

          // no more students
          if(curtr === null) {
            break;
          }

          const studentID = curtr.querySelectorAll('td')[1].textContent.trim();
          const studentName = curtr.querySelectorAll('td')[2].textContent.trim();

          for(const key in sheetJSON) {
            if(!sheetJSON[key]["学号"] || !sheetJSON[key]["姓名"])
              continue;

            const sheetJSONStudentID = sheetJSON[key]["学号"] ? sheetJSON[key]["学号"].toString().trim() : '';
            const sheetJSONStudentName = sheetJSON[key]["姓名"] ? sheetJSON[key]["姓名"].toString().trim() : '';

            if(studentID !== sheetJSONStudentID || studentName !== sheetJSONStudentName)
              continue;


            const score1 = parseFloat(sheetJSON[key]['平时']);
            const score2 = parseFloat(sheetJSON[key]['末考']);

            let affected = false;
            if(!isNaN(score1)) {
              curtr.querySelector('#CHKPSCJ'+i).value = score1;
              callGetBFselblur('CHKPSCJ', i);
              affected = true;
            }

            if(!isNaN(score2)) {
              curtr.querySelector('#CHKQMCJ'+i).value = score2;
              callGetBFselblur('CHKQMCJ', i);
              affected = true;
            }

            if(affected) {
              ++count;
            }

            break;
          }
        }

        resolve(count + ' rows affected');
      });
    }
    */
    const processSheetJSON = (sheetJSON) => {
      return new Promise((resolve, reject) => {
        console.info('start to process the sheet data ...')
        let count = 0;
        for(const row of currentConfig.rows()) {
          for(const i in sheetJSON) {
            if(row.tryFillRowData(sheetJSON[i])) {
              ++count;
              break;
            }
          }
        }

        console.info('the sheet data processed');
        resolve(count);
      });
    }

    const currentConfig = config.find(({ path }) => path === location.pathname);
    const handleChange = (event) => {
      state.value = 'loading';

      console.info('start to initialize ...');
      try {
        currentConfig.init();
      } catch(err) {
        console.error(`${err.message}\ntargetDoc: %o\ntargetTable: %o`, err.cause.targetDoc, err.cause.targetTable);
        message.error('找不到目标填充区域。您是否忘记检索课程了？');
        state.value = 'error';
        input.value.value = '';
        return ;
      }
      console.info('initialize successfully');

      checkFile(event.target)
        .then(parseExcelFile)
        .then(processSheetJSON)
        .then(count => {
          state.value = 'ready';
          console.info(`${count} ${count===1?'row':'rows'} affected`);
          message.success(`已修改${count}行。`);
        })
        .catch(err => {
          state.value = 'error';
          console.error('%o', err);
          message.error(`填充失败，请检查Excel文件格式及内容是否正确。`);
        })
        .finally(()=>{
          // reset file upload input
          // so that the change event can be retriggered if users upload the same file
          input.value.value = '';
        });
    };

    return {
      state,
      input,
      handleChange,
      style: currentConfig.style,
    };
  },
})
</script>

<style scoped>
.icon {
  font-size: 20px;
}

.file-upload-input {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  width: 100%;
  height: 100%;

  font-size: 0;

  opacity: 0;

  cursor: pointer;
}
</style>
