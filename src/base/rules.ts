import { blockDefaultRules, DefaultBlockRules, DefaultInlineRules, inlineDefaultRules } from "../parser/rules";
import { MarkitLogger } from "./logger";
import { defaultInlineMap } from "../renderer/defaultRules/inline";
import { MarkitViewFunc } from "../renderer/type";
import { defaultBlockMap } from "../renderer/defaultRules/block";
import { MarkitClass } from "./markit";
import { BlockMarkdownRule, InlineMarkdownRule } from "../parser/types";


export interface MarkitBlockRuleInterface {
    name: string
    rule: BlockMarkdownRule | "default"
    view?: MarkitViewFunc | "default"
}

export interface MarkitInlineRuleInterface {
    name: string
    rule: InlineMarkdownRule | "default"
    view?: MarkitViewFunc | "default"
}


export class RuleDropper {
    private markit: MarkitClass
    constructor(markit: MarkitClass) {
        this.markit = markit
    }

    block(ruleNames: DefaultBlockRules[] | DefaultBlockRules) {
        if (!(ruleNames instanceof Array)) ruleNames = [ruleNames]
        for (let ruleName of ruleNames) {
            delete this.markit.blockRules[ruleName]
            delete this.markit.blockRuleMap[ruleName]
        }
        this.markit.init(this.markit.markitProps)
    }

    inline(ruleNames: DefaultInlineRules[] | DefaultInlineRules) {
        if (!(ruleNames instanceof Array)) ruleNames = [ruleNames]
        for (let ruleName of ruleNames) {
            delete this.markit.inlineRules[ruleName]
            delete this.markit.inlineRuleMap[ruleName]
        }
        this.markit.init(this.markit.markitProps)
    }
}


export class RuleAdder {
    private markit: MarkitClass

    constructor(markit: MarkitClass) {
        this.markit = markit
    }

    private singleBlock({ name, rule, view }: MarkitBlockRuleInterface) {
        if (rule === "default") {
            rule = blockDefaultRules[name]
            if (rule === undefined) {
                MarkitLogger.warn("Add block rule", `No default block rule of ruleName ${name}, skipping this rule...`)
                return
            }
        }

        this.markit.blockRules[name] = { ...this.markit.blockRules[name], ...rule }
        if (view) {
            let newView: any = view
            if (view === "default") {
                newView = defaultBlockMap[name]
                if (newView === undefined) {
                    MarkitLogger.warn("Add block view", `No default block view of ruleName ${name}`)
                }
            }
            this.markit.blockRuleMap[name] = newView
        }

        this.markit.init(this.markit.markitProps)
    }

    block(addedBlock: MarkitBlockRuleInterface | MarkitBlockRuleInterface[]) {
        if (!Array.isArray(addedBlock)) addedBlock = [addedBlock]
        for (let block of addedBlock) {
            this.singleBlock(block)
        }
    }

    private singleInline({ name, rule, view }: MarkitInlineRuleInterface) {
        // ---- rule
        if (rule === "default") {
            rule = inlineDefaultRules[name]
            if (rule === undefined) {
                MarkitLogger.warn("Add inline rule", `No default inline rule of ruleName ${name}, skipping this rule...`)
                return
            }
        }
        this.markit.inlineRules[name] = { ...this.markit.inlineRules[name], ...rule }

        if (view) {
            // ---- react view
            let newView: any = view
            if (view === "default") {
                newView = defaultInlineMap[name]
                if (newView === undefined) {
                    MarkitLogger.warn("Add inline view", `No default inline view of ruleName ${name}`)
                }
            }
            this.markit.inlineRuleMap[name] = newView
        }

        // ---- reinit
        this.markit.init(this.markit.markitProps)
    }

    inline(addedInline: MarkitInlineRuleInterface[]) {
        if (!Array.isArray(addedInline)) addedInline = [addedInline]
        for (let inline of addedInline) {
            this.singleInline(inline)
        }
    }
}