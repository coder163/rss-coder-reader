import BasicServiceImpl from "../basic";
import {IArticleItem} from "@/domain/article";

export default class ArticleListServiceImpl extends BasicServiceImpl {

    /**
     * 加入收藏
     * @param item 收藏的文章
     */
    public updateSign(item: IArticleItem) {

        let sql: string = `UPDATE t_artice_list
                           SET sign=$sign,
                               tid=$tid
                           WHERE id = $id`
        this.run(sql, {$sign: item.sign, $tid: item.tid, $id: item.id})
    }

    public insert(item: IArticleItem) {
        if (item === null || item === undefined) {
            console.log("空值，不入库")
            return
        }
        let sql: string = "INSERT INTO t_artice_list(title, link,tid,sign,summary,path,updateTime) VALUES ($title,$link,$tid,$sign,$summary,$path,$updateTime)";
        let parameter = {$title: item.title, $link: item.link, $tid: item.tid, $sign: item.sign, $summary: item.summary, $path: item.path, $updateTime: item.updateTime}
        this.run(sql, parameter);

    }

    public countByTitle(title: string): Promise<any> {

        let sql: string = 'SELECT count(id) as cunt FROM t_artice_list where title=$title';

        let parameter = {$title: title}

        return new Promise(async (resolve, reject) => {
            resolve((await this.get(sql, parameter)));
        })

    }

    public async findItemByTid(tid: string): Promise<Array<IArticleItem>> {

        let sql: string = 'SELECT * FROM t_artice_list where tid=$tid';

        let parameter = {$tid: tid}

        return new Promise(async (resolve, reject) => {
            resolve((await this.all(sql, parameter)) as Array<IArticleItem>);
        })

    }

    public delByTidAndSign(id: string, sign: number) {

        let sql: string = "  DELETE FROM t_artice_list  WHERE `tid`=$tid and sign=$sign";
        let parameter = {$tid: id, $sign: sign}
        this.run(sql, parameter);
    }
}