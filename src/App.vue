<template>
  <div :class="[appStyle]">
    <SmileOutlined class="icon" v-show="state === 'ready'" style="color: #08c;" />
    <LoadingOutlined class="icon" v-show="state === 'loading'" style="color: #08c;" />
    <FrownOutlined class="icon" v-show="state === 'error'" style="color: #ff4d4f;" />
    <input ref="fileInput" class="file-upload-input" type="file"
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      @change="handleChange($event)">
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { message } from 'ant-design-vue'
import { SmileOutlined, LoadingOutlined, FrownOutlined } from '@ant-design/icons-vue'
import * as XLSX from 'xlsx'

import FinalHandler from './handlers/FinalHandler'
import ResitHandler from './handlers/ResitHandler'

let handler: Handler
const appStyle = ref('app-hide')

if(location.pathname.includes('/XSCJ/Tea_KCCJLR_add_temp')) {
  appStyle.value = 'app-on-final-page'
  handler = new FinalHandler
} else if(location.pathname.includes('/XSCJ/TEA_BKCJ_ADD')) {
  appStyle.value = 'app-on-resit-page'
  handler = new ResitHandler
}


const state = ref('ready')
const input = useTemplateRef('fileInput')

const checkFile = (fileUploadInput: HTMLInputElement): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (fileUploadInput.value === '') {
      reject(new Error('No file is selected'))
      return
    }
    resolve(fileUploadInput.files![0])
  })
}

const parseExcelFile = (file: File): Promise<SheetJSON> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const rawData = event.target!.result

      try {
        const wb = XLSX.read(rawData, {
          type: "array"
        })

        const sheetJSON: SheetJSON = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        resolve(sheetJSON)
      } catch (e) {
        console.error(e)
        reject(new Error('Fail to parse the file'))
      }
    };

    reader.readAsArrayBuffer(file)
  });
}

const handleChange = (event: Event) => {
  state.value = 'loading'
  checkFile(event.target as HTMLInputElement)
    .then(parseExcelFile)
    .then((sheetJSON) => {
      return handler!.fillWith(sheetJSON)
    })
    .then(n => {
      state.value = 'ready'
      const msg = n + (n === 1 ? ' row affected' : ' rows affected')
      console.log('easy-fill: ' + msg)
      message.success(msg)
    })
    .catch(err => {
      state.value = 'error'
      console.error(err)
      message.error(err.message)
    })
    .finally(() => {
      // reset file upload input
      // so that the change event can be retriggered if users upload the same file
      input.value!.value = ''
    })
};

</script>

<style scoped>
.app-on-final-page {
  position: absolute;
  top: 40px;
  right: 300px;
}

.app-on-resit-page {
  position: absolute;
  top: 40px;
  right: 300px;
}

@media (max-width: 1500px) {
  .app-on-resit-page {
    right: 100px;
  }
}

@media (max-width: 1200px) {
  .app-on-resit-page {
    right: 50px;
  }
}

.app-hide {
  display: none;
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
</style>
