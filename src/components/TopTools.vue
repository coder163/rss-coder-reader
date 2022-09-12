<template>
  <q-bar id="win-tool" class="q-electron-drag">
    <!--    <div>搜索</div>-->
    <q-space/>
    <q-btn dense flat icon="expand_more" size="md" class="q-electron-drag--exception">
      <q-menu fit>
        <q-list>
          <q-item clickable v-close-popup @click="checkUpdates">
            <q-item-section>检查更新</q-item-section>
          </q-item>
          <q-separator/>
          <q-item clickable v-close-popup @click="appSettings">
            <q-item-section>应用设置</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="devTool">
            <q-item-section>打开控制台</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <q-btn dense flat icon="remove" @click="windowOperation('minimize')" class="q-electron-drag--exception"/>

    <q-btn flat dense @click="windowOperation('maximize')" class="q-electron-drag--exception">
      <img src="@/assets/maximize.png" v-if="maxStatus"/>
      <q-icon name="crop_square" v-if="!maxStatus"/>
    </q-btn>
    <q-btn dense flat icon="close" @click="windowOperation('close')" class="q-electron-drag--exception"/>

  </q-bar>
</template>

<script setup lang="ts">
import {ipcRenderer} from "electron";
import {ChannelMessage} from "@/domain/enum";
import {ref} from "vue";

let maxStatus = ref(false)

/**
 * 应用设置
 */
function appSettings() {
  ipcRenderer.send(ChannelMessage.APP_SETTINGS_DIALOG);
}

/**
 * 检查更新窗口
 */
function checkUpdates() {
  ipcRenderer.send(ChannelMessage.CHECK_UPDATES);
}
function devTool(){
  ipcRenderer.send('open-dev-tool');
}
/**
 * 窗口操作消息
 * @param operation
 */
function windowOperation(operation: string): void {
  ipcRenderer.send(ChannelMessage.WINDOW_OPERATION, operation);
}

/**
 * 监听窗口操作消息，最大化更换图标
 */
ipcRenderer.on(ChannelMessage.WINDOW_MAXIMIZE, (event, status) => {
  maxStatus.value = status
})
</script>

<style scoped>

</style>