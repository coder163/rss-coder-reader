const FeedParser = require("feedparser");
const request = require('request');
// const path = require('path');
const fs = require("fs")
import path from "path"
import {result, IResponseResult, IResult, responseResult} from "@/domain/result";
import {ResponseCode} from "@/domain/enum";
import log from "@/util/log";


export function feedParse(link: string): Promise<IResponseResult> {
    const feedparser = new FeedParser()

    let items: any[] = [];

    // 为给定 ID 的 user 创建请求


    return new Promise((resolve, reject) => {
        request({
            url: link,
            timeout: 3000
        }, function (err: any, httpResponse: any, body: any) {
            if (err) {
                responseResult.code = ResponseCode.FAIL;
                responseResult.message = err.message;
                reject(responseResult)
            }
        }).pipe(feedparser)


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

export function delDirSync(url: string) {
    log.info(`删除【${url}】`)
    rimraf(url, function (err: any) { // 删除当前目录下的 test.txt
        if (err) {
            log.error(err);
        }
    });

}

/**
 * 状态码302时获取图片地址
 * @param link
 */
export async function getImgAddr(link: string): Promise<IResponseResult> {
    var options = {
        timeout: 500,
        url: link,
        followRedirect: false,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept-Charset': 'UTF-8;',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9.2.8) Firefox/3.6.8',
        }
    }

    return new Promise((resolve, reject) => {
        request(options, async function (error: any, response: any, body: any) {

            if (error || !response.statusCode) {
                responseResult.code = ResponseCode.FAIL
                responseResult.message = `获取图片真实地址失败${error.message}：${link}`
                reject(responseResult)
                return
            }
            // console.log(response.statusCode, link)
            if (response.statusCode === 301 || response.statusCode === 302) {

                await getImgAddr(response.headers.location).then((result) => {
                    responseResult.code = ResponseCode.SUCCESS
                    responseResult.data = {
                        "link": result?.data.link,
                        "type": result?.data.type
                    }
                    // log.info(`图片重定向${result?.data.link}`)
                    resolve(responseResult)
                    return
                }).catch((e) => {
                    responseResult.code = ResponseCode.FAIL
                    responseResult.message = e.message
                    reject(responseResult)
                })


            }

            if (response.statusCode === 200) {

                responseResult.code = ResponseCode.SUCCESS
                responseResult.data = {
                    "link": link,
                    "type": response.headers["content-type"]
                }
                resolve(responseResult)
                return
            }


        })
    })

}

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




