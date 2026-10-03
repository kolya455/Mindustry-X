#define HIGHP

#define NSCALE 180.0 / 2.0

uniform sampler2D u_texture;
uniform sampler2D u_noise;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

void main(){
    vec2 c = v_texCoords.xy;
    vec2 coords = vec2(c.x * u_resolution.x + u_campos.x, c.y * u_resolution.y + u_campos.y);

    float btime = u_time / 70000.0;
    vec2 npos = coords / NSCALE;

    //two slowly crawling noise samples, as in the original mud
    float noise = sin((texture2D(u_noise, npos + vec2(btime) * vec2(-0.9, 0.8)).r
        + texture2D(u_noise, npos + vec2(abs(sin(btime)) * 1.1) * vec2(-0.8, -1.0)).r) / 2.0);

    vec4 color = texture2D(u_texture, c);

    //raised clumps catch the light, hollows between them stay dark and damp
    float clump = smoothstep(0.40, 0.68, noise);
    color.rgb *= mix(vec3(0.86, 0.84, 0.80), vec3(1.22, 1.18, 1.10), clump);

    //wet sheen along the top of every clump
    float crest = smoothstep(0.54, 0.60, noise) * (1.0 - smoothstep(0.62, 0.70, noise));
    color.rgb += vec3(0.16, 0.18, 0.20) * crest;

    //grit speckle so the flats do not read as flat colour
    float grit = texture2D(u_noise, coords / 7.0).r;
    color.rgb *= 0.94 + grit * 0.12;

    gl_FragColor = color;
}