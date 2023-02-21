import Markit, {addBlockRule, parse, render} from "./base";

const testStr = `
> sfsf  
> 22  
> > fsfsfsffsf
> fs
> * fsf


oksfsf  
hh
`

addBlockRule({
    name: "CodeBlock",
    rule: "default",
    // view: "default"
})

// console.log(testStr)
// content -> Inline(ast) string
// content: {item->ast, content:}[] Inline
let asts = parse(testStr)

console.log(asts)
const bb = render(testStr)
// console.log(bb)

document.getElementById("app")!.innerHTML = bb

const a = /^88(?:(h1)*)jj/g

const b = "88h1h1h1h1jj"
console.log(b.match(a))
console.log(b.replace(a, ""))
