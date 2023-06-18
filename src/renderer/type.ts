import { ContainerItem, MarkdownAST } from "../base/ast";

export type MarkitViewFunc = (content: string | MarkdownAST[] | ContainerItem[] | any, props: any) => string | HTMLElement
export interface MarkitRuleMap { [key: string]: MarkitViewFunc }
