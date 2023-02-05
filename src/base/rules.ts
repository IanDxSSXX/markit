import {blockDefaultRules, DefaultBlockRules, DefaultInlineRules, inlineDefaultRules} from "../parser/rules";
import {BlockMarkdownTag, BlockMarkdownTagExtend} from "../parser/block/regex";
import {InlineMarkdownTag, InlineMarkdownTagExtend} from "../parser/inline/regex";
import {MarkdownerLogger} from "./logger";
import {defaultInlineMap} from "../renderer/defaultRules/inline";
import {MarkdownerViewFunc} from "../renderer/type";
import {defaultBlockMap} from "../renderer/defaultRules/block";
import {MarkitClass} from "./markit";


export interface MarkdownerBlockRuleInterface {
    name: string
    rule: BlockMarkdownTag | BlockMarkdownTagExtend | "default"
    view?: MarkdownerViewFunc | "default"
}

export interface MarkdownerInlineRuleInterface {
    name: string
    rule: InlineMarkdownTag | InlineMarkdownTagExtend | "default"
    view?: MarkdownerViewFunc | "default"
}


export class RuleDropper {
    private markdowner: MarkitClass
    constructor(markdowner: MarkitClass) {
        this.markdowner = markdowner
    }

    block(ruleNames: DefaultBlockRules[] | DefaultBlockRules) {
        if (!(ruleNames instanceof Array)) ruleNames = [ruleNames]
        for (let ruleName of ruleNames) {
            delete this.markdowner.blockRules[ruleName]
            delete this.markdowner.blockRuleMap[ruleName]
        }
        this.markdowner.init(this.markdowner.markdownerProps)
    }

    inline(ruleNames: DefaultInlineRules[] | DefaultInlineRules) {
        if (!(ruleNames instanceof Array)) ruleNames = [ruleNames]
        for (let ruleName of ruleNames) {
            delete this.markdowner.inlineRules[ruleName]
            delete this.markdowner.inlineRuleMap[ruleName]
        }
        this.markdowner.init(this.markdowner.markdownerProps)
    }
}


export class RuleAdder {
    private markdowner: MarkitClass

    constructor(markdowner: MarkitClass) {
        this.markdowner = markdowner
    }

    block({name,rule,view}:MarkdownerBlockRuleInterface) {
        if (rule === "default") {
            rule = blockDefaultRules[name]
            if (rule === undefined) {
                MarkdownerLogger.warn("Add block rule", `No default block rule of ruleName ${name}, skipping...`)
                return
            }
        }

        this.markdowner.blockRules[name] = rule
        if (view) {
            let newView: any = view
            if (view === "default") {
                newView = defaultBlockMap[name]
                if (view === undefined) {
                    MarkdownerLogger.warn("Add block view", `No default block view of ruleName ${name}, skipping...`)
                    return
                }
            }
            this.markdowner.blockRuleMap[name] = newView
        }

        this.markdowner.init(this.markdowner.markdownerProps)
    }

    blocks(addedBlocks:MarkdownerBlockRuleInterface[]) {
        for (let block of addedBlocks) {
            this.block(block)
        }
    }

    inline({name,rule,view}:MarkdownerInlineRuleInterface) {
        // ---- rule
        if (rule === "default") {
            rule = inlineDefaultRules[name]
            if (rule === undefined) {
                MarkdownerLogger.warn("Add inline rule", `No default inline rule of ruleName ${name}, skipping...`)
                return
            }
        }
        this.markdowner.inlineRules[name] = rule

        if (view) {
            // ---- react view
            let newView: any = view
            if (view === "default") {
                newView = defaultInlineMap[name]
                if (newView === undefined) {
                    MarkdownerLogger.warn("Add inline view", `No default inline view of ruleName ${name}, skipping...`)
                    return
                }
            }
            this.markdowner.inlineRuleMap[name] = newView
        }

        // ---- reinit
        this.markdowner.init(this.markdowner.markdownerProps)
    }

    inlines(addedInlines:MarkdownerInlineRuleInterface[]) {
        for (let inline of addedInlines) {
            this.inline(inline)
        }
    }
}