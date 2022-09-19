import {app, BrowserWindow, globalShortcut, ipcMain, protocol, shell} from 'electron'
import {release} from 'os'
import {join} from 'path'
import Update from "./update";

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
    // /dist
    dist: join(__dirname, '../..'),

    public: join(__dirname, app.isPackaged ? '../..' : '../../../public'),
    root:join(__dirname, app.isPackaged ? '../..' : '../../../')
}
let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`
const indexHtml = join(ROOT_PATH.dist, 'index.html')
// 禁用当前应用程序的硬件加速
app.disableHardwareAcceleration()

async function createWindow() {
    win = new BrowserWindow({
        height: 800,
        width: 1200,
        frame: !app.isPackaged,//添加这一行采用无边框窗口
        icon: join(ROOT_PATH.root, 'favicon.ico'),
        transparent: false,//透明 为true会影响页面缩放
        resizable: true,//可否缩放 为false会影响页面缩放
        movable: true,//可否移动 为false会影响页面缩放
        webPreferences: {
            preload,
            webSecurity: false,//允许跨域请求
            javascript: true,
            plugins: true,
            nodeIntegration: true,// 是否集成 Nodejs
            contextIsolation: false,
            webviewTag: true
        },
    })
    //注册全局快捷键
    globalShortcut.register('ctrl+l', () => {
        win?.webContents.send('key-event-l')
    })
    win.on('maximize', () => {
        win?.webContents.send('WINDOW_MAXIMIZE', true)
    })
    win.on('unmaximize', () => {
        win?.webContents.send('WINDOW_MAXIMIZE', false)
    })

    if (app.isPackaged) {
        win.setMenu(null)
        win.loadFile(indexHtml)
    } else {
        win.loadURL(url)

    }


    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString())
    })

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({url}) => {
        if (url.startsWith('https:')) shell.openExternal(url)
        return {action: 'deny'}
    })
    //引用本地图片问题https://blog.csdn.net/Takayamaaren/article/details/107289994
    protocol.interceptFileProtocol('file', (req, callback) => {
        const url = req.url.substr(8);
        callback(url);
    });
}

app.whenReady().then(() => {
    createWindow()
    if (win)
        //自动更新
        Update(win)
})

//主进程错误
process.on('uncaughtException', function (error) {
   log.err(error)
})
app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow()

    }
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
        },
    })

    if (app.isPackaged) {
        childWindow.loadFile(indexHtml, {hash: arg})
    } else {
        childWindow.loadURL(`${url}/#${arg}`)
        // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
    }
})

//
ipcMain.on("read-content", (event, item) => {
    //通知content.vue渲染
    win?.webContents.send('read-content-done', item)
})
ipcMain.on("update-item-list", (event, ...args) => {

    //通知content.vue渲染
    win?.webContents.send('update-item-list-done', args)
})
//
//
ipcMain.on('refresh-sub-list', (event, url) => {
    win?.webContents.send('refresh-sub-list-done')
})


import {ChannelMessage} from "@/domain/enum"
import {autoUpdater} from "electron-updater";
import log from "@/util/log";

ipcMain.on(ChannelMessage.WINDOW_OPERATION, (event, operation) => {
    switch (operation) {
        case 'minimize':
            win?.minimize();
            break
        case 'maximize':
            if (win?.isMaximized()) {
                win?.restore();
            } else {
                win?.maximize();
            }
            break
        case 'close':
            win?.destroy()
            app.quit();
    }
})
//
/**
 * 菜单-更新检查
 */
ipcMain.on(ChannelMessage.CHECK_UPDATES, () => {
    // const path = require("path")
    // //测试环境下使用自动更新
    // Object.defineProperty(app,"isPackaged",{
    //   get(){
    //     return true
    //   }
    // })
    // if (app.isPackaged) {
    //   autoUpdater.updateConfigPath = path.join(__dirname, '../../../config/dev-app-update.yml');
    // }

    autoUpdater.checkForUpdatesAndNotify()

})

/**
 * 菜单-应用设置
 */
ipcMain.on(ChannelMessage.APP_SETTINGS_DIALOG, () => {

    win?.webContents.send(ChannelMessage.APP_SETTINGS_DIALOG_DONE)
})
ipcMain.on('open-dev-tool', () => {
    win?.webContents.openDevTools()
})