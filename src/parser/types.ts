
export type TagType = RegExp | [RegExp, string]

export interface InlineMarkdownRule {
    tag: TagType[] | TagType
    getProps?: (raw: string, state: {[key:string]:any}) => any
    trimText?: (raw: string) => string
    recheck?: (raw: string) => boolean
    order?: number
    allowNesting?: boolean
}


export interface BlockMarkdownRule {
    tag: TagType[] | TagType
    getProps?: (raw: string, state: {[key:string]: any}) => any
    trimText?: (raw: string, ...args: any) => string
    recheck?: (raw: string) => boolean
    order?: number
    parseContent?: (text: string, parseInline: any, parseBlock: any) => any
    blockType?: "container" | "leaf"
}

export interface InlineMarkdownRules {
    [key: string]: InlineMarkdownRule
}

export interface BlockMarkdownRules {
    [key: string]: BlockMarkdownRule
}
