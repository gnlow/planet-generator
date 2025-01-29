struct Output {
    @builtin(position) pos: vec4f,
    @location(0) uv: vec2f,
}

@vertex
fn vertex_main(
    @builtin(vertex_index) i: u32,
) -> Output {
    let pos = array<vec2f, 4>(
        vec2( 1,  1),
        vec2(-1,  1),
        vec2( 1, -1),
        vec2(-1, -1),
    )[i];
    var out: Output;
    out.pos = vec4f(pos, 0, 1);
    out.uv = (pos + vec2(1, 1)) / 2;
    return out;
}

fn sameFace(
    v0: vec3f,
    v1: vec3f,
    v2: vec3f,
    p1: vec3f,
    p2: vec3f,
) -> bool {
    let normal = cross(v1 - v0, v2 - v0);
    return 0 < dot(normal, p1 - v0) * dot(normal, p2 - v0);
}

struct Vertex {
    v: vec3f,
    a: f32,
    s: f32,
};

fn longestEdge(vs: array<Vertex, 4>) -> array<u32, 2> {
    var maxLen: f32 = 0;
    var maxInd = array(0u, 0);

    for (var i=0u; i<3; i++) {
        for (var j=i+1; j<4; j++) {
            let now = length(vs[i].v - vs[j].v);
            if (now > maxLen) {
                maxLen = now;
                maxInd = array(i, j);
            }
        }
    }
    return maxInd;
}

fn rand2(a: f32, b: f32) -> f32 {
    return fract((a+3.141)*(b+3.141)*100);
}

fn makeVertex(v: vec3f, seed: f32) -> Vertex {
    return Vertex(
        v,
        -0.02,
        rand2(seed, 12.345),
    );
}

fn offset(seed: f32, l_: f32, a1: f32, a2: f32) -> f32 {
    var l = l_;
    if (l > 1) {
        l = pow(l, 0.5);
    }
    let seed1 = rand2(seed, 11.11);
    let seed2 = rand2(seed, 22.22);

    return (
        seed1 * 0.25 * abs(a1-a2) +
        seed2 * 0.17 * pow(l, 0.7)
    );
}

fn calc(p: vec3f, seed: f32) -> f32 {
    var tet: array<Vertex, 4> = array(
        makeVertex(vec3f(
            -sqrt(3)-0.20,
            -sqrt(3)-0.22,
            -sqrt(3)-0.23,
        ), seed+0),
        makeVertex(vec3f(
            -sqrt(3)-0.19,
             sqrt(3)+0.18,
             sqrt(3)+0.17,
        ), seed+1),
        makeVertex(vec3f(
             sqrt(3)+0.21,
            -sqrt(3)-0.24,
             sqrt(3)+0.15,
        ), seed+2),
        makeVertex(vec3f(
             sqrt(3)+0.24,
             sqrt(3)+0.22,
            -sqrt(3)-0.25,
        ), seed+3),
    );

    for (var depth=0; depth<40; depth++) {
        let i = longestEdge(tet);
        let v1 = tet[i[0]];
        let v2 = tet[i[1]];

        let s = rand2(v1.a, v2.a);

        var cutA = 0.5;
        if v1.s < v2.s { cutA += 0.1 * rand2(s, s); }
        if v1.s > v2.s { cutA -= 0.1 * rand2(s, s); }

        let vm = Vertex(
            v1.v*cutA + v2.v*(1-cutA),
            (v1.a + v2.a) / 2 + offset(
                s,
                length(v1.v - v2.v),
                v1.a,
                v2.a,
            ),
            s,
        );

        let mask = 15 - ((1 << i[0]) | (1 << i[1]));
        var restVs: array<Vertex, 2>;
        var restCount = 0;
        for (var i=0u; i<4; i++) {
            if ((mask & (1 << i)) > 0) {
                restVs[restCount] = tet[i];
                restCount++;
            }
        }

        let v3 = restVs[0];
        let v4 = restVs[1];

        if (sameFace(vm.v, v3.v, v4.v, p, tet[i[1]].v)) {
            tet[i[0]] = vm;
        } else if (sameFace(vm.v, v3.v, v4.v, p, tet[i[0]].v)) {
            tet[i[1]] = vm;
        } else {
            return 0;
        }
    }

    return (tet[0].a + tet[1].a + tet[2].a + tet[3].a) / 4;
}

fn getColor(alti: f32) -> vec4f {
    return vec4f(vec3f(colorMap[u32(alti * 256)]) / 256, 1.0);
}

const PI: f32 = 3.14159265358979323846264338327950288;

@fragment
fn fragment_main(@location(0) uv: vec2f) -> @location(0) vec4f {
    let w = extent.maxX - extent.minX;
    let h = extent.maxY - extent.minY;
    let x = uv.x * w + extent.minX;
    let y = uv.y * h + extent.minY;
    // let rand = fract(sin(uv.x * 12.9898 + uv.y * 78.233) * 43758.5453);
    let long = x * PI / 180;
    let lat = y * PI / 180;
    let alti = calc(vec3f(
        cos(lat) * cos(long),
        cos(lat) * sin(long),
        sin(lat),
    ), PI+7);
    //return vec4f(x/360, (y+90)/180, 0.0, 1.0);
    return getColor(alti);
}
