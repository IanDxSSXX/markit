import {C} from "./parser";
import {MarkitLogger} from "../../base/logger";
import {InlineMarkdownRule, TagType} from "../types";


// ---- regexTag
export class InlineTagHandler {
    ruleName: string
    rule: InlineMarkdownRule
    tagMap: ({tagReg: RegExp, tagString: string, replacement: string})[] = []
    regexString: string = ""
    useRecheckMatch: boolean = false
    order: number = 1
    allowNesting = true
    parser: C.MarkdownInlineParser

    getProps: (raw: string) => any = () => {}
    trimText: (raw: string) => string = this.defaultTrimText
    recheck: (raw: string) => boolean = () => true

    constructor(ruleName:string, rule: InlineMarkdownRule, parser: C.MarkdownInlineParser) {
        this.ruleName = ruleName
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
        if (this.rule.allowNesting !== undefined) this.allowNesting = this.rule.allowNesting
        if (this.rule.recheck) this.recheck = this.rule.recheck
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
}