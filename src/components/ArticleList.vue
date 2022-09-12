<template>

  <q-card :style="{ 'background-color': '#f7f6f4', 'height': props.winHeight + 'px' }">
    <q-scroll-area style="height: 98%; max-width: 100%;">
      <q-card-section>

        <q-list separator>
          <q-item :id="'article-list-contextmenu'+index" clickable v-for="(item,index) in itemList" :active="item.id === itemId" @click="click(item)">
            <q-item-section>
              <q-item-label>{{ item.title }}
              </q-item-label>
            </q-item-section>

            <!--右键菜单-->
            <q-popup-proxy context-menu :target="'#article-list-contextmenu'+index">
              <q-list padding dense style="background:#e8e8e9">
<!--                <q-item clickable v-ripple v-close-popup @click="favorites(item)">-->
<!--                  <q-item-section>-->
<!--                    <q-item-label>加入收藏</q-item-label>-->
<!--                  </q-item-section>-->
<!--                </q-item>-->

                <q-item clickable v-ripple v-close-popup @click="copy(item.link)">
                  <q-item-section>
                    <q-item-label>复制链接</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple v-close-popup @click="openInBrowser(item.link)">
                  <q-item-section>
                    <q-item-label>在浏览器中打开</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-popup-proxy>
          </q-item>

        </q-list>

      </q-card-section>
    </q-scroll-area>
  </q-card>


</template>

<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {IArticleItem} from "@/domain/article";
import ArticleListServiceImpl from "@/service/list";
import {logger} from "@/util/log/Log4jsConfig";

const {shell} = require('electron');

const {ipcRenderer} = window.require("electron");
const emit = defineEmits(["actvie"]);
const props = defineProps({
  winHeight: Number
})


let itemList = ref<IArticleItem[]>();


let itemId = ref<any>(0);
ipcRenderer.on("update-item-list-done", async (ev: any, cid: any) => {

  itemList.value = await new ArticleListServiceImpl().findItemByTid(cid);
});

onMounted(async () => {
  // itemList.value = await new ArticleListServiceImpl().findItemByTid(12);

  // itemList.value = store.getters.getItemList;

});

function click(item: IArticleItem) {

  // logger.info(item)
  itemId.value = item.id;
  ipcRenderer.send("read-content", item.path);
}

/**
 * 收藏文章
 */
function collectArticlesItemMenu(ev: MouseEvent, item: IArticleItem) {

  const point = {
    x: ev.clientX,
    y: ev.clientY
  };
  ipcRenderer.send('side-contextmenu-item', JSON.stringify(point), JSON.stringify(item))
}

/**
 * 在浏览器中打开
 */


function openInBrowser(url: string) {
  // console.log(url)
  shell.openExternal(url);
}

/**
 * 复制到剪贴板//@ts-ignore
 */
const {clipboard} = require('electron')

function copy(url: string) {
  clipboard.writeText(url)
}

/**
 * 加入收藏
 * @param item 收藏项
 */
// function favorites(item: IArticleItem) {
//
//   let articleListService: ArticleListServiceImpl = new ArticleListServiceImpl();
//   ipcRenderer.send("update-item-list",item.tid)
//
//   item.tid = "14"
//
//   articleListService.updateSign(item)
//
//   //更新侧边栏
//   ipcRenderer.send("refresh-sub-list")
//
//
// }
</script>

<style scoped>
</style>
