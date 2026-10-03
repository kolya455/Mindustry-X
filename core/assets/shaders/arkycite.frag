#define HIGHP

#define S1 vec4(96.0, 131.0, 66.0, 255.0) / 255.0
#define S2 vec3(132.0, 169.0, 79.0) / 255.0
#define S3 vec3(210.0, 221.0, 118.0) / 255.0
#define S4 vec3(240.0, 246.0, 186.0) / 255.0

#define NSCALE 170.0 / 2.0
#define DSCALE 160.0 / 2.0

uniform sampler2D u_texture;
uniform sampler2D u_noise;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

void main(){
    vec2 c = v_texCoords.xy;
    vec2 coords = (c * u_resolution) + u_campos;

    vec4 orig = texture2D(u_texture, c);

    float atime = u_time / 15000.0;
    vec2 dpos = coords / DSCALE;

    float noise = (texture2D(u_noise, dpos + vec2(atime) * vec2(-0.9, 0.8)).r
        + texture2D(u_noise, dpos + vec2(atime * 1.1) * vec2(0.8, -1.0)).r) / 2.0;

    noise = abs(noise - 0.5) * 7.0 + 0.23;

    float btime = u_time / 9000.0;
    vec2 npos = coords / NSCALE;

    //the crystal lattice drifts, so the veins crawl across the floor
    c += (vec2(
        texture2D(u_noise, npos + vec2(btime) * vec2(-0.9, 0.8)).r,
        texture2D(u_noise, npos + vec2(btime * 1.1) * vec2(0.8, -1.0)).r
    ) - vec2(0.5)) * 20.0 / u_resolution;

    vec4 color = texture2D(u_texture, c);

    if(noise > 0.85){
        if(color.g >= (S2).g - 0.1){
            color.rgb = S3;
        }else{
            color.rgb = S2;
        }
    }else if(noise > 0.5){
        color.rgb = S2;
    }

    //the very core of each vein burns white-hot and breathes
    float core = smoothstep(0.92, 1.0, noise);
    float breathe = 0.75 + 0.25 * sin(u_time / 22.0 + coords.x / 70.0 - coords.y / 55.0);
    color.rgb = mix(color.rgb, S4, core * breathe);

    //additive bloom around the veins, strongest on the brightest crystal
    color.rgb += S3 * core * 0.35 * breathe;

    gl_FragColor = vec4(max(S1, color).rgb, orig.a);
}