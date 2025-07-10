<template>
  <div :class="[appStyle]" @contextmenu="onContextMenu">
    <SmileOutlined class="icon" v-show="state === 'ready'" :style="{ color: '#08c' }" />
    <LoadingOutlined class="icon" v-show="state === 'loading'" :style="{ color: '#08c' }" />
    <FrownOutlined class="icon" v-show="state === 'error'" :style="{ color: '#ff4d4f' }" />
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
import ContextMenu from '@imengyu/vue3-context-menu'

import FinalHandler from './handlers/FinalHandler'

let handler: Handler | null = null
const appStyle = ref('app-hide')

if(location.pathname.includes('/wjstgdfw/cjlr.lrxscj.fkcaskbjlrcj_input.jsp')) {
  appStyle.value = 'app-on-final-page'
  handler = new FinalHandler
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
  if (!handler) {
    console.error('Unexpected page')
    return
  }

  state.value = 'loading'
  checkFile(event.target as HTMLInputElement)
    .then(parseExcelFile)
    .then((sheetJSON) => {
      return handler.fillWith(sheetJSON)
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

const onContextMenu = (e: MouseEvent) => {
  //prevent the browser's default menu
  e.preventDefault();

  if(!handler) {
    return
  }

  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: handler.getContextMenuItems()
  });
}

</script>

<style scoped>
.app-on-final-page {
  position: absolute;
  top: 60px;
  right: 300px;
  width: 20px;
  height: 20px;
}

.app-hide {
  display: none;
}

.icon :deep(svg) {
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
<style>
/* vue3-context-menu */
.mx-context-menu-item .label {
  font-size: 12px;
}
</style>
