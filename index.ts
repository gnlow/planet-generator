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
    console.log("refresh", terrain.DD1)
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
(name: "DD1" | "DD2" | "POWA" | "POW", min: number, max: number) =>
    html`
        <style>
        </style>
        <v>
            <h>
                <i><b>${name.padEnd(4, "\u00a0")}</b></i>
                ${terrain[name].toFixed(2).padStart(5, "\u00a0")}
            </h>
            <input
                type="range"
                value=${terrain[name]}
                min=${min}
                max=${max}
                step=0.01
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
