#define HIGHP

#define NSCALE 200.0 / 1.8

uniform sampler2D u_texture;
uniform sampler2D u_noise;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

void main(){
    vec2 c = v_texCoords.xy;
    vec2 coords = vec2(c.x * u_resolution.x + u_campos.x, c.y * u_resolution.y + u_campos.y);

    float btime = u_time / 3400.0;
    vec2 npos = coords / NSCALE;

    //three drifting copies of the noise field; where they agree the light focuses
    float n1 = texture2D(u_noise, npos + vec2(btime) * vec2(-0.9, 0.8)).r;
    float n2 = texture2D(u_noise, npos + vec2(btime * 1.1) * vec2(0.8, -1.0)).r;
    float n3 = texture2D(u_noise, npos * 1.63 + vec2(btime * 0.9) * vec2(0.8, 1.0)).r;

    float focus = min(min(n1, n2), n3);

    //sharpen the interference into thin bright filaments
    float thread = 1.0 - smoothstep(0.0, 0.09, abs(focus - 0.62));
    float caustic = thread * (0.35 + focus);

    vec3 color = vec3(0.55, 0.78, 0.92) * caustic;
    color += vec3(0.25, 0.35, 0.4) * smoothstep(0.55, 0.75, focus);

    gl_FragColor = vec4(color, clamp(caustic * 0.9 + 0.08, 0.0, 1.0));
}