import {MarkdownerRuleMap} from "../type";
import {ContainerItem, MarkdownAST} from "../../base/ast";
import {Inline} from "../render";

export const defaultBlockMap: MarkdownerRuleMap = {
    Paragraph: content => `<div>${content}</div>`,
    Heading: (content, {headingLevel}) => `<h${headingLevel}>${content}</h${headingLevel}>`,
    UnorderedList: (content: ContainerItem[]) => (
        "<ul>" +
            content.map(({item, content}) => (
                "<li>" + item + "</li>" + content
            )).join("") +
        "</ul>"
    ),
    OrderedList: (content: ContainerItem[], {start}) => (
        `<ol start="${start}">` +
            content.map(({item, content}) => (
                "<li>" + item + "</li>" + content
            )).join("") +
        "</ol>"
    ),
    Table: (headerAndRows: MarkdownAST[][][], {headerAligns, rowAligns}) => (
        '<table style="border-collapse: collapse">' +
            "<tr>" +
                headerAndRows[0].map((header, idx)=>(
                     `<th style="border: thin solid gray; padding: 5px; border-collapse: collapse; text-align: ${headerAligns[idx]}">` +
                        Inline(header) +
                     "</th>"
                 )).join("") +
            "</tr>" +
                headerAndRows.slice(1).map((row: MarkdownAST[][])=>(
                    "<tr>" + row.map((content, idx)=>(
                         `<td style="border: thin solid gray; padding: 5px; border-collapse: collapse; text-align: ${rowAligns[idx]}">` +
                             Inline(content) +
                         "</td>"
                    )).join('') +
                    "</tr>"
             )).join("") +
        "</table>"
    ),
    Blockquote: content => (
        `<blockquote style="padding: 4px 0 4px 18px; border-left: 2px solid gray; margin: 4px 0">` +
            content +
        "</blockquote>"
    ),
    Divider: (_, {dividerType}) => (
      `<div style="margin: 15px 0px; border-top: 1px ${dividerType} #bbb; border-bottom: 1px ${dividerType} #bbb; border-radius: 1px; box-sizing: border-box; height: 2px; width: 100%/>`
    ),
    CheckList: (content: ContainerItem[], {isChecked}) =>(
            "<div>" +
                content.map((checkItem)=>(
                    "<div>" +
                        '<span style="width: 100%">' +
                            `<input type="checkbox" style="margin: 0" ${isChecked?"checked":""} disabled>` +
                            checkItem.item +
                        "</span>" +
                            checkItem.content +
                    "</div>"
                )).join('') +
            "</div>"
        ),
    Image: (_, {altContent, imageUrl, title, zoomSize, alignment, linkUrl}) => {
        let margins: {[key:string]: string} = {
            "left": "0px auto 0px 0px",
            "center": "0px auto",
            "right": "0px 0px 0px auto",
        }
        const imgStr = `<img src="${imageUrl}" alt="${altContent}" title="${title}" style="width: 100%"/>`
        const inDiv = (innerStr: string) => (
            `<div style="width: ${zoomSize}; margin: ${margins[alignment]}">${innerStr}</div>`
        )
        if(linkUrl){
            return inDiv(
                `<a href="${linkUrl}">` +
                   imgStr +
                "</a>"
            )
        }
        return inDiv(imgStr)
    }

}