import {
    Map,
    View,
} from "./src/deps.ts"
import { TerrainLayer } from "./src/TerrainLayer.ts"

const map = new Map({
    target: "map",
    layers: [
        await TerrainLayer.from()
    ],
    view: new View({
        center: [0, 0],
        zoom: 2,
        projection: "EPSG:4326",
    })
})
