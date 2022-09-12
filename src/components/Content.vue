<template>

  <q-card id="content" flat :style="{ 'height': props.winHeight + 'px' }">

    <q-scroll-area ref="scrollArea" style="height: 100%; max-width: 100%;">
      <q-card-section v-html="content" v-hljs>

      </q-card-section>
    </q-scroll-area>


  </q-card>

</template>

<script setup lang="ts">
// import ArticleList from "@/components/ArticleList.vue";
import {onMounted, ref} from "vue"

import {getConfigPath} from '@/util/common'
// @ts-ignore
const {ipcRenderer} = window.require("electron")
let content = ref<any>()
let scrollArea = ref<any>(0)

const fs = require("fs")
const props = defineProps({
  winHeight: Number
})

ipcRenderer.on("read-content-done", (ev: any, link: any) => {
  let fpath = `${getConfigPath()}/list/${link}/index.html`

  content.value = fs.readFileSync(fpath, "utf8")
  document.querySelector("#content")?.scrollTo(0, 0);
  scrollArea.value.setScrollPosition('vertical', 0)


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

  background: -webkit-linear-gradient(top, transparent 19px, #ececec 20px), -webkit-linear-gradient(left, transparent 19px, #ececec 20px)
  //background: #cae6ca
  background-size: 20px 20px
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
