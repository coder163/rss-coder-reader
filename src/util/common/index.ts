import $axios from "@/util/api";

const FeedParser = require("feedparser");
const request = require('request');
// const path = require('path');
const fs = require("fs")
import path from "path"
import {result, IResponseResult, IResult, responseResult} from "@/domain/result";
import {ResponseCode} from "@/domain/enum";
import log from "@/util/log";
import {AxiosResponse} from "axios";


export function feedParse(link: string): Promise<IResponseResult> {
    const feedparser = new FeedParser()

    let items: any[] = [];

    // 为给定 ID 的 user 创建请求


    return new Promise(async (resolve, reject) => {
        let resp = null
        try {
            resp = await $axios({
                timeout: 3000,
                method: 'get',
                url: link,
                responseType: 'stream'
            })
            console.log(resp)

            resp.data.pipe(feedparser);

            feedparser.on('readable', function () {
                let item
                while ((item = feedparser.read())) {
                    items.push(item)
                }
            })

            feedparser.on('end', () => {

                responseResult.code = ResponseCode.SUCCESS;

                responseResult.data = items;

                resolve(responseResult)

            })
            feedparser.on('error', (err: any) => {
                responseResult.code = ResponseCode.FAIL;
                responseResult.message = err.message;
                log.error('抓取失败')
                reject(responseResult)
            })
        } catch (e: any) {
            console.log('解析失败', e)
            responseResult.code = ResponseCode.FAIL;
            responseResult.message = e.message;
            reject(responseResult)
        }
    })

}


/**
 * url 网络文件地址
 * filename 文件名
 * callback 回调函数
 */

// 递归创建目录 同步方法
export function mkdirsSync(dirname: string) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

const rimraf = require('rimraf');

//删除文件夹
export function delDirSync(path: string) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach((file: any, index: number) => {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                delDirSync(curPath); //递归删除文件夹

            } else {
                // console.log(`【删除】${curPath}`)
                try {
                    fs.unlinkSync(curPath); //删除文件
                } catch (error) {
                    console.log("删除出错：", error);
                }
            }
        });
        log.info(`删除【${path}】`)
        rimraf(path, function (err: any) { // 删除当前目录下的 test.txt
            if (err) {
                log.error(err);
            }
        });

    }
}

// export function delDirSync(url: string) {
//     log.info(`删除【${url}】`)
//     rimraf(url, function (err: any) { // 删除当前目录下的 test.txt
//         if (err) {
//             log.error(err);
//         }
//     });
//
// }



/**
 * 获取配置文件路径articles.db
 */

export function getConfigPath() {

    return path.join(process.cwd(), "/config").replace(/\\/g, "/")
}

const {v4: uuid} = require("uuid");

/**
 * 获取唯一的id
 */
export function getUuid(): string {


    return uuid().replaceAll("-", "")
}

export function getDateString(): string {
    //格式化日期为2020-07-06的格式
    return new Date().toLocaleDateString().replaceAll("/", "-");
}




