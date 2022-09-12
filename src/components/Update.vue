<template>
  <q-dialog v-model="updateDialogConfirm" persistent>
    <q-card>
      <q-card-section class="row ">
        提示
        <q-space/>
        <q-btn icon="close" flat round dense v-close-popup/>
      </q-card-section>
      <q-card-section style="width: 400px">
        <div v-if="!progressShow" class="text-center">无需更新，已经是最新版！</div>
        <div v-else>发现新版本 </div>
        <ul>
          <li v-for="(item) in updateInfo">{{ item }}</li>
        </ul>
      </q-card-section>

      <q-card-section v-if="progressShow">
        <q-linear-progress stripe rounded size="25px" :value="percent" color="secondary">
          <div class="absolute-full flex flex-center">
            <q-badge style="background: transparent;color:#1D1D1D " :label="schedule"/>
          </div>
        </q-linear-progress>
      </q-card-section>
      <q-card-actions align="center"  v-if="progressShow">
        <q-btn flat label="立即更新" color="primary" @click="downloadUpdate"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import {ipcRenderer} from "electron";
import {onMounted, ref} from "vue";
import {UpdateStatusCode} from "@/domain/enum";

let updateDialogConfirm = ref<boolean>(false)

let schedule = ref<string>('0.00%');
let percent = ref<number>(0.0);
let updateInfo = ref()
let updateMessage = ref<string>('正在连接服务器...');
//进度条是否显示
let progressShow=ref(false)

ipcRenderer.on('update-confirm', (e, info) => {
  progressShow.value=true
  updateDialogConfirm.value = true;
  updateInfo.value = info
})

/**
 * 立即更新按钮被点击
 */
function downloadUpdate(){
  ipcRenderer.send("confirm-downloadUpdate")
}
ipcRenderer.on('UpdateMsg', (event, args) => {

  switch (args.state) {
    case UpdateStatusCode.CHECKING_FOR_UPDATE:
      updateMessage.value = '正在检查更新';
      break
    case UpdateStatusCode.NEW_VERSION_DETECTED:
      progressShow.value=true
      updateMessage.value = '检测到新版本';

      break;
    case UpdateStatusCode.NO_NEW_VERSION_DETECTED:
      updateMessage.value = '当前已经是最新版本';
      progressShow.value=false
      break;
    case UpdateStatusCode.DOWNLOADING:

      updateMessage.value = '下载中....';
      percent.value = parseFloat(Number(args.msg.percent).toFixed(2)) / 100
      schedule.value = Number(percent.value * 100).toFixed(2) + '%'
      break;
    case UpdateStatusCode.DOWNLOAD_COMPLETED:
      progressShow.value=true
      percent.value = parseFloat(Number(100).toFixed(2)) / 100
      schedule.value = Number(100).toFixed(2) + '%'
      ipcRenderer.send('confirm-update')
      break;
  }
})

</script>

<style lang="sass">

</style>