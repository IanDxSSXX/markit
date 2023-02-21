import {inlineDefaultRules} from "../rules";
import {C} from "./parser";
import {MarkitLogger} from "../../base/logger";
import {BlockMarkdownRule, InlineMarkdownRules, TagType} from "../types";


// ---- regexTag
export class BlockTagHandler {
    ruleName: string
    rule: BlockMarkdownRule
    tagMap: ({tagReg: RegExp, tagString: string, replacement: string})[] = []
    regexString: string = ""
    useRecheckMatch: boolean = false
    order: number = 1
    inlineRules: InlineMarkdownRules = inlineDefaultRules
    blockType: "container" | "leaf" = "leaf"
    get regex(): RegExp {
        return new RegExp(this.regexString, "g")
    }

    tabSpaceNum: number

    parseContent: (text: string) => any = text => this.defaultParseContent(text)
    getProps: (raw: string) => any = () => ({})
    trimText: (raw: string) => string = this.defaultTrimText
    recheck: (raw: string) => boolean = () => true


    parser: C.MarkdownBlockParser

    constructor(ruleName:string, rule: BlockMarkdownRule, tabSpaceNum: number, parser: C.MarkdownBlockParser) {
        this.ruleName = ruleName
        this.tabSpaceNum = tabSpaceNum
        this.parser = parser
        if (!rule.tag) MarkitLogger.throw(`Rule: ${this.ruleName}`, "no tag now!")
        this.rule = rule
        this.init();
    }


    private init() {
        // tags
        const parseTagArray = (ts: TagType | TagType[]) => {
            const getTagString = (str: string) => "(?:" + str.replace(/([^\\])\((?!\?)/, "$1(?:") + ")"
            if (Array.isArray(ts)) {
                if (ts.length === 2 && typeof ts[1] === "string") {
                    ts = ts as [RegExp, string]
                    this.tagMap.push({
                        tagReg: ts[0],
                        tagString: getTagString(ts[0].source),
                        replacement: ts[1]
                    })
                } else {
                    for (let t of ts) {
                        parseTagArray(t as any)
                    }
                }
            } else {
                this.tagMap.push({
                    tagReg: ts,
                    tagString: getTagString(ts.source),
                    replacement: "$1"
                })
            }
        }
        parseTagArray(this.rule.tag)
        this.regexString = this.tagMap.map(({tagString}) => tagString).join("|")

        // ---- other props
        if (this.rule.order !== undefined) this.order = this.rule.order
        if (this.rule.blockType) this.blockType = this.rule.blockType
        if (this.rule.recheck) this.recheck = this.rule.recheck
        if (this.rule.parseContent) {
            this.parseContent = text => {
                const newBlockParser = this.parser.new()
                const newInlineParser = this.parser.inlineParser.new()
                return this.rule.parseContent!(text, newBlockParser.parse, newInlineParser.parse)
            }
        }
        if (this.rule.getProps) this.getProps = raw => this.rule.getProps!(raw, this.parser.state)
        if (this.rule.trimText) this.trimText = this.rule.trimText
    }
    // ---- syntax tree default func
    private defaultTrimText(text: string) {
        for (let tag of this.tagMap) {
            if (tag.tagReg.test(text)) {
                text = text.replace(tag.tagReg, tag.replacement)
                return text === "$1" ? "" : text
            }
        }
        return text
    }

    defaultParseContent(text: string) {
        return this.parser.inlineParser!.new().parse(text)
    }

    static defaultGetProp(raw: string): [any, string] {
        let blockPropMatch = raw.match(/\[blockProp=.+?]/g)
        if (blockPropMatch) {
            let blockPropString = blockPropMatch[0].replace("[blockProp=", "").replace("]", "").trim()
            let trimedText = raw.replace(blockPropMatch[0], "")
            try {
                let blockProp = JSON.parse(blockPropString)
                return [{blockProp}, trimedText]
            } catch (e) {
                MarkitLogger.warn("Block-getProp", `${blockPropString} is not valid as a json blockProp, treat is as a string`)
                return [{blockProp: blockPropString}, trimedText]
            }
        }
        return [{}, raw]
    }

}