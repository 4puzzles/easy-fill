<template>
  <div class="top-right">
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
import XLSX from 'xlsx';

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
        if (fileUploadInput.value === '') {
          reject(new Error('No file is selected'));
          return;
        }
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
            //console.log(sheetJSON);
            resolve(sheetJSON);
          } catch (e) {
            console.error(e);
            reject(new Error('Fail to parse the file'));
          }

          return ;
        };

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
            const score3 = parseFloat(sheetJSON[key]['实验']);


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

            if(!isNaN(score3)) {
              curtr.querySelector('#CHKJNCJ'+i).value = score3;
              callGetBFselblur('CHKJNCJ', i);
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

    const handleChange = (event) => {
      state.value = 'loading';
      checkFile(event.target)
        .then(parseExcelFile)
        .then(processSheetJSON)
        .then(msg=>{
          state.value = 'ready';
          console.log('easy-fill: ' + msg);
          message.success(msg);
        })
        .catch(err => {
          state.value = 'error';
          console.error(err);
          message.error(err.message);
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
    };
  },
})
</script>

<style scoped>
.top-right {
  position: absolute;
  top: 40px;
  right: 300px;
}

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

/*
.file-upload-input::-webkit-file-upload-button {
  cursor:pointer;
}
*/
</style>
