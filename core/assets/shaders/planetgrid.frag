varying vec4 v_col;
varying vec4 v_position;

uniform vec3 u_mouse;

const vec4 shadow = vec4(0, 0, 0, 0);

void main(){
    //distance from the hovered tile, in world space
    float dst = distance(u_mouse, v_position.xyz);

    //same radial fade as before, but with a soft shoulder near the cursor so the
    //nearest grid lines stay legible instead of clipping straight to invisible
    float near = 1.0 - smoothstep(0.0, 0.35, dst);

    vec4 grid = v_col;
    grid.a *= near;
    grid.rgb += v_col.rgb * near * 0.5;

    //faint ring marking the selected tile
    float ring = 1.0 - smoothstep(0.0, 0.07, abs(dst - 0.55));
    grid.rgb += v_col.rgb * ring * 0.8;

    gl_FragColor = mix(grid, shadow, clamp(dst, 0.0, 1.0));
}