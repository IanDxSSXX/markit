import Markit, {parse, render} from "./base";

const testStr = `
\`\`\`js
<div style="background-color: aqua">fuck</div>
<div style="background-color: aqua">fuck</div>
<div style="background-color: aqua">fuck</div>
\`\`\`

fsjfsf\`<div style="background-color: aqua">fuck</div>sfsf\`
`

Markit.addRule.block({
    name: "CodeBlock",
    rule: "default",
    view: content => {
        const newEl = document.createElement("div")
        newEl.innerText = content
        newEl.style.backgroundColor = "red"
        return newEl
    }
})

// console.log(testStr)
// content -> Inline(ast) string
// content: {item->ast, content:}[] Inline
console.log(parse(testStr))
const bb = render(testStr)
// console.log(bb)

document.getElementById("app")!.innerHTML = bb
