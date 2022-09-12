


## 缓存目录

Linux: $XDG_CACHE_HOME or ~/.cache/electron/

MacOS: ~/Library/Caches/electron/

Windows: %LOCALAPPDATA%/electron/Cache or ~/AppData/Local/electron/Cache/


> electron-builder 在同样的缓存目录下



## 安装 sqllite

```
# 安装这个反而会导致 sqlite3 无法使用(需要匹配node版本)
npm install sqlite3 --save

npm install electron-rebuild --save .\node_modules\.bin\electron-rebuild.cmd

```

临时修改 cmd 的编码为 UTF-8 `chcp 65001`




## TODO

1. 文章内容显示还会出现滚动条(横向)，很难排查具体是什么元素撑开的(文章的样式还待优化)

2. 新增订阅

3. 收藏订阅、文章
   
4. 取消订阅 
 
5. 文章数据的存储策略

6. 以绝对路径替换 img 标签，在后期移动整个目录会导致图片无法使用

## 错误记录

```
Module "path" has been externalized for browser compatibility and cannot be accessed in client code
```

配置vite.config.js


npm install path-browserify


import path from "path-browserify"

export default defineConfig({
    plugins: [vue()],
        resolve: {
        alias: {
        path: "path-browserify",
    },
    },
})

页面中使用

import path from "path"
path.resolve()

参考资料：https://zhuanlan.zhihu.com/p/508879520


## 错误描述

```
Module "fs" has been externalized for browser compatibility and cannot be accessed in client code.
```

参考地址：https://zhuanlan.zhihu.com/p/540056695