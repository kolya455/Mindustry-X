#define HIGHP

uniform sampler2D u_texture;

uniform vec2 u_texsize;
uniform vec2 u_uv;
uniform vec2 u_uv2;
uniform float u_progress;
uniform float u_time;
uniform float u_alpha;

varying vec4 v_color;
varying vec2 v_texCoords;


bool id(vec2 coords, vec4 base){
    vec4 target = texture2D(u_texture, coords);
    return  target.a < 0.1 || (coords.x < u_uv.x || coords.y < u_uv.y || coords.x > u_uv2.x || coords.y > u_uv2.y);
}

bool cont(vec2 T, vec2 v){
    const float step = 3.5;
    vec4 base = texture2D(u_texture, T);
    return base.a > 0.1 &&
           		(id(T + vec2(0, step) * v, base) || id(T + vec2(0, -step) * v, base) ||
           		id(T + vec2(step, 0) * v, base) || id(T + vec2(-step, 0) * v, base) ||
                id(T + vec2(step, step) * v, base) || id(T + vec2(step, -step) * v, base) ||
                id(T + vec2(-step, -step) * v, base) || id(T + vec2(-step, step) * v, base));
}

vec4 blend(vec4 dst, vec4 src){
    return src * src.a + dst * (1.0 - src.a);
}

void main(){

	vec2 t = v_texCoords.xy;

	vec2 v = vec2(1.0/u_texsize.x, 1.0/u_texsize.y);
	vec2 coords = (v_texCoords-u_uv) / v;
	float value = coords.x + coords.y;

	vec4 color = texture2D(u_texture, t);

	vec2 center = ((u_uv + u_uv2)/2.0 - u_uv) /v;
	float dst = (abs(center.x - coords.x) + abs(center.y - coords.y))/2.0;

	//the build frontier sweeps diagonally across the block
	float frontier = (1.0-u_progress) * (center.x);

	if((mod(u_time / 1.5 + value, 20.0) < 15.0 && cont(t, v))){
		gl_FragColor = blend(color, v_color) * vec4(vec3(1.0), u_alpha);
    }else if(dst > frontier){
		gl_FragColor = color * vec4(vec3(1.0), u_alpha);
	}else if((dst + 2.0 > frontier) && color.a > 0.1){
		//hot line right at the frontier, so construction reads as a sweep
		float edge = 1.0 - smoothstep(0.0, 2.0, frontier - dst);
		vec4 hot = blend(color, v_color);
		hot.rgb += v_color.rgb * edge * 1.6;
		gl_FragColor = hot * vec4(vec3(1.0), u_alpha);
	}else{
		gl_FragColor = vec4(0.0);
	}
}