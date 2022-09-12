export  interface INodeOption {
    //唯一标识
    id: string;
    //父节点
    pid: string;
    //标题
    label: string;
    //跳转的连接
    link: string;
    //备忘
    remark: string;
    //子节点
    children: Array<INodeOption>;
    //是否订阅,订阅0、收藏1 未分类2
    type: number

}

let NodeOption: INodeOption = {
    //唯一标识
    id: '',
    //父节点
    pid: '',
    //标题
    label: '',
    //跳转的连接
    link: '',
    //备忘
    remark: '',
    //子节点
    children: new Array<INodeOption>(),
    //是否订阅,订阅0、收藏1
    type: 0
}

export default NodeOption;