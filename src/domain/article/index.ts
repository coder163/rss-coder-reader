export interface IArticleItem {
    //唯一标识
    id: number;
    //文章标题
    title: string;
    //网络路径
    link: string;
    //摘要
    summary: string;
    //树形菜单的id
    tid: string;
    /**
     * 标识，0为普通订阅1收藏
     */
    sign: number;
    //本地路径
    path:string;
    updateTime:string
}

export let ArticleItem: IArticleItem = {
    updateTime: "",
    path: "",
    sign: 0,
    //唯一标识
    id: 0
    ,
    //文章标题
    title: ""
    ,
    //文章连接
    link: ""
    ,
    //摘要
    summary: ""
    ,
    //树形菜单的id
    tid: ''
}

export interface IArticle {
    //唯一标识
    id: number;
    //文章标题
    title: string;
    //文章内容
    content: string;
    //列表的id
    mid: number;

}
