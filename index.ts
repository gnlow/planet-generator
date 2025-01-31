import {
    Map,
    View,
    TileLayer,
    defaultControls,
    FullScreen,
} from "./src/deps.ts"
import { TerrainRenderer } from "./src/TerrainRenderer.ts"
import { TerrainTile } from "./src/TerrainTile.ts"

const terrain = await TerrainRenderer.from()

const view = new View({
    center: [0, 0],
    zoom: 1,
    projection: "EPSG:4326",
})

const frontLayer = new TileLayer({ source: new TerrainTile(terrain) })
const backLayer = new TileLayer({ source: new TerrainTile(terrain) })

const fullScreen = new FullScreen()

const map = new Map({
    controls: defaultControls().extend([
        fullScreen,
    ]),
    target: "map",
    layers: [
        frontLayer,
        backLayer,
    ],
    view,
})

fullScreen.on("enterfullscreen", () => {
    map.getTargetElement().classList.add("full")
})

fullScreen.on("leavefullscreen", () => {
    map.getTargetElement().classList.remove("full")
})

const getViewHeight = () => {
    const [ x0, y0, x1, y1 ] = view.getViewStateAndExtent().extent
    const [w, h] = [ x1-x0, y1-y0 ]
    return Math.min(w / 2, h)
}

const setViewHeight =
(h: number, [x, y]: number[]) => {
    const w = h * 2
    view.fit([
        x-w/2,
        y-h/2,
        x+w/2,
        y+h/2,
    ])
}

const pushState = () => {
    history.pushState(
        {},
        "",
        terrain.state + "/" +
        [...view.getCenter()!, getViewHeight()]
            .map(x => x.toFixed(2))
            .join("/")
    )
}

const pullState = () => {
    terrain.state = location.hash
    let [_seed, _mul, _add, _dd1, _dd2, _powa, _pow,
        x, y, h] = location.hash.split("/").map(Number)
    x ||= 0
    y ||= 0
    h ||= 180
    view.setCenter([x, y])
    setViewHeight(h, [x, y])
}

pullState()

view.on("change", () => {
    pushState()
})
map.on("change:size", () => {
    pushState()
})

const refresh = () => {
    backLayer.setSource(new TerrainTile(terrain))
    const src = backLayer.getSource()!
    src.on("tileloadend", () => {
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
                min=${min}
                max=${max}
                value=${terrain[name]}
                @input=${u(v => terrain[name] = v)}
                @change=${pushState}
            />
        <v/>
    `

const u =
(f?: (v: number) => void) =>
(e?: InputEvent) => {
    f && f(Number((e!.target as HTMLInputElement).value)!)
    refresh()
    render(html`
    <style>
        tweak {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
            max-width: 1000px;
        }
    </style>
    <tweak>
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
    </tweak>
    `, document.body)
}
u()()

addEventListener("hashchange", () => {
    pullState()
    u()()
})
