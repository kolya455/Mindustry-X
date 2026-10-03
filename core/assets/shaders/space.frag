#define HIGHP
#define NSCALE 2700.0
#define CAMSCALE (NSCALE*10.0)

uniform sampler2D u_texture;
uniform sampler2D u_stars;

uniform vec2 u_campos;
uniform vec2 u_ccampos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

void main(){
    vec2 c = v_texCoords.xy;
    vec2 coords = vec2(c.x * u_resolution.x, c.y * u_resolution.y);

    vec4 color = texture2D(u_texture, c);

    vec2 base = vec2(-0.1, -0.1);

    //three parallax layers, each panning at its own rate against the camera
    vec3 stars = texture2D(u_stars, coords / (NSCALE * 3.0) + u_ccampos / (CAMSCALE * 3.0) + base).rgb * 0.30;
    stars += texture2D(u_stars, coords / NSCALE + u_ccampos / CAMSCALE + base).rgb * 0.70;
    stars += texture2D(u_stars, coords / (NSCALE * 0.4) + u_ccampos / (CAMSCALE * 0.4) + base).rgb * 1.10;

    //each layer breathes on its own period so the field never pulses in unison
    stars *= 0.82 + 0.18 * sin(u_time / 12.0 + coords.x / 26.0 + coords.y / 17.0);
    stars *= 0.90 + 0.10 * sin(u_time / 7.0 - coords.x / 9.0);

    //dim the field toward deep blue, keep the brightest stars neutral white
    float lum = clamp(dot(stars, vec3(0.3333)), 0.0, 1.0);
    vec3 tint = mix(vec3(0.58, 0.70, 1.0), vec3(1.0), smoothstep(0.0, 0.6, lum));

    color.rgb = clamp(stars, 0.0, 1.0) * tint;

    gl_FragColor = color;
}