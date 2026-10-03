#define HIGHP

uniform sampler2D u_texture;

varying vec4 v_color;
varying vec2 v_texCoords;

void main(){
	vec4 color = texture2D(u_texture, v_texCoords.xy);

	//deep navy rather than dead black: unlit ground still reads as cold, not empty
	gl_FragColor = vec4(0.02, 0.028, 0.055, 1.0 - color.r) * v_color;
}