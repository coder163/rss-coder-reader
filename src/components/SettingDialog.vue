<template>

  <q-dialog v-model="dialogStatus" persistent>
    <q-card style="width: 800px;height:400px">

      <!-- 标题栏start -->
      <q-tabs v-model="tab" dense class="bg-grey-3" align="justify" narrow-indicator>
        <q-tab name="source" label="订阅源"/>
        <q-tab name="alarms" label="偏好设置"/>
        <q-tab name="movies" label="关于"/>

        <q-btn dense flat icon="close" v-close-popup/>
      </q-tabs>
      <q-separator/>
      <!-- 第1个选项卡start -->
      <q-tab-panels v-model="tab" animated>

        <q-tab-panel name="source">
          <q-select v-model="subClassify" :options="subs" label="分类名称：">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>


          <q-input v-model="subText" placeholder="订阅地址：" stack-label dense>
            <template v-slot:append>
              <q-btn round dense flat icon="add" @click="subTitleFocus"/>
            </template>
          </q-input>

          <q-input v-model="subTitle" placeholder="订阅名称(可自动解析)：" stack-label dense/>
          <!-- 加载动画 -->
          <q-inner-loading :showing="loading" label="正在解析，请稍后..." label-style="font-size: 1.1em"/>


        </q-tab-panel>
        <!-- 第2个选项卡start -->
        <q-tab-panel name="alarms">


          <q-select v-model="cleanupModel" :options="cleanup" label="自动清理">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select v-model="frequencyModel" :options="frequency" label="抓取频率">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>


        </q-tab-panel>
        <!-- 第3个选项卡start -->
        <q-tab-panel name="movies">
          <q-img :src="all"/>
        </q-tab-panel>
      </q-tab-panels>


    </q-card>

  </q-dialog>


</template>

<script setup lang="ts">
import all from '@/assets/all.png'

import {onMounted, ref, watch} from "vue";
import TreeServiceImpl from '@/service/source'
import SourceServiceImpl from '@/service/source'
import NodeOption from '@/domain/node'
import Reptile from "@/reptile";
import {ChannelMessage, ResponseCode, SubscriptionType} from "@/domain/enum";
import {feedParse, getUuid} from "@/util/common";
import {logger} from "@/util/log/Log4jsConfig";
import log from "@/util/log";

const {ipcRenderer} = window.require("electron");

let updateModel = ref(true)

let treeServiceImpl: TreeServiceImpl = new TreeServiceImpl()

let dialogStatus = ref(false)
let tab = ref("source")

let subText = ref()
let subTitle = ref()
let subClassify = ref();
//订阅列表
let subs = ref();
//加载动画
let loading = ref(false)
//自动清理
let cleanup = ref([
  "7天以前", "14天以前"
])
let cleanupModel = ref('不清理')

//抓取频率
let frequency = ref([
  "半小时",
  "一小时",
  "一天"
])

let frequencyModel = ref('一小时')

watch(dialogStatus, async (newVal, oldVal) => {

  if (!oldVal) {
    subs.value = await treeServiceImpl.listAllNodeWithType('0', 0);
  }
  subTitle.value = ''
});
ipcRenderer.on(ChannelMessage.APP_SETTINGS_DIALOG_DONE, () => {
  dialogStatus.value = true
})
onMounted(async () => {


});

let sourceService: SourceServiceImpl = new SourceServiceImpl();

async function subTitleFocus() {

  // try {
  //订阅源
  NodeOption.link = subText.value
  //开始解析
  loading.value = true;
  //订阅入库
  await feedParse(NodeOption.link).then((response) => {
    let feeds = response.data;
    if (subTitle.value === '' || subTitle.value === undefined) {
      subTitle.value = feeds[0].meta.title
    }
    //订阅名称
    NodeOption.label = subTitle.value
    if (subClassify.value !== undefined) {
      //获取当前选择节点
      // let optionValue=qselect.value.getOptionValue(subClassify.value);
      //父节点id
      NodeOption.pid = subClassify.value.id
      //订阅类型：订阅
      NodeOption.type = SubscriptionType.SUBSCRIPTION
    } else {
      //订阅类型为未分类
      NodeOption.type = SubscriptionType.UNCATEGORIZED
    }
    NodeOption.id = getUuid()
    //订阅入库
    sourceService.insert(NodeOption)
    //解析入库
    Reptile.parseItem(NodeOption.link, NodeOption.id, feeds).then(() => {
      //刷新列表
      ipcRenderer.send("refresh-sub-list")
      //刷新列表
      ipcRenderer.send("refresh-sub-list")
      loading.value = false;
      dialogStatus.value = false;
    })

  }).catch((e) => {
    log.error(`解析失败：${NodeOption.link}，错误描述${e.message}`)
    loading.value = false;
  })


}
</script>