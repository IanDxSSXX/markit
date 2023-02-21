import {blockDefaultRules, DefaultBlockRules, DefaultInlineRules, inlineDefaultRules} from "../parser/rules";
import {MarkitLogger} from "./logger";
import {defaultInlineMap} from "../renderer/defaultRules/inline";
import {MarkdownerViewFunc} from "../renderer/type";
import {defaultBlockMap} from "../renderer/defaultRules/block";
import {MarkitClass} from "./markit";
import {BlockMarkdownRule, InlineMarkdownRule} from "../parser/types";


export interface MarkdownerBlockRuleInterface {
    name: string
    rule: BlockMarkdownRule  | "default"
    view?: MarkdownerViewFunc | "default"
}

export interface MarkdownerInlineRuleInterface {
    name: string
    rule: InlineMarkdownRule | "default"
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

    private singleBlock({name,rule,view}:MarkdownerBlockRuleInterface) {
        if (rule === "default") {
            rule = blockDefaultRules[name]
            if (rule === undefined) {
                MarkitLogger.warn("Add block rule", `No default block rule of ruleName ${name}, skipping this rule...`)
                return
            }
        }

        this.markdowner.blockRules[name] = rule
        if (view) {
            let newView: any = view
            if (view === "default") {
                newView = defaultBlockMap[name]
                if (newView === undefined) {
                    MarkitLogger.warn("Add block view", `No default block view of ruleName ${name}`)
                }
            }
            this.markdowner.blockRuleMap[name] = newView
        }

        this.markdowner.init(this.markdowner.markdownerProps)
    }

    block(addedBlock: MarkdownerBlockRuleInterface | MarkdownerBlockRuleInterface[]) {
        if (!Array.isArray(addedBlock)) addedBlock = [addedBlock]
        for (let block of addedBlock) {
            this.singleBlock(block)
        }
    }

    private singleInline({name,rule,view}:MarkdownerInlineRuleInterface) {
        // ---- rule
        if (rule === "default") {
            rule = inlineDefaultRules[name]
            if (rule === undefined) {
                MarkitLogger.warn("Add inline rule", `No default inline rule of ruleName ${name}, skipping this rule...`)
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
                    MarkitLogger.warn("Add inline view", `No default inline view of ruleName ${name}`)
                }
            }
            this.markdowner.inlineRuleMap[name] = newView
        }

        // ---- reinit
        this.markdowner.init(this.markdowner.markdownerProps)
    }

    inline(addedInline:MarkdownerInlineRuleInterface[]) {
        if (!Array.isArray(addedInline)) addedInline = [addedInline]
        for (let inline of addedInline) {
            this.singleInline(inline)
        }
    }
}