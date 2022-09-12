/**
 * 订阅类型
 */
export enum SubscriptionType {
    //订阅
    SUBSCRIPTION = 0,
    //收藏
    COLLECT = 1,
    //未分类
    UNCATEGORIZED = 2
}

/**
 * -1 检查更新失败 0 正在检查更新 1 检测到新版本，准备下载 2 未检测到新版本 3 下载中 4 下载完成
 */

export enum UpdateStatusCode {

    CHECKING_FOR_UPDATE = 0,

    NEW_VERSION_DETECTED = 1,

    NO_NEW_VERSION_DETECTED = 2,

    DOWNLOADING = 3,

    DOWNLOAD_COMPLETED = 4,
}

//主进程和渲染进程通信消息名称
export enum ChannelMessage {
    //窗口操作
    WINDOW_OPERATION = "WINDOW_OPERATION",
    //窗口最大化，用户更换图
    WINDOW_MAXIMIZE = "WINDOW_MAXIMIZE",
    //检查更新
    CHECK_UPDATES = 'CHECK_UPDATES',
    //应用设置
    APP_SETTINGS_DIALOG = 'APP_SETTINGS_DIALOG',
    APP_SETTINGS_DIALOG_DONE = 'APP_SETTINGS_DIALOG_DONE'
}