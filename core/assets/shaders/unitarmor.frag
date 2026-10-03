uniform sampler2D u_texture;

uniform float u_time;
uniform float u_progress;
uniform vec2 u_uv;
uniform vec2 u_uv2;
uniform vec2 u_texsize;

varying vec4 v_color;
varying vec2 v_texCoords;

void main(){
    vec2 coords = (v_texCoords - u_uv) / (u_uv2 - u_uv);
    vec2 v = vec2(1.0/u_texsize.x, 1.0/u_texsize.y);

    vec4 c = texture2D(u_texture, v_texCoords);
    c.a *= u_progress;

    //armour plates lock in as horizontal bands, with a moving highlight
    float plate = step(abs(sin(coords.y * 3.0 + u_time)), 0.9);
    float sheen = 1.0 - smoothstep(0.0, 0.5, abs(fract(coords.x * 2.0 + coords.y * 0.5 - u_time / 14.0) - 0.5));

    c.rgb += vec3(0.30, 0.34, 0.40) * sheen * 0.7;
    c.rgb *= 0.9 + plate * 0.15;

    gl_FragColor = c * v_color;
}