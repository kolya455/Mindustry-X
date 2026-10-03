#define HIGHP

//shades of cryofluid
#define S1 vec3(53.0, 83.0, 93.0) / 100.0
#define S2 vec3(68.0, 90.0, 97.0) / 100.0
#define S3 vec3(96.0, 128.0, 138.0) / 100.0
#define NSCALE 100.0 / 2.0

uniform sampler2D u_texture;
uniform sampler2D u_noise;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

void main(){
    vec2 c = v_texCoords.xy;
    vec2 coords = vec2(c.x * u_resolution.x + u_campos.x, c.y * u_resolution.y + u_campos.y);

    float btime = u_time / 5000.0;
    float wave = abs(sin(coords.x * 1.1 + coords.y) + 0.1 * sin(2.5 * coords.x) + 0.15 * sin(3.0 * coords.y)) / 30.0;

    vec2 npos = coords / NSCALE;
    float noise = wave + (texture2D(u_noise, npos + vec2(btime) * vec2(-0.2, 0.8)).r
        + texture2D(u_noise, npos + vec2(btime * 1.1) * vec2(0.8, -1.0)).r) / 2.0;

    vec4 color = texture2D(u_texture, c);

    //quantised shading bands turn the fluid into packed ice facets
    color.rgb = mix(color.rgb, S1, smoothstep(0.49, 0.53, noise) * 0.85);
    color.rgb = mix(color.rgb, S2, smoothstep(0.54, 0.57, noise) * 0.9);
    color.rgb = mix(color.rgb, S3, smoothstep(0.575, 0.60, noise) * 0.95);

    //frost creeps along the boundaries between facets
    float edge = 1.0 - smoothstep(0.0, 0.012, abs(noise - 0.565));
    color.rgb += vec3(0.22, 0.26, 0.28) * edge;

    //occasional internal glint, as if a bubble were caught in the ice
    float seed = texture2D(u_noise, coords / 13.0 + vec2(btime * 0.4)).r;
    color.rgb += vec3(0.30, 0.34, 0.36) * pow(seed, 12.0) * 2.0;

    gl_FragColor = color;
}