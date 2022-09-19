export interface IResult {
    link: string,
    type: string
}

let result: IResult = {
    link: "", type: ""

}

export interface IResponseResult {
    code: number,
    message: string;
    data: any
}

let responseResult: IResponseResult = {
    code: 0, data: undefined, message: ""

}

export {
    result,
    responseResult,
};

// export default result