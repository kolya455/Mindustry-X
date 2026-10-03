#define HIGHP

uniform sampler2D u_texture;
uniform vec2 u_texsize;
uniform vec2 u_invsize;
uniform float u_time;
uniform float u_dp;
uniform vec2 u_offset;
varying vec2 v_texCoords;

void main(){
    vec2 T = v_texCoords.xy;
    vec2 coords = (T * u_texsize) + u_offset;
    vec4 color = texture2D(u_texture, T);

    float dp = max(u_dp, 1.0);

    //packets of charge running along the beam, in alternating directions
    float lane = mod(coords.x / dp + coords.y / dp - u_time / 4.0, 10.0);
    float lane2 = mod(coords.x / dp - coords.y / dp + u_time / 5.5, 10.0);

    float pulse = step(lane, 2.6);
    float counter = step(lane2, 1.4) * 0.5;

    //slow breathing so the beam never sits completely still
    float breathe = 0.34 + abs(sin(u_time / 15.0)) * 0.06;

    color.a *= breathe + pulse * 0.34 + counter * 0.22;

    //tint the leading edge of each packet toward white
    color.rgb += vec3(0.35, 0.42, 0.5) * pulse * 0.5;

    gl_FragColor = color;
}