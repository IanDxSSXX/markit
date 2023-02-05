import {MarkdownerRuleMap} from "../type";
import Markit from "../../base";

export const defaultInlineMap: MarkdownerRuleMap = {
    Text: content => content,
    Italic: content => `<em>${content}</em>`,
    Bold: content => `<strong>${content}</strong>`,
    Strike: content => `<span style="text-decoration: line-through">${content}</span>`,
    Link: (content, {linkUrl}) => `<a href="${linkUrl}">${content}</a>`,
    Underline: content => `<span style="text-decoration: underline">${content}</span>`,
    Superscript: content => `<sup>${content}</sup>`,
    Subscript:  content => `<sub>${content}</sub>`,
    Escape: content => content,
    Highlight: content => `<span style="background-color: Highlight">${content}</span>`,
    HtmlTag: content => content,
    FootnoteSup: (content, {footnoteSupId}) =>
        `<a href="#Markit-Footnote-${content}-0" style="color: gray; text-decoration: none">` +
            `<sup id="Markit-FootnoteSup-${content}-${footnoteSupId}">${content}</sup>` +
        `</a>`,
    LinkTag: (content, {tagName}: any) => {
        let linkBlocks = Markit.ast.findBlocks("LinkTagBlock", t=>t.props.tagName === tagName)
        if(linkBlocks.length===0){
            return `[${content}]`
        } else {
            return `<a href="${linkBlocks[0].props.tagUrl}">${tagName}</a>`
        }
    },
    Code: content => {
        const codeEl = document.createElement("span")
        codeEl.innerHTML = `<span style="background-color: #eeeeee; border-radius: 3px; color: #e37d7d; letter-spacing: 0.5px; font-size: 95%; padding: 0.2em 0.4em"></span>`
        ;(codeEl.firstChild! as HTMLElement).innerText = content
        return codeEl.firstChild! as HTMLElement
    }
}