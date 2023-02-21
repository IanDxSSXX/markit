import {inlineDefaultRules} from "../rules";
import {C} from "./parser";
import {MarkitLogger} from "../../base/logger";
import {BlockMarkdownRule, InlineMarkdownRules} from "../types";
import {RuleHandler} from "../ruleHandler";

// ---- regexTag
export class BlockRuleHandler extends RuleHandler{
    inlineRules: InlineMarkdownRules = inlineDefaultRules
    blockType: "container" | "leaf" = "leaf"
    get regex(): RegExp {
        return new RegExp(this.regexString, "g")
    }

    tabSpaceNum: number

    parseContent: (text: string) => any = text => this.defaultParseContent(text)


    constructor(ruleName:string, rule: BlockMarkdownRule, tabSpaceNum: number, parser: C.MarkdownBlockParser) {
        super(ruleName, rule, parser)
        this.tabSpaceNum = tabSpaceNum
        this.init()
    }


    init() {
        super.init()
        // ---- other props
        if ((this.rule as BlockMarkdownRule).blockType) this.blockType = (this.rule as BlockMarkdownRule).blockType!
        if ((this.rule as BlockMarkdownRule).parseContent) {
            this.parseContent = text => {
                const newBlockParse = (text: string) => this.parser.new().parse(text)
                const newInlineParse = (text: string) => (this.parser as C.MarkdownBlockParser).inlineParser.new().parse(text)
                return (this.rule as BlockMarkdownRule).parseContent!(text, newBlockParse, newInlineParse)
            }
        }
    }
    defaultParseContent(text: string) {
        return (this.parser as C.MarkdownBlockParser).inlineParser!.new().parse(text)
    }

    static parseBlockProp(raw: string): [any, string] {
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