<template>


  <div id="app-home" :style="{ height:( winHeight-32) + 'px' }">

    <!-- 侧边栏 -->
    <div class="side" :style="{ display: isHide }">

      <q-bar class="q-electron-drag" style="background-color:#ecf0f6;">
        <img src="@/assets/logo.png" />
        <div>猿阅</div>
        <q-space />
      </q-bar>
      <side></side>
    </div>
    <!-- 主体内容 -->
    <div class="main-container">
      <top-tools />
      <q-splitter v-model="splitterModel" :limits="[20, 95]">
        <template v-slot:before>
          <!-- 文章列表 -->
          <article-list :winHeight="( winHeight-32)"></article-list>
        </template>
        <template v-slot:after>
          <!-- 文章内容 -->
          <content :winHeight="( winHeight-32)"></content>
        </template>
      </q-splitter>
    </div>
  </div>
  <setting-dialog />
  <update />

</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import ArticleList from "@/components/ArticleList.vue";
import Content from "@/components/Content.vue";
import Side from "./components/Side.vue";
import Update from "@/components/Update.vue";
import TopTools from "@/components/TopTools.vue";
import SettingDialog from "@/components/SettingDialog.vue";

const { ipcRenderer } = window.require("electron");
let splitterModel = ref(25) // start at 50%

let winHeight = ref<number>(document.documentElement.clientHeight);
let dialogStatus = ref(true)
//改变对话框状态
ipcRenderer.on('setting-dialog-done', async () => {
  dialogStatus.value = true
})
/**
 * 隐藏和显示
 */
let hide = ref(false)
let text = ref()
//计算属性
let isHide = computed(() => {

  return hide.value ? 'none' : 'block'
});
//消息修改隐藏和显示
ipcRenderer.on("key-event-l", (ev) => {
  hide.value = !hide.value;
});

onMounted(() => {
  //获取窗口大小，指定高度
  window.addEventListener(
    "resize",
    function () {
      winHeight.value = document.documentElement.clientHeight;
    },
    false
  );
});

</script>

<style>
#app-home {
  display: flex;
  flex-direction: row;
}

#app-home .main-container {
  flex: 1;

}

#app-home .side {
  width: 260px;
  min-width: 260px;
}



.q-bar--standard>div {
  font-weight: 400;
  font-size: 14px !important;
}
</style>
