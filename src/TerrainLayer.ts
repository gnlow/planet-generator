import { Layer, FrameState } from "./deps.ts"
// @ts-types="https://denopkg.com/gnlow/lilgpu@0535935/browser.ts"
import { initCanvas, d } from "https://esm.sh/gh/gnlow/lilgpu@0535935/browser.ts"
import { lefebvre } from "./ColorMap.ts"

const vertShader = await fetch("src/main.vert").then(X => X.text())
const fragShader = await fetch("src/main.frag").then(X => X.text())

export class TerrainLayer extends Layer {
    canvas
    draw
    constructor(
        canvas: HTMLCanvasElement,
        draw: (extent: number[]) => HTMLCanvasElement,
    ) {
        super({})
        this.canvas = canvas
        this.draw = draw
    }

    override render(frameState: FrameState | null) {
        if (!frameState) return null
        
        this.canvas.width = frameState.size[0]
        this.canvas.height = frameState.size[1]
        
        return this.draw(frameState.extent!)
    }

    static async from() {
        const canvas = document.createElement("canvas")
        const g = await initCanvas({
            vertShader,
            fragShader,
            canvas,
            layout: {
                colorMap: { uniform:
                    d.arrayOf(d.vec3u, 256)
                },
                extent: { uniform:
                    d.struct({
                        minX: d.f32,
                        minY: d.f32,
                        maxX: d.f32,
                        maxY: d.f32,
                    })
                },
            },
        })

        g.buffers.colorMap.write(
            Array.from({ length: 256 }, (_, i) =>
                d.vec3u(...lefebvre.get(i))
            )
        )

        return new TerrainLayer(
            canvas,
            ([minX, minY, maxX, maxY]) => {
                g.buffers.extent.write({
                    minX, minY, maxX, maxY,
                })
                g.draw(4)
                return canvas
            }
        )
    }
}
