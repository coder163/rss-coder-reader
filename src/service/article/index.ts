import BasicServiceImpl from "./../basic"
import {IArticle, IArticleItem} from "@/domain/article";

/**
 * 文章管理
 */

export class ArticleServiceImpl extends BasicServiceImpl {


    public insert(article: IArticle) {
        if (article === null || article === undefined) {
            console.log("空值，不入库")
            return
        }
        let sql: string = "INSERT INTO t_article ( title,content,mid   )VALUES ($title,$content, $mid );";
        let parameter = {$title: article.title, $content: article.content, $mid: article.mid}
        this.run(sql, parameter);
    }
}

