import {
    Map,
    View,
    TileLayer,
} from "./src/deps.ts"
import { TerrainTile } from "./src/TerrainTile.ts"

new Map({
    target: "map",
    layers: [
        new TileLayer({
            source: await TerrainTile.from(),
        }),
    ],
    view: new View({
        center: [0, 0],
        zoom: 2,
        projection: "EPSG:4326",
    })
})
