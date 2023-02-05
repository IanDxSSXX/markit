import {C as BC, MarkdownBlockParser} from "../parser/block/parser";
import {ASTHelper} from "./astHelper";
import {IncrementalParse} from "./incrementalParse"
import {blockDefaultRules, BlockMarkdownRules, inlineDefaultRules, InlineMarkdownRules} from "../parser/rules";
import {MarkdownAST} from "./ast";
import {MarkdownerLogger} from "./logger";
import {defaultInlineMap} from "../renderer/defaultRules/inline";
import {MarkdownerRuleMap} from "../renderer/type";
import {defaultBlockMap} from "../renderer/defaultRules/block";
import {RuleAdder, RuleDropper} from "./rules";
import {Block} from "../renderer/render";


interface MarkdownerProps {
    tabSpaceNum?: number
    softBreak?: boolean
    geneId?: boolean
}

export interface MarkdownerViewProps{
    content?: string
    children?: string
}

export class MarkitClass {
    blockParser?: BC.MarkdownBlockParser
    ast: ASTHelper
    dropRule: RuleDropper
    addRule: RuleAdder
    markdownerProps: MarkdownerProps = {}
    inlineRules: InlineMarkdownRules = inlineDefaultRules
    inlineRuleMap: MarkdownerRuleMap = defaultInlineMap
    blockRules: BlockMarkdownRules = blockDefaultRules
    blockRuleMap: MarkdownerRuleMap = defaultBlockMap

    constructor() {
        this.ast = new ASTHelper(this)
        this.dropRule = new RuleDropper(this)
        this.addRule = new RuleAdder(this)
    }
    

    init(props:MarkdownerProps={}) {
        this.markdownerProps = props
        let {tabSpaceNum, softBreak, geneId} = props
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
        this.init({...this.markdownerProps, geneId:true})
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

    new(props?:MarkdownerProps) {
        return new MarkitClass().init(props??this.markdownerProps)
    }

    debug(level: number=0) {
        MarkdownerLogger.setDebugLevel(level)
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

Markit.init()
