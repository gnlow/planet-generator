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
