varying lowp vec4 v_color;
varying lowp vec4 v_mix_color;
varying vec2 v_texCoords;
uniform sampler2D u_texture;

void main(){
    vec4 c = texture2D(u_texture, v_texCoords);

    //bayer-ish 4x4 dither, +/- half a quantisation step. kills the banding that
    //shows up in the large flat gradients the UI draws, and is invisible
    //everywhere else.
    vec2 p = floor(mod(gl_FragCoord.xy, 4.0));
    float bayer = mod(p.x + p.y * 4.0, 16.0) / 16.0 - 0.5;
    c.rgb += bayer / 255.0;

    gl_FragColor = v_color * mix(c, vec4(v_mix_color.rgb, c.a), v_mix_color.a);
}