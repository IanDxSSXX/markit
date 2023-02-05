import Markit, {parse, render} from "./base";

const testStr = `

\`\`\` jsx

const a = 1

\`\`\`
* okk \`no\`
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
