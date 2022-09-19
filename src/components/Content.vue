<template>

  <q-card id="content" flat :style="{ 'height': props.winHeight + 'px' }">

    <!--    &lt;!&ndash; 加载动画 &ndash;&gt;-->
    <q-inner-loading :showing="loading" :label="loadingMessage" style=" background:rgba(232, 232, 233,0.5);hsla(0,100%,80%,0.5);" label-style="font-size:1.1em"/>


    <q-scroll-area ref="scrollArea" style="height: 100%; max-width: 100%;" v-if="!loading">


      <q-card-section v-html="content" v-hljs>

      </q-card-section>

    </q-scroll-area>


  </q-card>

</template>

<script setup lang="ts">
// import ArticleList from "@/components/ArticleList.vue";
import {onMounted, ref, getCurrentInstance, computed} from "vue"

const {ipcRenderer} = window.require("electron")
import {getConfigPath} from '@/util/common'
import Reptile from "@/reptile";

const cheerio = require("cheerio");
import {watch} from 'vue'
import log from "@/util/log";
//加载动画
let loading = ref(false)
let loadingMessage = ref<string>('首次加载需要下载图片，请稍后。。。')
let content = ref<any>()
let scrollArea = ref<any>()
let filePath = ref();
let articleitem = ref()
const fs = require("fs")

const props = defineProps({
  winHeight: Number
})
watch(articleitem, (value, oldValue, onCleanup) => {


})
watch(filePath, async (value, oldValue, onCleanup) => {
  loading.value = true;
  //这种方式可以
  if (value === oldValue) {
    log.info('路径无变化，同一个文件');
    return
  }

  document.querySelector("#content")?.scrollTo(0, 0);
  scrollArea.value?.setScrollPosition('vertical', 0)
  fs.readFile(filePath.value, "utf8", (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      //防止读取失败依然加载
      loading.value = false;
      log.error(err.message)
      return
    }
    let article = articleitem.value
    //是否需要重新写入文件，如果图片变动，并做了替换
    let write=false

    // //重新解析文章，替换img的src
    Reptile.parseAndDownloadImg(cheerio.load(data), article.link, article.path, (length: number, index: number,isWrite:boolean) => {
      loadingMessage.value = `正在缓存图片至本地，共 ${length} 张 当前 ${index + 1} 张，请稍后`

      write=isWrite;
    }).then((resp) => {
      loading.value = false;
      content.value = resp;
      if(write){
        log.info(`图片解析完成，重写入文件${write}`)
        //重写本地文件
        fs.writeFileSync(filePath.value, resp)
      }

    }).catch((e) => {
      log.error(e)
    })


  })


})

ipcRenderer.on("read-content-done", async (ev: any, item: any) => {

  let article = JSON.parse(item);
  articleitem.value = article
  filePath.value = `${getConfigPath()}/list/${article.path}/index.html`
})


onMounted(() => {
  content.value = fs.readFileSync(`${getConfigPath()}/index/index.html`, "utf8")
});
</script>

<style lang="sass">


.hljs-copy-alert
  transform: translate(-50%, -50%)
  position: fixed
  top: 50%
  left: 50%
  z-index: 9999
  height: 30px
  padding-left: 10px
  padding-right: 10px
  line-height: 30px
  color: #fff
  background: rgba(0, 0, 0, 0.7)
  font-size: 12px
  border-radius: 4px

/*复制按钮*/
.hljs-copy-button
  border-radius: 4px
  border: 1px solid #ececec
  font-size: 12px
  float: right
  color: #000
  position: relative
  top: 0px
  right: 45px
  padding: 0 10px
  z-index: 100
  line-height: 25px
  width: 80px
  text-align: center
  background-color: #ececec
  opacity: 0.5


.hljs-copy-button:hover
  opacity: 100
  filter: alpha(opacity=100)


/*行号*/
.hljs-ln-numbers
  text-align: center
  color: #ccc
  border-right: 1px solid #ccc
  vertical-align: top
  padding-right: 5px !important


/* for block of code */
.hljs-ln-code
  padding-left: 5px !important


code
  font-family: "Consolas", Helvetica, Arial, sans-serif !important
  font-size: 14px !important


#content

  //background: -webkit-linear-gradient(top, transparent 19px, #ececec 20px), -webkit-linear-gradient(left, transparent 19px, #ececec 20px)
  //background: #ecf0f6
  //background-size: 20px 20px
  font-family: "Open Sans", "Clear Sans", "Helvetica Neue", Helvetica, Arial, sans-serif
  color: rgb(51, 51, 51)
  line-height: 1.6
  font-size: 16px

  img
    // width: auto
    max-width: 90% !important
  // border-radius: 12px
  // display: block
  // margin: 10px auto
  // object-fit: contain
  // box-shadow: 2px 4px 7px #999
  pre
    // overflow-x:scroll
    margin: 0px !important
    white-space: pre-wrap
    word-wrap: break-word

  p
    word-wrap: break-word !important
    word-break: break-all !important

  a
    word-wrap: break-word !important
    word-break: break-all !important

  h1,
  h2,
  h3,
  h4,
  h5,
  h6
    position: relative
    margin-top: 1rem
    margin-bottom: 1rem
    font-weight: bold
    line-height: 1.4
    cursor: text


  /*================表格开始================*/














  table:not(.hljs-ln)
    display: table
    // width: 100%
    text-align: left


  table:not(.hljs-ln) tbody
    border: 0


  table:not(.hljs-ln) tr
    border: 0
    border-top: 1px solid #ccc
    background-color: white


  /*隔行改变行的背景色，如需要请打开*/














  table:not(.hljs-ln) tr:nth-child(2n)
    background-color: #f8f8f8


  table:not(.hljs-ln) tr th,
  table:not(.hljs-ln) tr td
    font-size: 1em
    border: 1px solid #ccc
    padding: 0.5em 1em
    text-align: left


  /*表头的属性*/














  table:not(.hljs-ln) tr th
    font-weight: bold
    background-color: #f0f0f0


  /*================表格结束================*/















  blockquote
    padding: 10px 10px 10px 1rem
    font-size: 0.9em
    margin: 1em 0px
    color: rgb(0, 0, 0)
    border-left: 5px solid #10c921
    background: rgb(239, 235, 233)


  h1 tt,
  h1
    font-size: inherit


  h2 tt,
  h2
    font-size: inherit


  h3 tt,
  h3
    font-size: inherit


  h4 tt,
  h4
    font-size: inherit


  h5 tt,
  h5
    font-size: inherit


  h6 tt,
  h6
    font-size: inherit


  h1
    font-size: 2.25em
    line-height: 1.2
    border-bottom: 1px solid #eee


  h2
    font-size: 1.75em
    line-height: 1.225
    border-bottom: 1px solid #eee


  h3
    font-size: 1.5em
    line-height: 1.43


  h4
    font-size: 1.25em


  h5
    font-size: 1em


  h6
    font-size: 1em
    color: #777


  ul,
  ol
    padding-left: 20px
    list-style-type: disc


  p,
  ul,
  ol,
  dl,
  table
    margin: 0.8em 0


  li > ol,
  li > ul
    margin: 0 0


  hr
    height: 2px
    padding: 0
    margin: 16px 0
    background-color: #e7e7e7
    border: 0 none
    overflow: hidden
    box-sizing: content-box


  ul,
  ol
    padding-left: 30px


  ul:first-child,
  ol:first-child
    margin-top: 0


  ul:last-child,
  ol:last-child
    margin-bottom: 0

</style>
