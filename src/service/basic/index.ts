// @ts-ignore
import {RunResult} from "sqlite3";

let sqlite3 = require('sqlite3').verbose();

import {getConfigPath} from '@/util/common'
import log from "@/util/log";

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
