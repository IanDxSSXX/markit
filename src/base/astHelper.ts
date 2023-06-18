import { MarkdownAST } from "./ast";
import { MarkitClass } from "./markit";


export class ASTHelper {
    trees: MarkdownAST[] = []
    markit: MarkitClass

    constructor(markit: MarkitClass) {
        this.markit = markit
    }

    flatten() {
        return ASTHelper.flattenASTs(this.trees)
    }

    static flattenASTs(asts: MarkdownAST[]): MarkdownAST[] {
        let flatASTs: MarkdownAST[] = []
        for (let ast of asts) {
            flatASTs.push(ast)
            if (ast.content instanceof Array<MarkdownAST>) {
                flatASTs.push(...ASTHelper.flattenASTs(ast.content))
            }
        }
        return flatASTs
    }

    findInlineItems(typeName: string, condition: (inlineAST: MarkdownAST) => boolean = () => true) {
        return this.flatten().filter(t => t.type === typeName && condition(t))
    }

    findBlocks(typeName: string, condition: (blockAST: MarkdownAST) => boolean = () => true) {
        return this.trees.filter(t => t.type === typeName && condition(t))
    }
}




