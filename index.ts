// @ts-types="https://denopkg.com/gnlow/lilgpu@e56c15e/browser.ts"
import { initCanvas, d } from "https://esm.sh/gh/gnlow/lilgpu@e56c15e/browser.ts"

import { lefebvre } from "./src/ColorMap.ts"

const shader = await fetch("src/main.wgsl")
    .then(x => x.text())

const g = await initCanvas({
    vertShader: shader,
    fragShader: shader,
    canvas: document.querySelector("canvas")!,
    layout: {
        colorMap: { uniform:
            d.arrayOf(d.vec3u, 256)
        },
        zoom: { uniform:
            d.f32
        },
    },
})

g.buffers.colorMap.write(
    Array.from({ length: 256 }, (_, i) =>
        d.vec3u(...lefebvre.get(i))
    )
)

let zoom = 1
g.buffers.zoom.write(zoom)

const tick = () => new Promise(requestAnimationFrame)

while (true) {
    await tick()
    g.buffers.zoom.write(zoom *= 1.01)
    g.draw(4)
}
