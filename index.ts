// @ts-types="https://denopkg.com/gnlow/lilgpu@9637b05/browser.ts"
import { initCanvas, d } from "https://esm.sh/gh/gnlow/lilgpu@9637b05/browser.ts"

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
        }
    },
})

g.buffers.colorMap.write(
    Array.from({ length: 256 }, (_, i) =>
        d.vec3u(...lefebvre.get(i))
    )
)

g.draw(4)
