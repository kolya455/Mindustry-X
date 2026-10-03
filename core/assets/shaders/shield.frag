#define HIGHP

#define ALPHA 0.18
#define STEP 2.0

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

    //ripple the lookup so the shell looks like it is under tension
    T += vec2(sin(coords.y / 3.0 + u_time / 20.0), sin(coords.x / 3.0 + u_time / 20.0)) / u_texsize;

    vec4 color = texture2D(u_texture, T);
    vec2 v = u_invsize;

    //outer silhouette: dilate the alpha channel to find the shell border
    vec4 maxed = max(max(max(texture2D(u_texture, T + vec2(0, STEP) * v), texture2D(u_texture, T + vec2(0, -STEP) * v)),
        texture2D(u_texture, T + vec2(STEP, 0) * v)), texture2D(u_texture, T + vec2(-STEP, 0) * v));

    if(texture2D(u_texture, T).a < 0.9 && maxed.a > 0.9){

        //hot rim: the border burns brighter the longer it has been alive
        float rim = 0.5 + 0.5 * sin(u_time / 9.0 - (coords.x + coords.y) / 26.0);
        gl_FragColor = vec4(maxed.rgb * (1.4 + rim * 0.5), maxed.a * 100.0);
    }else{

        if(color.a > 0.0){
            //hex lattice laid over the shell interior
            vec2 hp = coords / max(u_dp, 1.0) * 0.35;
            float hex = abs(sin(hp.x) + sin(hp.x * 0.5 + hp.y * 0.866) + sin(hp.y * 0.5 + hp.x * 0.866));
            float cell = 1.0 - smoothstep(0.0, 0.35, abs(hex - 1.5));

            //energy sweeping along the lattice
            float sweep = mod(hp.x * 3.0 + hp.y * 2.0 - u_time / 9.0, 6.0) / 6.0;

            color.rgb *= 0.55;
            color.rgb += vec3(0.35, 0.62, 0.9) * cell * (0.25 + sweep * 0.9);
            color.a = ALPHA * (1.0 + cell * 1.6);
        }

        gl_FragColor = color;
    }
}