import {flattened} from "../base/utils";
import {uid} from "../base/utils";
import {MarkdownAST} from "../base/ast";
import {BlockMarkdownRules, InlineMarkdownRules} from "./types";


export type DefaultInlineRules = "Italic" | "Bold" | "Strike" | "Underline" | "Code" | "Link" | "Escape" | "Superscript" |
    "Subscript" | "Highlight" | "HtmlTag" | "Math" | "FootnoteSup" | "LinkTag"
export type DefaultBlockRules = "Heading" | "OrderedList" | "UnorderedList" | "Blockquote" | "CodeBlock" | "Table" | "Divider" |
    "CheckList" | "Image" | "MathBlock" | "Latex" | "Footnote" | "LinkTagBlock" | "Comment"



export namespace IRegHelper {
    type Reg = string | RegExp
    function getRegString(reg: Reg) {
        return typeof reg === "string" ? reg : reg.source
    }
    export function round(reg: Reg) {
        const regString = getRegString(reg)
        return new RegExp(`${regString}(\\S+?[\\s\\S]*?)${regString}`)
    }

    export function wrap(leftReg: Reg, rightReg: Reg) {
        const leftRegString = getRegString(leftReg)
        const rightRegString = getRegString(rightReg)
        return new RegExp(`${leftRegString}(\\S+?[\\s\\S]*?)${rightRegString}`)

    }
}

export namespace BRegHelper {
    type Reg = string | RegExp
    function getRegString(reg: Reg) {
        return typeof reg === "string" ? reg : reg.source
    }
    export function round(reg: Reg) {
        const regString = getRegString(reg)
        return new RegExp(`(?:\\n|^)${regString}((?:.|\\n)+?)${regString}(?=\\n|$)`)
    }

    export function wrap(leftReg: Reg, rightReg: Reg) {
        const leftRegString = getRegString(leftReg)
        const rightRegString = getRegString(rightReg)
        return new RegExp(`(?:\\n|^)${leftRegString}((?:.|\\n)+?)${rightRegString}(?=\\n|$)`)
    }

    export function leading(reg: Reg) {
        const regString = getRegString(reg)
        return new RegExp(`(?:\\n|^)${regString}(.+)(?=\\n|$)`)
    }
}
export const inlineDefaultRules: InlineMarkdownRules = {
    // ---- the order doesn't matter, default order is 1
    Italic: {
        tag: [IRegHelper.round(/\[em]/), /\*((?!\s)(?:(?:[^*]*?(?:\*\*[^*]+?\*\*[^*]*?)+?)+?|[^*]+))\*/],
    },
    Bold: {
        tag: [IRegHelper.round(/\[bold]/), /\*\*((?!\s)(?:[^*]+?|(?:[^*]*(?:\*[^*]+\*[^*]*)+?)+?))\*\*/],
        order: 0
    },
    Strike: {
        tag: [IRegHelper.round(/~~/), IRegHelper.round(/\[strike]/)],
        order: 0 // prior to subscript
    },
    Underline: {
        tag: [IRegHelper.wrap("<u>", "</u>"), IRegHelper.round("_"), IRegHelper.round(/\[underline]/)],
    },
    Code: {
        tag: IRegHelper.round("`"),
        allowNesting: false,
    },
    Link: {
        tag: IRegHelper.wrap(/\[/, /]\(.+?\)/),
        getProps: (raw: string) => ({linkUrl: raw.match(/\(.+?\)$/)![0].replace(/[()]/g, "")}),
        order: -3
    },
    Escape: {
        tag: /\\([*~<>_=`$\\[\]])/,
        order: -1000 // ---- must be the first
    },
    Superscript: {
        tag: IRegHelper.round(/\^/),
    },
    Subscript: {
        tag: IRegHelper.round("~"),
    },
    Highlight: {
        tag: IRegHelper.round("=="),
    },
    HtmlTag: {
        tag: [IRegHelper.wrap(/<[a-zA-Z]+(?: .+?=.+?)* *>/, /<\/[a-zA-Z]+>/), /<[a-zA-Z]+\/>/],
        recheck: raw => {
            if (/<[a-zA-Z]+\/>/.test(raw)) return true
            let leftTag = raw.match(/<[a-zA-Z]+/)![0]
            let rightTag = raw.match(/<\/[a-zA-Z]+>/)![0]
            return leftTag.replace(/[<>]/g, "").trim() === rightTag.replace(/[<>/]/g, "").trim()
        },
        allowNesting: false
    },
    Math: {
        tag: IRegHelper.round(/\$/),
        allowNesting: false,
    },
    FootnoteSup: {
        tag: IRegHelper.wrap(/\[\^/, "]"),
        getProps: () => ({footnoteSupId: uid()}),
        order: -2,
        allowNesting: false
    },
    LinkTag: {
        tag: IRegHelper.wrap(/\[/, /]/),
        order: -1,
        getProps: raw => ({tagName: raw.replace(/[[\]]/g, "").trim()})
    },

}


export const blockDefaultRules: BlockMarkdownRules = {
    Heading: {
        tag: [BRegHelper.leading(/#{1,5} /), /(.+?)\n===+ */, /(.+?)\n---+ */],
        getProps: (text) => {
            let headingLevel: number
            let hashHeadingMatch = text.match(/^#+ /)
            if (hashHeadingMatch) {
                headingLevel = hashHeadingMatch![0].trim().length
            } else {
                let heading1Match = text.match(/\n===+/)
                headingLevel = !!heading1Match ? 1 : 2
            }
            return {headingLevel}
        },
    },
    OrderedList: {
        tag: BRegHelper.leading(/ *[0-9]\. /),
        getProps: (text) => ({start: +text.match(/\d+/g)![0]}),
        blockType: "container"
    },
    UnorderedList: {
        tag: BRegHelper.leading(/ *[*+-] /),
        blockType: "container"
    },
    Blockquote: {
        tag: /(?:> .+?\n)*> .+?(?=\n|$)/,
        parseContent: (text, blockParse) => {
            let newText = text.replace(/\n> */g, "\n").replace(/^> */g, "")
            return blockParse(newText)
        }
    },
    CodeBlock: {
        tag: BRegHelper.round(/ *```/),
        parseContent: text => {
            text = text.replace(/ *```|```$/g, "")
            let content = text.replace(/^.+?\n/g, "")
            return content
        },
        getProps: raw => {
            const text = raw.replace(/ *```|```$/g, "")
            const language = (text.match(/^.+?\n/g) ?? ["text"])[0].replace("```", "").trim()
            return {language}
        }
    },
    Table: {
        tag: / *\|(?:.+?\|)+\n *\|(?: *[-*:]{1,2}-+[-*:]{1,2}? *\|)+(?:\n *\|(?:.+?\|)+)*/,
        parseContent: (text, _, inlineParse) => {
            let header: MarkdownAST[][]
            let allRows = text.split("\n").filter(r=>r!=="")
            header = allRows[0].split("|").map(h=>h.trim()).filter(h=>h!=="").map(i=>inlineParse(i.trim()))
            let headerAndRows: MarkdownAST[][][] = [header]

            if (allRows.length > 2) {
                headerAndRows.push(...allRows.slice(2).map(r=>r.trim().split("|").filter(i=>i!=="").map(i=>inlineParse(i.trim()))))
            }
            return headerAndRows

        },
        recheck: raw => {
            let rowNum: number | undefined
            for (let line of raw.split(/\n/g).filter(l=>l.trim()!=="")) {
                let newRowNum = line.split("|").length
                if (rowNum !== undefined && newRowNum !== rowNum) return false
                rowNum = newRowNum
            }
            return true
        },
        getProps: raw => {
            let allRows = raw.split("\n").filter(r=>r!=="")
            let column = allRows[0].split("|").map(h=>h.trim()).filter(h=>h!=="").length
            let headerAligns: ("left"|"center"|"right")[] = Array(column).fill("center")
            let rowAligns: ("left"|"center"|"right")[] = Array(column).fill("left")

            if (allRows.length !== 1) {
                let alignTags = allRows[1].split("|").map(i=>i.trim()).filter(i=>i!=="")
                for (let [idx, tag] of alignTags.entries()) {
                    // ---- header alignment
                    if (/^:?\*[^*]+$/.test(tag)) {
                        headerAligns[idx] = "left"
                    } else if(/^[^*]+\*:?$/.test(tag)) {
                        headerAligns[idx] = "right"
                    } else if(/^:?\*[:-]+\*:?$/.test(tag)) {
                        headerAligns[idx] = "center"
                    }
                    // ---- row alignment
                    if (/^\*?:[^:]+$/.test(tag)) {
                        rowAligns[idx] = "left"
                    } else if(/^[^:]+:\*?$/.test(tag)) {
                        rowAligns[idx] = "right"
                    } else if(/^\*?:[*-]+:\*?$/.test(tag)) {
                        rowAligns[idx] = "center"
                    }
                }
            }
            return {headerAligns, rowAligns}
        }
    },
    Divider: {
        tag: /---{1,4}(?:\[(?:dashed|dotted|solid)])?/,
        order: 2, // ---- behind heading1
        getProps: text => ({dividerType: (text.match(/dashed|dotted|solid/) ?? ["solid"])[0]})
    },
    CheckList: {
        tag: BRegHelper.leading(/ *- \[[ x]] /),
        blockType: "container",
        order:0,
        getProps: text => ({isChecked: text.match(/(?: {2})*- \[[ x]] /)![0].includes("x")})
    },
    Image: {
        tag: /!\[.+?]\(.+?(?: .+?)*? *\)|\[!\[.+?]\(.+?(?: .+?)*? *\)]\(.+?\)/,
        parseContent: _ => undefined,
        getProps: text => {
            text = text.trim()
            let linkUrl: string | undefined
            if (/^\[!\[.+?]\(.+?(?: .+?)*? *\)]\(.+?\)$/.test(text)) {
                // ---- with link
                linkUrl = text.match(/\)]\(.+?\)$/)![0].replace(/[\]()]/g, "")
                text = text.replace(/(^\[)|(]\([^\]]+?\)$)/g, "")
            }
            let altContent = text.match(/!\[.+?]/)![0].replace(/[![\]]/g, "")
            let content: string = text.match(/\(.+?(?: .+?)*\)/)![0].replace(/[()]/g, "")
            let splitContent: string[] = [
                ...flattened(content.split(/".+?"/).map(c=>c.split(" ").map(i=>i.trim()))),
                ...(content.match(/".+?"/g) ?? [])
            ].filter(i=>i!=="")
            let imageUrl = splitContent[0]
            let otherProps = splitContent.slice(1)
            let title = otherProps.filter(i=>/^".+?"$/.test(i))[0].replaceAll('"', "") ?? ""
            let zoomSize = otherProps.filter(i=>/^[0-9]{1,3}%$/.test(i))[0] ?? "50%"
            let alignment = otherProps.filter(i=>/^left|right|center$/.test(i))[0] ?? "left"
            return {altContent, imageUrl, title, zoomSize, alignment, linkUrl}
        }
    },
    MathBlock: {
        tag: BRegHelper.round("$$"),
        parseContent: (text) =>  text
    },
    Latex: {
        tag: BRegHelper.round("$$$"),
        parseContent: (text) => text.replace(/^\n|\n$/g, ""),
        order: -1
    },
    Footnote: {
        tag: BRegHelper.leading(/\[\^.+?]:/),
        getProps: (text, state) => {
            let noteName = text.match(/^\[\^.+?]:/)![0].replace(/[[\]:^]/g, "").trim()
            if (state.footnoteArr === undefined) state.footnoteArr = {}
            let footnoteArr = state.footnoteArr
            if (footnoteArr[noteName] === undefined) {
                footnoteArr[noteName] = 0
            } else {
                footnoteArr[noteName] += 1
            }
            return {
                elementOrder: 100,
                noteName,
                footnoteIdx: footnoteArr[noteName],
                rerender: true
            }
        },
    },
    LinkTagBlock: {
        tag: BRegHelper.leading(/\[.+?]:/),
        order: 2,
        getProps: raw => ({
            tagName: raw.match(/\[.+?]/)![0].replace(/[[\]]/g, "").trim(),
            tagUrl: raw.replace(/\[.+?]:/, "").trim(),
            visible: false
        })
    },
    Comment: {
        tag: BRegHelper.leading(/\/\//),
        getProps: ()=>({visible: false})
    }


}
