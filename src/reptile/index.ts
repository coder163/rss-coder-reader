import TreeServiceImpl from "../service/source";
import {getConfigPath, getDateString, getImgAddr, getUuid, mkdirsSync} from '@/util/common'
import ArticleListServiceImpl from "../service/list";
import {ArticleItem, IArticleItem} from "@/domain/article";
import {ArticleServiceImpl} from "@/service/article";
import {ResponseCode, SubscriptionType} from "@/domain/enum";
import {IResponseResult, IResult} from "@/domain/result";
import log from "@/util/log";

const fs = require("fs")

const {v4: uuid} = require("uuid");

const cheerio = require("cheerio");


let tsi: TreeServiceImpl = new TreeServiceImpl();
let alsi = new ArticleListServiceImpl();

let asi = new ArticleServiceImpl()
const download = require('download')
export default class Reptile {

    public static async parseAndDownloadImg($: any, link: string, path: string, cb: Function): Promise<string> {
        let fpath = `${getConfigPath()}/list/${path}`
        let imgs = $("img");
        let isWrite = false;
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < imgs.length; i++) {
                cb(imgs.length, i, isWrite)
                //获取正常的值
                let source = $(imgs[i]).attr("src");
                if (source.startsWith('file:///')) {
                    continue
                }
                //执行到此处表示存在非file协议的图片路径
                isWrite = true;

                // debugger
                //如果不是以http开头的尝试获取懒加载地址
                if (!source.startsWith('http')) {
                    if (source.startsWith("/")) {
                        //临时解码并提取url中的域名
                        let domain = (link.match(/(\w+):\/\/([^/:]+)(:\d*)?/) as RegExpMatchArray)[0];
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
                $(imgs[i]).attr("referrerpolicy", null)

                try {
                    //获取图片地址
                    let res: IResponseResult = await getImgAddr(source)
                    if (res.code === ResponseCode.FAIL) {
                        log.error(`图片地址获取失败`)
                    }
                    // @ts-ignore
                    let suffix = res?.type?.split('/')[1]
                    //重新命名
                    let imgName = `${uuid().replaceAll("-", "")}.${suffix}`;
                    //下载图片
                    await download(res.data.link, `${fpath}/imgs/`, {
                        filename: imgName,
                        timeout: 500
                    })
                    log.info(`当前正在解析第${i + 1}张图，地址：${res.data.link}`)
                    $(imgs[i]).attr("src", `file:///${fpath}/imgs/${imgName}`);

                } catch (e: any) {
                    log.error(`图片下载失败...：${e.message}`)
                }


            }
            resolve($.html())

        })


    }

    public static async parseArticle(item: IArticleItem) {
        //创建当前文章的目录
        let fpath = `${getConfigPath()}/list/${item.path}`
        mkdirsSync(`${fpath}/imgs`)
        //解析并替换图片路径
        let $ = cheerio.load(item.summary);


        for (const element of $("a")) {
            //'javascript':openExternal(${$(element).attr('href')})
            $(element).attr('target',null)
            $(element).attr('href',`javascript:openExternal('${$(element).attr('href')}')`)
        }

        //清理HTML
        let html = Reptile.clearAttrByHtml(Reptile.trimHtml($.html()))

        mkdirsSync(fpath)
        fs.writeFileSync(`${fpath}/index.html`, html) //文件写入成功。
        log.info(`文章抓取完成：${item.title}`)
    }



    public static clearAttrByHtml(strText: string) {

        return strText.replace(/\s*\b(style|alt|class|id|loading)=".*?"/ig, '')
    }

    // 删掉＜style＞＜/style＞＜script＞＜/script＞标签及其内容
    public static trimHtml(html: string) {
        return html
            .replace(/<!--.*?-->/gi, '')
            .replace(/\/\*.*?\*\//gi, '')
            .replace(/[ ]+</gi, '<')
            // .replace(/<script[^]*<\/script>/gi, '')
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            // .replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi', '')
            // .replace(/(\(function()[^]*)()/gi, '')
            // .replace(/<style[^]*<\/style>/gi, '');
            //.replace('/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi', '')
            .replace(/<style>[\s\S]*?<\/style>/ig, '')
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

                //需要校验该文章是否已经存在，不存在再入库
                let count = await alsi.countByTitle(feeds[index].title.replace(/\s*!/g, ""));
                if (count.cunt > 0) {
                    console.log(`当前文章已经存在：${count.cunt},地址：${feeds[index].link}`)
                    continue;
                }
                log.info(`当前文章${feeds[index].title}, ${feeds[index].link} `)
                await Reptile.warehousing(feeds[index], tid)
            }

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
        log.info(`解析入库${ArticleItem.title}`)
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

