import { ImageTile } from "./deps.ts"

import { TerrainRenderer } from "./TerrainRenderer.ts"

export class TerrainTile extends ImageTile {
    constructor(terrain: TerrainRenderer) {
        super({
            async loader(z, x, y) {
                console.log(`pull(${z}, ${x}, ${y})`)
                const canvas = terrain.renderAt(z, x, y)
                return await createImageBitmap(canvas)
            },
            projection: "EPSG:4326",
        })
    }
}
