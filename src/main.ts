import {Markit} from "./base";

const testStr = `

| this | is  | header |
|------|-----|--------|
| this | is  | row0   |
| this | is  | row1   |

[![This is beautiful!](https://images.unsplash.com/photo-1613967193490-1d17b930c1a1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDB8fDB8fA%3D%3D&w=1000&q=80 "hello react" 30% right)](https://images.unsplash.com/photo-1613967193490-1d17b930c1a1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDB8fDB8fA%3D%3D&w=1000&q=80)
![react](https://images.unsplash.com/photo-1613967193490-1d17b930c1a1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDB8fDB8fA%3D%3D&w=1000&q=80 "hello react" 50% left)

`

// console.log(testStr)
// content -> Inline(ast) string
// content: {item->ast, content:}[] Inline

// console.log(Markit.parse(testStr))
const bb = Markit.render(testStr)
// console.log(bb)

document.getElementById("app")!.innerHTML = bb
