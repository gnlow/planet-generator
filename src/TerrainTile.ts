import { ImageTile } from "./deps.ts"
// @ts-types="https://denopkg.com/gnlow/lilgpu@0535935/browser.ts"
import { initCanvas, d } from "https://esm.sh/gh/gnlow/lilgpu@0535935/browser.ts"
import { lefebvre } from "./ColorMap.ts"

const vertShader = await fetch("src/main.vert").then(X => X.text())
const fragShader = await fetch("src/main.frag").then(X => X.text())

export class TerrainTile extends ImageTile {
    static async from() {
        const canvas = document.createElement("canvas")
        canvas.width = 256
        canvas.height = 256
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

        return new TerrainTile({
            loader(z, x, y) {
                console.log(z, x, y)
                const u = 180 / 2**(z-1)
                g.buffers.extent.write({
                    minX: 180+u*x,
                    minY: 90-u*(y+1),
                    maxX: 180+u*(x+1),
                    maxY: 90-u*y,
                })
                g.draw(4)
                return createImageBitmap(canvas)
            },
            projection: "EPSG:4326"
        })
    }
}
