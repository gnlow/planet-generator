// deno-lint-ignore-file no-self-assign
// @ts-types="https://denopkg.com/gnlow/lilgpu@0535935/browser.ts"
import { initCanvas, d, Layout } from "https://esm.sh/gh/gnlow/lilgpu@0535935/browser.ts"
import { lefebvre } from "./ColorMap.ts"

const vertShader = await fetch("src/main.vert").then(X => X.text())
const fragShader = await fetch("src/main.frag").then(X => X.text())

const layout = {
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
    SEED: { uniform: d.u32 },
    MUL: { uniform: d.f32 },
    ADD: { uniform: d.f32 },
    DD1: { uniform: d.f32 },
    DD2: { uniform: d.f32 },
    POWA: { uniform: d.f32 },
    POW: { uniform: d.f32 },
} satisfies Layout

export class TerrainRenderer {
    g?: Awaited<ReturnType<typeof initCanvas<typeof layout>>>

    _SEED = 0
    set SEED(v: number) { this.g!.buffers.SEED.write(this._SEED = v) }
    get SEED() { return this._SEED }

    _MUL = 1
    set MUL(v: number) { this.g!.buffers.MUL.write(this._MUL = v) }
    get MUL() { return this._MUL }

    _ADD = 0
    set ADD(v: number) { this.g!.buffers.ADD.write(this._ADD = v) }
    get ADD() { return this._ADD }

    _DD1 = 0.6
    set DD1(v: number) { this.g!.buffers.DD1.write(this._DD1 = v) }
    get DD1() { return this._DD1 }

    _DD2 = 0.2
    set DD2(v: number) { this.g!.buffers.DD2.write(this._DD2 = v) }
    get DD2() { return this._DD2 }

    _POWA = 1
    set POWA(v: number) { this.g!.buffers.POWA.write(this._POWA = v) }
    get POWA() { return this._POWA }

    _POW = 1.1
    set POW(v: number) { this.g!.buffers.POW.write(this._POW = v) }
    get POW() { return this._POW }

    canvas!: HTMLCanvasElement

    static async from() {
        const canvas = document.createElement("canvas")
        canvas.width = 256
        canvas.height = 256
        const g = await initCanvas({
            vertShader,
            fragShader,
            canvas,
            layout,
        })

        g.buffers.colorMap.write(
            Array.from({ length: 256 }, (_, i) =>
                d.vec3u(...lefebvre.get(i))
            )
        )

        const out = new TerrainRenderer()

        out.g = g
        out.canvas = canvas
        out.SEED = out.SEED
        out.MUL = out.MUL
        out.ADD = out.ADD
        out.DD1 = out.DD1
        out.DD2 = out.DD2
        out.POWA = out.POWA
        out.POW = out.POW
        return out
    }

    renderAt(
        z: number,
        x: number,
        y: number,
    ) {
        if(!this.g) {
            throw new Error("Renderer is not yet initialized.")
        }

        this.g.root.device
        const u = 180 / 2**(z-1)
        this.g.buffers.extent.write({
            minX: 180+u*x,
            minY: 90-u*(y+1),
            maxX: 180+u*(x+1),
            maxY: 90-u*y,
        })
        this.g.draw(4)
        console.log(`rendered(${z}, ${x}, ${y})`)
        return this.canvas
    }
}
