import { MarkdownAST } from "../base/ast";
import { MarkitLogger } from "../base/logger";
import { defaultInlineMap } from "./defaultRules/inline";
import { defaultBlockMap } from "./defaultRules/block";
export const MarkitMapBlock: { value?: any } = {}
export const MarkitMapInline: { value?: any } = {}



export function resolveInlineContent(content: any): any {
    // ---- 只有当content和raw不相等时，才做转义，因为可以判断出里面的字符串全是inner的
    if (content instanceof Array && content.length > 0 && content[0].level === "inline") {
        return Inline(content)
    }
    return content
}
export function resolveBlockContent(content: any): any {
    if (content instanceof Array && content.length > 0) {
        if (content[0].level === "inline") {
            content = Inline(content)
        } else if (content[0].level === "block") {
            content = Block(content)
        } else if (content[0].item) {
            content = content.map(({ item, content }) => ({ item: Inline(item), content: Block(content) }))
        }
    }
    return content
}


function InlineElement(markdownAST: MarkdownAST) {
    let map = MarkitMapInline.value ?? defaultInlineMap
    let inlineFunc = map[markdownAST.type]
    let element
    if (inlineFunc) {
        const content = resolveInlineContent(markdownAST.content)
        element = inlineFunc(content, markdownAST.props)
    } else {
        MarkitLogger.warn("Render-inline", `didn't have a block map named ${markdownAST.type}, treat it as plain text`)
        element = markdownAST.raw
    }
    return element
}

export function Inline(inlineASTs: MarkdownAST[]) {
    return inlineASTs
        .map(inlineAST => {
            const out = InlineElement(inlineAST)
            if (typeof out === "string") {
                return out
            }
            return out.outerHTML
        })
        .join("")
}

function BlockElement(markdownAST: MarkdownAST) {
    let map = MarkitMapBlock.value ?? defaultBlockMap
    let blockFunc = map[markdownAST.type]
    let element
    if (!!blockFunc) {
        const content = resolveBlockContent(markdownAST.content)
        element = blockFunc(content, markdownAST.props)
    } else {
        MarkitLogger.warn("Render-block", `didn't have a block map named ${markdownAST.type}, treat it as plain text`)
        element = `<div>${markdownAST.raw}</div>`
    }

    return element
}

export function Block(markdownASTs: MarkdownAST[]) {
    return markdownASTs
        .filter((markdownAST: MarkdownAST) => markdownAST.props?.visible ?? true)
        .map((markdownAST: MarkdownAST) => ({
            ast: markdownAST,
            order: markdownAST.props?.elementOrder ?? 1
        }))
        .sort((a: any, b: any) => a.order - b.order)
        .map((t: any) => {
            const out = BlockElement(t.ast)
            if (typeof out === "string") {
                return out
            }
            return out.outerHTML
        })
        .join("")
}

