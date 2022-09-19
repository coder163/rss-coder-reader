import {autoUpdater} from 'electron-updater'
import {ipcMain, BrowserWindow, dialog} from 'electron'

import log from "../../util/log";


/**
 * -1 检查更新失败 0 正在检查更新 1 检测到新版本，准备下载 2 未检测到新版本 3 下载中 4 下载完成
 **/
// 负责向渲染进程发送信息
function Message(mainWindow: BrowserWindow, type: Number, data?: any) {

    const senddata = {
        state: type,
        msg: data || ''
    }
    mainWindow.webContents.send('UpdateMsg', senddata)
}
const path=require('path')
// 更新应用的方法
export default (mainWindow: BrowserWindow) => {
    // 在下载之前将autoUpdater的autoDownload属性设置成false，通过渲染进程触发主进程事件来实现这一设置(将自动更新设置成false)
    autoUpdater.autoDownload = false
    //设置版本更新地址，即将打包后的latest.yml文件和exe文件同时放在
    // autoUpdater.setFeedURL('http://localhost:10086/public')

    // 当更新发生错误的时候触发。
    autoUpdater.on('error', (err: any) => {
        log.log(err)
    })
    // 手动下载更新文件
    ipcMain.on('confirm-downloadUpdate', () => {
        autoUpdater.downloadUpdate()
    })
    // 发现可更新数据时
    autoUpdater.on('update-available', (info) => {
        log.log('update-available', '发现可更新数据时触发', info.releaseNotes)
        mainWindow.webContents.send('update-confirm',info.releaseNotes)


    })
    // 没有可更新数据时
    autoUpdater.on('update-not-available', () => {
        log.log('update-not-available', '没有可更新数据时')
        mainWindow.webContents.send('update-confirm',[])
    })
    // 下载监听
    autoUpdater.on('download-progress', (progressObj: any) => {
        log.log('download-progress', '下载监听')
        Message(mainWindow, 3, progressObj)
    })
    // 下载完成
    autoUpdater.on('update-downloaded', () => {
        log.log('下载完成')
        Message(mainWindow, 4,)
    })

    // 退出并安装
    ipcMain.on('confirm-update', () => {
        autoUpdater.quitAndInstall()
    })


}