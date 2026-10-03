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

    float btime = u_time / 8000.0;
    vec2 npos = coords / NSCALE;

    float noise = (texture2D(u_noise, npos + vec2(btime) * vec2(-0.9, 0.8)).r
        + texture2D(u_noise, npos + vec2(btime * 1.1) * vec2(-0.8, -1.0)).r) / 2.0;

    vec4 color = texture2D(u_texture, c);

    //tar swallows light everywhere except on the rare slow swell
    color.rgb *= vec3(0.55, 0.55, 0.66);

    //the swell itself: a narrow band that drifts across the surface
    float swell = smoothstep(0.50, 0.545, noise) * (1.0 - smoothstep(0.555, 0.60, noise));
    color.rgb += vec3(0.13, 0.14, 0.22) * swell;

    //oil-slick iridescence, faint and only on the very tops
    float film = pow(swell, 2.0);
    color.rgb += vec3(0.10, 0.04, -0.02) * film * sin(u_time / 40.0 + coords.x / 40.0);

    gl_FragColor = color;
}