import {ContainerItem, MarkdownAST} from "../base/ast";

export type MarkdownerViewFunc = (content: string|MarkdownAST[]|ContainerItem[]|any, props: any)=>string|HTMLElement
export interface MarkdownerRuleMap {[key:string]: MarkdownerViewFunc}
