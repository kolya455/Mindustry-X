#define HIGHP

uniform sampler2D u_texture;
uniform sampler2D u_noise;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;

//two octaves of drifting noise, shared by the refraction and the highlight pass
float waves(vec2 p){
    return texture2D(u_noise, p).r * 0.65
        + texture2D(u_noise, p * 2.07 + vec2(0.37, 0.81)).r * 0.35;
}

void main(){
    vec2 c = v_texCoords;
    vec2 v = vec2(1.0/u_resolution.x, 1.0/u_resolution.y);
    vec2 coords = vec2(c.x / v.x + u_campos.x, c.y / v.y + u_campos.y);

    float stime = u_time / 5.0;

    //height field of the surface, in two scales
    float broad = waves(coords / 110.0 + vec2(stime * 0.05, -stime * 0.035));
    float fine = waves(coords / 38.0 + vec2(-stime * 0.08, stime * 0.065));
    float height = broad * 0.6 + fine * 0.4;

    //central difference on the fine layer approximates the surface slope
    vec2 slope = vec2(
        waves((coords + vec2(2.0, 0.0)) / 38.0 + vec2(-stime * 0.08, stime * 0.065)) - fine,
        waves((coords + vec2(0.0, 2.0)) / 38.0 + vec2(-stime * 0.08, stime * 0.065)) - fine
    );

    vec4 sampled = texture2D(u_texture, c + slope * 14.0 * v
        + vec2(sin(stime / 3.0 + coords.y / 0.75), 0.0) * v);

    vec3 color = sampled.rgb;

    //troughs read deeper and cooler than crests
    float depth = clamp(height * 1.7 - 0.4, 0.0, 1.0);
    color *= mix(vec3(0.68, 0.84, 1.06), vec3(1.08, 1.05, 1.0), depth);

    //whitecaps gather on the steepest crests
    float steep = clamp(length(slope) * 30.0, 0.0, 1.0);
    float foam = smoothstep(0.45, 0.95, steep) * smoothstep(0.4, 0.8, depth);
    color = mix(color, vec3(0.94, 0.98, 1.0), foam * 0.5);

    //tight glints riding the crest lines
    color += vec3(0.42, 0.55, 0.7) * pow(steep, 6.0) * 0.55;

    gl_FragColor = vec4(color, min(sampled.a * 100.0, 1.0));
}