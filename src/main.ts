import {createApp} from 'vue'
import App from './App.vue'

const app = createApp(App);
// import { Quasar } from 'quasar'

// @ts-ignore
import {Quasar} from 'quasar/dist/quasar.esm.prod'

import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

app.use(Quasar, {
    plugins: [],

})

// highlight 的样式，依赖包，组件
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'  //导入代码高亮样式
//@ts-ignore
import {lineNumbersBlock} from "./util/highlight-line-number";
//@ts-ignore
import CopyButtonPlugin from './util/highlightjs-copy'

hljs.addPlugin(new CopyButtonPlugin({}));


app.directive('hljs', el => {
    let blocks = el.querySelectorAll('pre code');

    blocks.forEach((block: any) => {
        if (block.getAttribute("highlighted") == "true") {
            return
        }
        block.setAttribute("highlighted", "true")
        hljs.highlightElement(block)
        lineNumbersBlock(block)
    })

});


import store from './store'

app.use(store)

app.mount('#app')
    .$nextTick(() => {
        postMessage({payload: 'removeLoading'}, '*')
    })



