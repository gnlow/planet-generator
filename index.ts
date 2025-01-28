// @ts-types="https://denopkg.com/gnlow/lilgpu@9637b05/browser.ts"
import { initCanvas } from "https://esm.sh/gh/gnlow/lilgpu@9637b05/browser.ts"

const shader = await fetch("src/main.wgsl")
    .then(x => x.text())

const g = await initCanvas({
    vertShader: shader,
    fragShader: shader,
    canvas: document.querySelector("canvas")!,
})

g.draw(4)
