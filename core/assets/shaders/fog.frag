#define HIGHP
#define QUANT 0.3

uniform sampler2D u_texture;

varying vec4 v_color;
varying vec2 v_texCoords;

void main(){
    vec4 color = texture2D(u_texture, v_texCoords.xy);

    //the banded ramp is load bearing: it keeps fog cheap and gives it hard steps.
    //soften each step instead of removing it, so the edges stop crawling.
    float lit = clamp(color.r, 0.0, 1.0);
    float band = floor(lit / QUANT) * QUANT;
    float frac = clamp((lit - band) / QUANT, 0.0, 1.0);

    float falloff = band + smoothstep(0.15, 0.85, frac) * QUANT * 0.5;

    float alpha = (1.0 - falloff) * step(lit, 0.99);

    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha) * v_color;
}