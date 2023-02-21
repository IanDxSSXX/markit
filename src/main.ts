import Markit, {parse, render} from "./base";

const testStr = `
# sf
===
sfok

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
let asts = parse(testStr)

console.log(asts)
const bb = render(testStr)
// console.log(bb)

document.getElementById("app")!.innerHTML = bb

// const a = "1h2h3h4h5h6h7h8h9h10h11h12"
// const b = /1(h)2(h)3(h)4(h)5(h)6(h)7(h)8(h)9(h)10(h)11(h)12/
// console.log(a.replace(b, "$1$2$3$4$5$6$7$8$9$10$11$12$13"))