import Markit, {parse, render} from "./base";

const testStr = `
<div style="background-color: aqua">fuck me</div>
\`<div style="background-color: aqua">fuck me</div>\`
`

Markit.addRule.block({
    name: "CodeBlock",
    rule: "default",
    view: content => `<div style="background-color: blue">${content}</div>`
})
Markit.addRule.inline({
    name: "Code",
    rule: "default",
    view: content => `<div style="background-color: red">${content}</div>`
})

// console.log(testStr)
// content -> Inline(ast) string
// content: {item->ast, content:}[] Inline
console.log(parse(testStr))
const bb = render(testStr)
// console.log(bb)

document.getElementById("app")!.innerHTML = bb
