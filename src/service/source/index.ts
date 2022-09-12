import BasicServiceImpl from "../basic";

import {INodeOption} from "@/domain/node"

/**
 * 树形菜单管理 参数
 */
export default class SourceServiceImpl extends BasicServiceImpl {


    /**
     * 添加订阅
     */
    public insert(nodeOption: INodeOption) {

        let sql: string = "INSERT INTO t_source(id,label, pid,link,remark,type) VALUES ($id,$title,$pid,$link,$remark,$type)";
        let parameter = {$id: nodeOption.id, $title: nodeOption.label, $pid: nodeOption.pid, $link: nodeOption.link, $remark: nodeOption.remark, $type: nodeOption.type}
        this.run(sql, parameter);

    }

    public async findByPidAndType(pid: string = "0", type: number = 0): Promise<INodeOption[]> {
        let sql = "select * from t_source where pid=$pid and type=$type";
        return await this.all(sql, {$pid: pid, $type: type}) as Array<INodeOption>;
    }

    public async findByid(id: string = "0"): Promise<INodeOption> {

        return await this.get("select * from t_source where id=$id", {$id: id}) as INodeOption;
    }


    /**
     * 查询所有节点
     */
    public async listByType(type: number = 0): Promise<INodeOption[]> {
        let sql: string = "select * from t_source where type=$type"
        return await this.all(sql, {$type: type}) as Array<INodeOption>;
    }

    public async list(): Promise<INodeOption[]> {
        let sql: string = "select * from t_source"
        return await this.all(sql, null) as Array<INodeOption>;
    }

    /**
     * 组装树形结构
     */
    public async listAllNodeWithType(pid: string = "0", type: number = 0): Promise<Array<INodeOption>> {

        let rootNodes = await this.findByPidAndType(pid, type);

        let allNodes = await this.listByType(type)
        let list: Array<INodeOption> = new Array();
        rootNodes.forEach(root => {
            root.children = this.getNestedChildren(allNodes, root.id);
            list.push(root)
        });


        return list;
    }

    public getNestedChildren(arr: Array<INodeOption>, id: string): INodeOption[] {
        const res = new Array<INodeOption>;
        for (let item of arr) {
            if (item.pid === id) {
                const children = this.getNestedChildren(arr, item.id);
                if (children.length) {
                    item.children = children;
                }
                res.push(item);
            }
        }
        return res;
    }

    public updateById(node: INodeOption) {

        let sql: string = "UPDATE t_source SET `label`=$title,link=$link,pid=$pid WHERE `id`=$id";
        let parameter = {$title: node.label, $link: node.link, $pid: node.pid, $id: node.id}
        this.run(sql, parameter);
    }

    public delByid(id: string) {

        let sql: string = "DELETE FROM t_source  WHERE `id`=$id";
        let parameter = {$id: id}
        this.run(sql, parameter);
    }

    public delByPid(pid: number) {

        let sql: string = "DELETE FROM t_source  WHERE `pid`=$pid";
        let parameter = {$pid: pid}
        this.run(sql, parameter);
    }
}