<template>
  <q-card style="height:100%;background:#e8e8e9" flat>
    <q-scroll-area style="height: 80%;" id="side-context-menu">
      <q-popup-proxy context-menu :target="'#side-context-menu'">
        <q-list padding dense style="background:#e8e8e9">
          <q-item clickable v-ripple v-close-popup>
            <q-item-section @click="dialogClassify = true">
              <q-item-label>新建分类</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-popup-proxy>

      <q-card-section>
        <q-list>
          <!-- 分类管理 -->
          <q-expansion-item :id="'classify' + (index)" v-for="(sub, index) in subs" default-opened dense :label="sub.label">
            <!-- 右键菜单绑定到指定元素 -->
            <q-popup-proxy context-menu :target="'#classify' + index">

              <q-list padding dense style="background:#e8e8e9">

                <q-item clickable v-ripple v-close-popup @click="classifyRenameDialog($event, sub)">

                  <q-item-section>
                    <q-item-label>重命名</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator/>

                <q-item clickable v-ripple v-close-popup @click="classifyDelDialog($event, sub)">

                  <q-item-section>
                    <q-item-label>删除分类</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-popup-proxy>

            <!-- 订阅管理 -->
            <q-list padding dense>

              <q-item header-inset-level="1" :id="'sub' + ch.id" clickable v-ripple :inset-level="0" v-for=" ch in sub.children" @click="click(ch)">
                <!-- 右键菜单绑定到指定元素 -->
                <q-popup-proxy context-menu :target="'#sub' + ch.id">

                  <q-list padding dense style="background:#e8e8e9">

                    <q-item clickable v-ripple v-close-popup @click="subRenameDialog($event, ch)">
                      <q-item-section>
                        <q-item-label>编辑</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator/>
                    <q-item clickable v-ripple v-close-popup @click="subUpdateDialog($event, ch)">
                      <q-item-section>
                        <q-item-label>更新</q-item-label>

                      </q-item-section>
                    </q-item>
                    <q-separator/>
                    <q-item clickable v-ripple v-close-popup @click="subDelDialog($event, ch)">

                      <q-item-section>
                        <q-item-label>删除订阅</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-popup-proxy>
                <q-item-section>
                  <q-item-label>{{ ch.label }}</q-item-label>
                </q-item-section>

              </q-item>
            </q-list>

          </q-expansion-item>

        </q-list>

      </q-card-section>
    </q-scroll-area>



  </q-card>

  <!-- 对话框-添加分类 persistent-->
  <q-dialog v-model="dialogClassify">
    <q-card>
      <q-card-section class="row ">
        添加分类
        <q-space/>
        <q-btn icon="close" flat round dense v-close-popup/>
      </q-card-section>
      <q-card-section style="width: 400px">
        <q-input v-model="classifyText" placeholder="分类名称" stack-label dense/>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat label="保存" color="primary" v-close-popup @click="addClassify"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!--修改分类对话框-->
  <q-dialog v-model="dialogUpdateClassify">
    <q-card>
      <q-card-section class="row ">
        修改分类
        <q-space/>
        <q-btn icon="close" flat round dense v-close-popup/>
      </q-card-section>
      <q-card-section style="width: 400px">

        <q-input v-model="classifyText" placeholder="分类名称" stack-label dense/>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn flat label="保存" color="primary" v-close-popup @click="renameClassify"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!--确认对话框-->
  <q-dialog v-model="dialogConfirm">
    <q-card>
      <q-card-section class="row ">
        <q-space/>
        <!--        <q-btn icon="close" flat round dense v-close-popup/>-->
      </q-card-section>
      <q-card-section style="width: 400px">
        {{ message }}
      </q-card-section>
      <q-card-actions align="center">

        <q-btn v-if="classifyShowing" flat label="删除分类" color="primary" v-close-popup @click="classifyDel"/>
        <q-btn v-if="!classifyShowing" flat label="删除订阅" color="primary" v-close-popup @click="subDel"/>
        <q-btn flat label="取消" color="primary" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!--修改订阅对话框-->
  <q-dialog v-model="dialogSub">
    <q-card>
      <q-card-section class="row ">
        修改订阅
        <q-space/>
        <q-btn icon="close" flat round dense v-close-popup/>
      </q-card-section>
      <q-card-section style="width: 400px">
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

        </q-input>

        <q-input v-model="subTitle" placeholder="订阅名称：" stack-label dense/>

      </q-card-section>
      <q-card-actions align="center">

        <q-btn flat label="保存" color="primary" v-close-popup @click="updateSub"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";

import TreeServiceImpl from '@/service/source'
import ArticleListServiceImpl from '@/service/list/'
import NodeOption, {INodeOption} from '@/domain/node'
import {delDirSync, feedParse, getConfigPath, getUuid} from '@/util/common'
import Reptile from '@/reptile'
import {SubscriptionType} from "@/domain/enum";

const {ipcRenderer} = window.require("electron");

//订阅列表
let subs = ref();
//收藏列表
let favorites = ref();

let classifyShowing = ref(false)

//订阅对话框
let dialogSub = ref(false)
//分类对话框
let dialogClassify = ref(false)
//修改分类
let dialogUpdateClassify = ref(false);
//确认对话框
let dialogConfirm = ref(false)


let message = ref('')
//分类输入框
let classifyText = ref();
//订阅下拉框
let subClassify = ref()
//订阅输入框
let subText = ref();
//订阅标题
let subTitle = ref();
//订阅的id用于标注是修改还是新增
let subId = ref();

let articleListService: ArticleListServiceImpl = new ArticleListServiceImpl()

let treeServiceImpl: TreeServiceImpl = new TreeServiceImpl()


onMounted(async () => {
  subs.value = await treeServiceImpl.listAllNodeWithType("0", 0);


});
//订阅列表
ipcRenderer.on('refresh-sub-list-done', async () => {
  subs.value = await treeServiceImpl.listAllNodeWithType("0", 0);
})


/**
 * 新增分类
 */
async function addClassify() {
  NodeOption.id = getUuid()
  NodeOption.label = classifyText.value;
  NodeOption.pid = "0"
  NodeOption.link = ""
  NodeOption.type = 0
  treeServiceImpl.insert(NodeOption)
  subs.value = await treeServiceImpl.listAllNodeWithType("0", 0);
}


/**
 * 修改订阅
 */
async function updateSub() {


  let sub = currentClassify.value
  if (!sub) return;
  sub.label = subTitle.value
  sub.link = subText.value
  sub.pid = subClassify.value.id

  treeServiceImpl.updateById(sub)
  subs.value = await treeServiceImpl.listAllNodeWithType("0", 0);
}

function click(info: any) {

  //通知主线程
  ipcRenderer.send("update-item-list", info.id);
}

let currentClassify = ref<INodeOption>()

/**
 * 分类重命名
 */
async function classifyRenameDialog(ev: MouseEvent, item: INodeOption) {

  classifyText.value = item.label
  currentClassify.value = item;
  dialogUpdateClassify.value = true;
}

//保存分类重命名
async function renameClassify() {

  // //根据id查询
  let node = await treeServiceImpl.findByid(currentClassify.value?.id)
  node.label = classifyText.value
  //更新信息
  treeServiceImpl.updateById(node);
  //重新读取菜单
  subs.value = await treeServiceImpl.listAllNodeWithType("0", 0);
}


/**
 * 删除分类
 */
function classifyDelDialog(ev: MouseEvent, item: INodeOption) {
  message.value = `此操作会删除【${item.label}】分类下所有订阅和未收藏文件`
  currentClassify.value = item;
  dialogConfirm.value = true
  //分类删除
  classifyShowing.value = true;
}

/**
 * 更新订阅(单个)
 */
async function subUpdateDialog(ev: MouseEvent, item: INodeOption) {
  let feeds = await feedParse(item.link);

  Reptile.parseItem(item.link, item.pid, feeds)
}

/**
 * 重命名订阅对话框
 */
async function subRenameDialog(ev: MouseEvent, item: INodeOption) {
  dialogSub.value = true
  subText.value = item.link
  subTitle.value = item.label
  subId.value = item.id
 subClassify.value= (await treeServiceImpl.findByid(item.pid)).label
  currentClassify.value = item;

}

/**
 * 删除订阅确认框
 */
function subDelDialog(ev: MouseEvent, item: INodeOption) {
  message.value = `此操作会删除【${item.label}】订阅项下所有文件`
  currentClassify.value = item;
  dialogConfirm.value = true
  classifyShowing.value = false;
}

/**
 * 确认删除订阅
 */
async function subDel() {

  if (!currentClassify.value?.id) return
  //查询当前订阅的文章列表

  let items = await articleListService.findItemByTid(currentClassify.value.id);
  //删除当前订阅
  treeServiceImpl.delByid(currentClassify.value.id)
  //删除当前订阅的文章列表,0
  articleListService.delByTidAndSign(currentClassify.value.id, SubscriptionType.SUBSCRIPTION)

  items.forEach((value, index, array) => {
    //删除该分类下的文件
    delDirSync(getConfigPath() + "/list/" + value.path)
  })
  //重新渲染菜单
  subs.value = await treeServiceImpl.listAllNodeWithType("0", 0);

  // ipcRenderer.send("update-item-list", currentClassify.value.id)
}

//确认删除分类
async function classifyDel() {
  if (!currentClassify.value?.id) return
  //查询当前分类下所有的子节点
  let itemList = await treeServiceImpl.findByPidAndType(currentClassify.value.id, 0)
  //删除当前分类
  treeServiceImpl.delByid(currentClassify.value.id)
  //删除该分类对应的订阅内容
  for (let i = 0; i < itemList.length; i++) {
    //删除当前分类的子节点
    treeServiceImpl.delByid(itemList[i].id)

    let items = await articleListService.findItemByTid(itemList[i].id);
    //删除子分类对应的列表项
    articleListService.delByTidAndSign(itemList[i].id, SubscriptionType.SUBSCRIPTION)
    items.forEach((value, index, array) => {
      //删除该分类下的文件
      delDirSync(getConfigPath() + "/list/" + value.path)
    })
  }


  //重新渲染菜单
  subs.value = await treeServiceImpl.listAllNodeWithType("0", 0);
}

</script>

<style>
#card-footer {
  border-top: 1px solid #c7c5c5;
  position: absolute;
  bottom: 0;
  padding: 5px 15px 5px 15px;
  width: 100%;
  z-index: 1000;
  background-color: #e8e8e9;
}
</style>
  