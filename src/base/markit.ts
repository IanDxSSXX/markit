import { C as BC, MarkdownBlockParser } from "../parser/block/parser";
import { ASTHelper } from "./astHelper";
import { IncrementalParse } from "./incrementalParse"
import { blockDefaultRules, inlineDefaultRules } from "../parser/rules";
import { MarkdownAST } from "./ast";
import { MarkitLogger } from "./logger";
import { defaultInlineMap } from "../renderer/defaultRules/inline";
import { MarkitRuleMap } from "../renderer/type";
import { defaultBlockMap } from "../renderer/defaultRules/block";
import { RuleAdder, RuleDropper } from "./rules";
import { Block } from "../renderer/render";
import { BlockMarkdownRules, InlineMarkdownRules } from "../parser/types";


interface MarkitProps {
    tabSpaceNum?: number
    softBreak?: boolean
    geneId?: boolean
}

export interface MarkitViewProps {
    content?: string
    children?: string
}

export class MarkitClass {
    blockParser?: BC.MarkdownBlockParser
    ast: ASTHelper
    dropRule: RuleDropper
    addRule: RuleAdder
    markitProps: MarkitProps = {}
    inlineRules: InlineMarkdownRules = inlineDefaultRules
    inlineRuleMap: MarkitRuleMap = defaultInlineMap
    blockRules: BlockMarkdownRules = blockDefaultRules
    blockRuleMap: MarkitRuleMap = defaultBlockMap

    constructor() {
        this.ast = new ASTHelper(this)
        this.dropRule = new RuleDropper(this)
        this.addRule = new RuleAdder(this)
    }


    init(props: MarkitProps = {}) {
        this.markitProps = props
        let { tabSpaceNum, softBreak, geneId } = props
        this.blockParser = MarkdownBlockParser(this.blockRules, this.inlineRules, tabSpaceNum, softBreak, geneId)
        return this
    }

    parseInline(content: string) {
        if (!this.blockParser) {
            this.init()
        }

        return this.blockParser!.inlineParser!.new().parse(content)
    }

    incrementalParse(content: string) {
        this.init({ ...this.markitProps, geneId: true })
        return IncrementalParse.parse(this.ast.trees, this.parse(content))
    }

    parse(content: string): MarkdownAST[] {
        if (!this.blockParser) {
            this.init()
        }
        let trees = this.blockParser!.new().parse(content)
        this.ast.trees = trees

        return trees
    }

    new(props?: MarkitProps) {
        return new MarkitClass().init(props ?? this.markitProps)
    }

    debug(level: number = 0) {
        MarkitLogger.setDebugLevel(level)
    }

    render(content: string): string {
        const asts = this.parse(content)
        return Block(asts)
    }

}

export const Markit = new MarkitClass()
export const incrementalParse = Markit.incrementalParse.bind(Markit)
export const parse = Markit.parse.bind(Markit)
export const render = Markit.render.bind(Markit)
export const addBlockRule = Markit.addRule.block.bind(Markit.addRule)
export const addInlineRule = Markit.addRule.inline.bind(Markit.addRule)
export const dropBlockRule = Markit.dropRule.block.bind(Markit.dropRule)
export const dropInlineRule = Markit.dropRule.inline.bind(Markit.dropRule)
export const setProps = Markit.init.bind(Markit)


Markit.init()
