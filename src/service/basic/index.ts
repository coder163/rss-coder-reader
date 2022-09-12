// @ts-ignore
import {RunResult} from "sqlite3";

let sqlite3 = require('sqlite3').verbose();

import {getConfigPath} from '@/util/common'
// import {logger} from "@/util/log/Log4jsConfig";
// //官方文档中推荐lowdb的文件大小不超过100MB,因为在js中，格式化json主要用JSON.parse()和JSON.stringify,当超过100MB之后会有无法避免的性能问题。还有如果你使用localStorage， 限制应该是5MB
// import {Low, JSONFile, LowSync, JSONFileSync} from 'lowdb'
// import {ArticleItem, IArticleItem} from "@/domain/article";

//格式化日期为2020-07-06的格式
// let date=new Date().toLocaleDateString().replaceAll("/","-");
// //将来查询是个问题
// const adapter = new JSONFile<Array<IArticleItem>>(`${getConfigPath()}/articles.json`)
// logger.log(`${getConfigPath()}/articles.json`)
//
// const db = new Low(adapter)
//
//
// db.data= []
//
// db.data.push(ArticleItem)

// db.write().then(r => {logger.info('入库完成')})
export default class BasicServiceImpl {
    private database = new sqlite3.Database(`${getConfigPath()}/articles.db`)

    public getDatabase(): any {

        return this.database;
    }

    protected get(sql: string, parameter: any) {
        return new Promise((resolve, reject) => {
            this.getDatabase().get(sql, parameter, (err: Error | null, res: any[]) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
        });
    }

    protected all(sql: string, parameter: any) {

        return new Promise((resolve, reject) => {
            if (parameter === null) {
                this.getDatabase().all(sql, (err: Error | null, res: any[]) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(res)
                })
            } else {
                this.getDatabase().all(sql, parameter, (err: Error | null, res: any[]) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(res)
                })
            }

        });
    }

    protected run(sql: string, parameter: any) {

        this.getDatabase().run(sql, parameter, function (res: RunResult, err: Error | null) {

            if (err) {
                console.log(err);
            }
        });
    }
}
