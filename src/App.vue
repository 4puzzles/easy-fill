<template>
  <div :style="pos">
    <SmileOutlined class="icon" v-show="state === 'ready'" :style="{ color: '#08c' }" />
    <LoadingOutlined class="icon" v-show="state === 'loading'" :style="{ color: '#08c' }" />
    <FrownOutlined class="icon" v-show="state === 'error'" :style="{ color: '#ff4d4f' }" />
    <input ref="input" class="file-upload-input" type="file"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      @change="handleChange($event)">
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { SmileOutlined, LoadingOutlined, FrownOutlined } from '@ant-design/icons-vue';
import * as XLSX from 'xlsx';

import FinalHandler from './handlers/FinalHandler';
import ResitHandler from './handlers/ResitHandler';

let handler = null;
const pos = {};

// final grades
if(location.pathname.includes('/XSCJ/Tea_KCCJLR_add_temp')) {
  pos.position = 'absolute';
  pos.top = '40px';
  pos.right = '300px';
  handler = new FinalHandler;
} else if(location.pathname.includes('/XSCJ/TEA_BKCJ_ADD')) {
  pos.position = 'absolute';
  pos.top = '40px';
  pos.right = '300px';
  handler = new ResitHandler;
} else {
  pos.display = 'none';
}



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

      return;
    };

    reader.readAsArrayBuffer(file);
  });
}

const handleChange = (event) => {
  state.value = 'loading';
  checkFile(event.target)
    .then(parseExcelFile)
    .then((sheetJSON) => {
      return handler.fillWith(sheetJSON)
    })
    .then(n => {
      state.value = 'ready';
      const msg = n + (n === 1 ? ' row affected' : ' rows affected');
      console.log('easy-fill: ' + msg);
      message.success(msg);
    })
    .catch(err => {
      state.value = 'error';
      console.error(err);
      message.error(err.message);
    })
    .finally(() => {
      // reset file upload input
      // so that the change event can be retriggered if users upload the same file
      input.value.value = '';
    });
};

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

/*
.file-upload-input::-webkit-file-upload-button {
  cursor:pointer;
}
*/
</style>
