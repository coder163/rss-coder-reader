import TreeServiceImpl from "../service/source";
import {getConfigPath, getDateString, getImgAddr, getUuid, mkdirsSync} from '../util/common'
import ArticleListServiceImpl from "../service/list";
import {ArticleItem, IArticleItem} from "@/domain/article";
import {ArticleServiceImpl} from "@/service/article";
import {SubscriptionType} from "@/domain/enum";
import {logger} from "@/util/log/Log4jsConfig";
import {IResult} from "@/domain/result";

const fs = require("fs")

const {v4: uuid} = require("uuid");

const cheerio = require("cheerio");


let tsi: TreeServiceImpl = new TreeServiceImpl();
let alsi = new ArticleListServiceImpl();

let asi = new ArticleServiceImpl()
const download = require('download')
export default class Reptile {

    public static async parseArticle(item: IArticleItem) {
        //创建当前文章的目录
        let fpath = `${getConfigPath()}/list/${item.path}`
        mkdirsSync(`${fpath}/imgs`)

        //解析并替换图片路径
        let $ = cheerio.load(item.summary);

        let imgs = $("img");
        for (let i = 0; i < imgs.length; i++) {
            //获取正常的值
            let source = $(imgs[i]).attr("src");
            // debugger
            //如果不是以http开头的尝试获取懒加载地址
            if (!source.startsWith('http')) {
                if (source.startsWith("/")) {
                    //临时解码并提取url中的域名
                    let domain = (decodeURIComponent(item.link).match(/(\w+):\/\/([^/:]+)(:\d*)?/) as RegExpMatchArray)[0];
                    source = domain + source;
                } else {
                    //处理懒加载
                    source = $(imgs[i]).attr("data-original");
                    if (source === undefined) {
                        source = $(imgs[i]).attr("data-actualsrc");
                    }
                }
            }
            if (source === undefined) {
                continue
            }
            try {
                $(imgs[i]).attr("referrerpolicy", null)
                //获取图片地址
                let res: IResult = await getImgAddr(source)
                logger.info(`当前正在解析第${i}张图，地址：${res.link}`)
                //除去#
                // @ts-ignore
                let suffix = res?.type?.split('/')[1]
                //重新命名
                let imgName = `${uuid().replaceAll("-", "")}.${suffix}`;
                //下载图片
                await download(res.link, `${fpath}/imgs/`, {filename: imgName})
                $(imgs[i]).attr("src", `file:///${fpath}/imgs/${imgName}`);
            }catch (e){
                logger.error(`图片下载失败：${source}`,e)
            }


        }

        mkdirsSync(fpath)
        fs.writeFileSync(`${fpath}/index.html`, $.html()) //文件写入成功。
        logger.info(`文章抓取完成：${item.title}`)
    }

    /**
     * 解析指定订阅源
     * @param link 源连接
     * @param tid 当前文章的所有者源
     * @param feeds feedParse函数解析之后的数组
     */
    public static async parseItem(link: string, tid: string, feeds: any) {

        try {
            //解析feed
            // let feed = await feedParse(link);
            for (let index = 0; index < feeds.length; index++) {
                logger.info(`当前文章${feeds[index].title}, ${feeds[index].link} `)
                //需要校验该文章是否已经存在，不存在再入库
                // let count = await alsi.countByTitle(feeds[index.ts].title.replace(/\s*!/g, ""));
                //
                // if (count.cunt > 0) {
                //     console.log(`当前文章已经存在：${count.cunt},地址：${feeds[index.ts].link}`)
                //     continue;
                // }
                await Reptile.warehousing(feeds[index], tid)
            }

            logger.info(`所有文章抓取完成,共 ${feeds.length} 篇`)
        } catch (e) {
            console.log('抓取失败', e)
        }


    }

    /**
     * 解析入库
     * @param item feed的解析项
     * @param tid 当前文章的所有者源
     */
    public static async warehousing(item: any, tid: string) {

        ArticleItem.summary = ''
        ArticleItem.id = 0;
        ArticleItem.title = item.title.replace(/\s*!/g, "")
        ArticleItem.link = item.link
        ArticleItem.path = getUuid()
        ArticleItem.tid = tid
        ArticleItem.sign = SubscriptionType.SUBSCRIPTION
        ArticleItem.updateTime = getDateString()
        alsi.insert(ArticleItem)
        logger.info(`解析入库${ArticleItem.title}`)
        //摘要不入库(太大了)
        ArticleItem.summary = item.description
        //爬取文章正文，入库
        await Reptile.parseArticle(ArticleItem);

    }

    public static async rss() {
        //查询树获取源,更新每个源中的文章列表，同时绑定该节点
        // this.parseItem(await tsi.list());

        //点击节点获取对应的文章列表


    };

}

