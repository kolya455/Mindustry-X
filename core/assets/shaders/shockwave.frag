#define MAX_SHOCKWAVES 64
#define WAVE_RADIUS 5.0
#define DIFF_SCL 1.5
#define WAVE_POW 0.8

varying vec2 v_texCoords;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_campos;
uniform vec4 u_shockwaves[MAX_SHOCKWAVES];
uniform int u_shockwave_count;

void main(){
    vec2 worldCoords = v_texCoords * u_resolution + u_campos;
    vec2 uv = v_texCoords;
    vec2 displacement = vec2(0.0, 0.0);
    float ring = 0.0;

    for(int i = 0; i < MAX_SHOCKWAVES; i ++){
        vec4 wave = u_shockwaves[i];
        float radius = wave.z;
        float dst = distance(worldCoords, wave.xy);
        float strength = wave.w * (1.0 - abs(dst - radius) / WAVE_RADIUS);

        if(abs(dst - radius) <= WAVE_RADIUS){
            float diff = (dst - radius);

            float pdiff = 1.0 - pow(abs(diff * DIFF_SCL), WAVE_POW);
            float diffTime = diff  * pdiff;
            vec2 relative = normalize(worldCoords - wave.xy);

            displacement += (relative * diffTime * strength) / u_resolution;

            //the crest itself, brightest right at the wavefront
            ring += (1.0 - smoothstep(0.0, WAVE_RADIUS * 0.45, abs(diff))) * strength;
        }

        if(i >= u_shockwave_count - 1){
            break;
        }
    }

    //split the channels along the displacement so the edge of the blast smears
    //into colour instead of tearing a clean line
    vec2 across = vec2(-displacement.y, displacement.x);
    float split = length(across) * 0.5;

    vec4 c;
    c.r = texture2D(u_texture, uv + displacement + across * split).r;
    c.g = texture2D(u_texture, uv + displacement).g;
    c.b = texture2D(u_texture, uv + displacement - across * split).b;
    c.a = texture2D(u_texture, uv + displacement).a;

    //additive flash along the wavefront
    c.rgb += vec3(0.55, 0.72, 0.9) * clamp(ring, 0.0, 2.0) * 0.5;

    gl_FragColor = c;
}