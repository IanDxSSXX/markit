
export type TagType = RegExp | RegExp[]


export interface MarkdownRule {
    tag: TagType
    getProps?: (raw: string, state: {[key:string]:any}) => any
    trimText?: (raw: string) => string
    recheck?: (raw: string) => boolean
    order?: number
}


export interface InlineMarkdownRule extends MarkdownRule {
    allowNesting?: boolean
}


export interface BlockMarkdownRule extends MarkdownRule{
    parseContent?: (text: string, parseInline: any, parseBlock: any) => any
    blockType?: "container" | "leaf"
}

export interface InlineMarkdownRules {
    [key: string]: InlineMarkdownRule
}

export interface BlockMarkdownRules {
    [key: string]: BlockMarkdownRule
}
