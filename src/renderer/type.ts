import {ContainerItem, MarkdownAST} from "../base/ast";

export type MarkdownerViewFunc = (content: string|MarkdownAST[]|ContainerItem[]|any, props: any)=>string
export interface MarkdownerRuleMap {[key:string]: MarkdownerViewFunc}
