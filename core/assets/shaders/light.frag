uniform sampler2D u_texture;
uniform vec4 u_ambient;

varying vec2 v_texCoords;

void main(){
	vec4 color = texture2D(u_texture, v_texCoords);

	//S-curve the light falloff: endpoints are preserved, midtones get more
	//contrast, so lamp light pools instead of washing the floor evenly.
	float a = clamp(color.a, 0.0, 1.0);
	a = a * a * (3.0 - 2.0 * a);

	gl_FragColor = clamp(vec4(mix(u_ambient.rgb, color.rgb, a), u_ambient.a - a), 0.0, 1.0);
}