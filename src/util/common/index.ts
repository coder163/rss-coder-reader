import {logger} from "@/util/log/Log4jsConfig";

const FeedParser = require("feedparser");
const request = require('request');
// const path = require('path');
const fs = require("fs")
import path from "path"
import {roundEuro} from "@quasar/extras/material-icons-round";
import {Response} from "request";
import result, {IResult} from "@/domain/result";

// import fs from "fs"


export function feedParse(link: string): Promise<any> {
    const feedparser = new FeedParser()

    let items: any[] = [];

    let optinos = {
        url: link,
        timeout: 1112000
    }
    try {
        request(optinos).pipe(feedparser);
    } catch (e) {
        console.log('抓取失败', e)
    }


    return new Promise((resolve, reject) => {
        feedparser.on('readable', function () {


            let item
            while ((item = feedparser.read())) {
                items.push(item)
            }
        })

        feedparser.on('end', () => {
            resolve(items)
        })
        feedparser.on('error', (err: any) => {
            reject(err)
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
    rimraf(url, function (err: any) { // 删除当前目录下的 test.txt
        if (err) {
            console.log(err);
        }
    });

}

/**
 * 状态码302时获取图片地址
 * @param link
 */
export async function getImgAddr(link: string):Promise<IResult> {
    var options = {
        timeout: 130000,
        url: link,
        followRedirect: false,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept-Charset': 'UTF-8;',
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.9.2.8) Firefox/3.6.8',
        }
    }

    return new Promise((resolve, reject) => {
        request(options, function (error: any, response: any, body: any) {

            try {
                if (error || !response.statusCode) {
                    reject('获取图片真实地址失败')
                    return
                }
                console.log(response.statusCode, link)
                if (response.statusCode === 301 || response.statusCode === 302) {
                    getImgAddr(response.headers.location).then((result) => {

                        resolve(result)
                    });
                    return
                }

                if (response.statusCode === 200) {

                    result.link = link
                    result.type = response.headers["content-type"]

                    resolve(result)
                    return
                }
            }catch (e){
                logger.info('获取图片真实地址失败')
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

/*****************************************************************************************************/



