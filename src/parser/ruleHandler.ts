import {C as IC} from "./inline/parser";
import {C as BC} from "./block/parser";
import {MarkitLogger} from "../base/logger";
import {MarkdownRule} from "./types";


// ---- regexTag
export class RuleHandler {
    ruleName: string
    rule: MarkdownRule
    tagMap: ({tagReg: RegExp, tagString: string, replacement: string})[] = []
    regexString: string = ""
    useRecheckMatch: boolean = false
    order: number = 1
    parser: IC.MarkdownInlineParser | BC.MarkdownBlockParser

    getProps: (raw: string) => any = () => {}
    trimText: (raw: string) => string = this.defaultTrimText
    recheck: (raw: string) => boolean = () => true

    constructor(ruleName:string, rule: MarkdownRule, parser: IC.MarkdownInlineParser | BC.MarkdownBlockParser) {
        this.ruleName = ruleName
        this.parser = parser
        if (!rule.tag) MarkitLogger.throw(`Rule: ${this.ruleName}`, "no tag now!")
        this.rule = rule
    }

    protected init() {
        // ---- tags
        const tags = Array.isArray(this.rule.tag) ? this.rule.tag : [this.rule.tag]
        // ---- capturing group => non-capturing group
        const bracketMatch = /([^\\]|^)\((?!\?)/g
        const getTagString = (reg: RegExp) => "(?:" + reg.source.replace(bracketMatch, "$1(?:") + ")"
        const getReplacement = (reg: RegExp) => {
            const capturingGroupNum = (reg.source.match(bracketMatch)??[]).length
            const replacement = [...Array(capturingGroupNum).keys()].map(i=>`$${i+1}`).join("")
            return replacement.length === 0 ? "[NONE]" : replacement
        }
        for (let tag of tags) {
            this.tagMap.push({
                tagReg: tag,
                tagString: getTagString(tag),
                replacement: getReplacement(tag)
            })
        }
        this.regexString = this.tagMap.map(({tagString}) => tagString).join("|")

        // ---- other props
        if (this.rule.order !== undefined) this.order = this.rule.order
        if (this.rule.recheck) this.recheck = this.rule.recheck
        if (this.rule.getProps) this.getProps = raw => this.rule.getProps!(raw, this.parser.state)
        if (this.rule.trimText) this.trimText = this.rule.trimText
    }

    // ---- syntax tree default func
    private defaultTrimText(text: string) {
        for (let tag of this.tagMap) {
            if (tag.tagReg.test(text)) {
                if (tag.replacement === "[NONE]") return text
                text = text.replace(tag.tagReg, tag.replacement)
                return text
            }
        }
        return text
    }
}