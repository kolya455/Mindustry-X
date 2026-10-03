#define HIGHP

//shades of slag
#define S2 vec3(100.0, 93.0, 49.0) / 100.0
#define S1 vec3(100.0, 60.0, 25.0) / 100.0
#define S3 vec3(100.0, 88.0, 72.0) / 100.0
#define NSCALE 200.0 / 2.0

uniform sampler2D u_texture;
uniform sampler2D u_noise;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

void main(){
    vec2 coords = v_texCoords * u_resolution + u_campos;

    float btime = u_time / 5000.0;
    vec4 orig = texture2D(u_texture, v_texCoords);
    vec2 npos = coords / NSCALE;

    float noise = (texture2D(u_noise, npos + vec2(btime) * vec2(-0.9, 0.8)).r
        + texture2D(u_noise, npos + vec2(btime * 1.1) * vec2(0.8, -1.0)).r) / 2.0;

    //TODO: pack noise texture
    vec2 c = v_texCoords + (vec2(
        texture2D(u_noise, coords / 170.0 + vec2(btime) * vec2(-0.9, 0.8)).r,
        texture2D(u_noise, coords / 170.0 + vec2(btime * 1.1) * vec2(0.8, -1.0)).r
    ) - vec2(0.5)) * 8.0 / u_resolution;

    vec4 color = texture2D(u_texture, c);
    if(color.a < 0.95){
        color = orig;
    }

    //cooled crust, with the plates separating as the noise field swells
    color.rgb = mix(color.rgb * vec3(0.62, 0.60, 0.62), S3, smoothstep(0.30, 0.52, noise));

    //a narrow band of noise is the molten seam between two plates
    float seam = 1.0 - smoothstep(0.0, 0.055, abs(noise - 0.57));

    //the seam pulses slowly, brightest where it is also thick
    float pulse = 0.72 + 0.28 * sin(u_time / 26.0 + coords.x / 60.0 + coords.y / 90.0);
    color.rgb = mix(color.rgb, S1 * 1.25, seam * 0.85 * pulse);
    color.rgb = mix(color.rgb, S2, seam * 0.5);
    color.rgb += S1 * seam * seam * pulse * 0.55;

    gl_FragColor = color;
}