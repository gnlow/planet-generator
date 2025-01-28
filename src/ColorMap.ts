type Vec3 = [number, number, number]
type Vec4 = [number, number, number, number]

export class ColorMap {
    data

    constructor(data: Map<number, Vec3>) {
        this.data = data
    }

    get(n: number) {
        n = Math.floor(Math.min(Math.max(0, n), 255))
        return this.data.get(n)!
    }

    static fromColData(data: Vec4[]) {
        const entries = Array.from({ length: 256 }, (_, i) => {
            const k = data.findIndex(([j]) => j >= i)

            if (data[k][0] == i) {
                return [i, data[k].slice(1)]
            } else {
                const [i1, ...c1] = data[k-1]
                const [i2, ...c2] = data[k]
                const p = (i-i1)/(i2-i1)
                return [i, [...c1.map((_, j) =>
                    c1[j]*(1-p) + c2[j]*p
                )]]
            }
        }) as [number, Vec3][]
        return new ColorMap(new Map(entries))
    }
    static fromColText(text: string) {
        return this.fromColData(
            text
                .trim()
                .replaceAll(/\n+/g, "\n")
                .split("\n")
                .map(row => row
                    .trim()
                    .replaceAll(/ +/g, " ")
                    .split(" ")
                    .map(Number) as Vec4
                )
        )
    }
}

export const lefebvre = ColorMap.fromColText(`
    0  107 185 200
    110 195 230 236
    130 212 237 241
    131 179 220 141
    160 204 233 166
    180 224 234 197
    205 242 223 193
    230 201 175 152
    245 210 206 220
    255 255 255 255
`)
