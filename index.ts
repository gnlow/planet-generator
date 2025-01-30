import {
    Map,
    View,
    TileLayer,
} from "./src/deps.ts"
import { TerrainRenderer } from "./src/TerrainRenderer.ts"
import { TerrainTile } from "./src/TerrainTile.ts"

const terrain = await TerrainRenderer.from()
const frontLayer = new TileLayer({ source: new TerrainTile(terrain) })
const backLayer = new TileLayer({ source: new TerrainTile(terrain) })

new Map({
    target: "map",
    layers: [
        frontLayer,
        backLayer,
    ],
    view: new View({
        center: [0, 0],
        zoom: 1,
        projection: "EPSG:4326",
    })
})

const refresh = () => {
    console.log("refresh")
    backLayer.setSource(new TerrainTile(terrain))
    const src = backLayer.getSource()!
    src.on("tileloadend", (e) => {
        const [z, x, y] = e.tile.tileCoord
        console.log(`swap(${z}, ${x}, ${y})`)
        frontLayer.setSource(src)
    })
}

import { html, render } from "https://esm.sh/lit-html@3.2.1"

const slider =
(name: "DD1" | "DD2" | "POWA" | "POW" | "MUL" | "ADD" | "SEED",
min: number, max: number, isInt = false) =>
    html`
        <v style="height: 27px;">
            <h>
                <i><b>${name.padEnd(4, "\u00a0")}</b></i>
                ${isInt
                    ? terrain[name].toString().padStart(5, "0").padStart(6, "\u00a0")
                    : terrain[name].toFixed(2).padStart(5, "\u00a0")
                }
            </h>
            <input
                type="range"
                step=${isInt ? 1 : 0.01}
                value=${terrain[name]}
                min=${min}
                max=${max}
                @input=${u(v => terrain[name] = v)}
            />
        <v/>
    `

const u =
(f?: (v: number) => void) =>
(e?: InputEvent) => {
    f && f(Number((e!.target as HTMLInputElement).value)!)
    refresh()
    render(html`
        <h gap-20>
            <v fill gap-10>
                <h2 style="height: 27px;"><i>Tweak</i></h2>
                ${slider("SEED", 0, 99999, true)}
            </v>
            <v fill gap-10>
                ${slider("MUL", 0, 10)}
                ${slider("ADD", -2, 2)}
            </v>
        </h>
        <h gap-20>
            <v fill gap-10>
                ${slider("DD1", -1, 1)}
                ${slider("POWA", 0, 10)}
            </v>
            <v fill gap-10>
                ${slider("DD2", -1, 1)}
                ${slider("POW", 0, 10)}
            </v>
        </h>
    `, document.body)
}
u()()
