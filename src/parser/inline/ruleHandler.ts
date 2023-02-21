import {C} from "./parser";
import {InlineMarkdownRule} from "../types";
import {RuleHandler} from "../ruleHandler";


// ---- regexTag
export class InlineRuleHandler extends RuleHandler{
    allowNesting = true

    constructor(ruleName:string, rule: InlineMarkdownRule, parser: C.MarkdownInlineParser) {
        super(ruleName, rule, parser)
        this.init()
    }

    init() {
        super.init()
        if ((this.rule as InlineMarkdownRule).allowNesting !== undefined) this.allowNesting = (this.rule as InlineMarkdownRule).allowNesting!
    }
}