varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float lensRadius1;
uniform float lensRadius2;
uniform float lensDiameter;
uniform float lensWidth;
uniform float chroma;
uniform vec3 lensPosition;
uniform float eta[6];
uniform vec2 screen;

vec4 raycirc(vec3 orig, vec3 ray, vec3 center, float radius, float sign) {
	float r2 = radius * radius;
	vec3 L = center - orig;
	float tca = dot(L, ray);
	float d2 = dot(L, L) - tca * tca;
	float d = sqrt(d2);
	float thc = sqrt(max(r2 - d2, 0.));
	return vec4(orig + (tca - sign * thc) * ray, r2 >= d2);
}

vec3 rayplane(vec3 orig, vec3 ray, float wallZ) {
	vec3 p0 = vec3(0, 0, wallZ);
	vec3 l0 = orig;
	vec3 n = vec3(0, 0, -1);
	float d = (p0 - l0).z / ray.z;
	// float d = dot(p0 - l0, n) / dot(ray, n);
	return orig + ray * d;
}

void main() {
	float flip = 1.;
	float Radius1 = lensRadius1 * 30000.;
	float Radius2 = lensRadius2 * 30000.;
	float Diameter = lensDiameter;
	// float Diameter=lensDiameter*100.;
	// float Diameter=lensDiameter/100.;

	vec3 lensPos = vec3(lensPosition.xy, 0);

	float tmp1 = sqrt(Radius1 * Radius1 - Diameter * Diameter / 4.) * sign(Radius1) * flip;
	vec3 lensCenter1 = lensPos + vec3(0, 0, -(lensWidth / 2. - tmp1));

	float tmp2 = sqrt(Radius2 * Radius2 - Diameter * Diameter / 4.) * sign(Radius2) * flip;
	vec3 lensCenter2 = lensPos + vec3(0, 0, (lensWidth / 2. - tmp2));

	// vec3 cameraCenter=vec3(gl_FragCoord.xy,0.);
	vec3 cameraCenter = vec3(lensPosition.xy, -lensPosition.z);
	// vec3 cameraCenter=vec3(lensPosition.xy,0.);
	// vec3 cameraCenter=vec3(screen.xy/2.,0.);
	// vec3 ray=vec3(0,0,1);
	vec3 ray = normalize(gl_FragCoord.xyz - cameraCenter);

	// vec4 intersection1=raycirc(vec3(gl_FragCoord.xy,0),ray,lensCenter1,Radius1);
	vec4 intersection1 = raycirc(cameraCenter, ray, lensCenter1, Radius1, flip);
	vec3 normal1 = normalize(intersection1.xyz - lensCenter1);

	vec3 colors[6];
	float eta_i;
	vec3 ray2, normal2, ray3, intersection3;
	vec4 intersection2;

#pragma unroll_loop_start
	for (int i = 0; i < 6; i++) {
		// eta_i=1.;
		// eta_i=1./eta[i];
		eta_i = 1. / eta[i] / eta[i];
		ray2 = refract(ray, normal1, eta_i);

		intersection2 = raycirc(intersection1.xyz, ray2, lensCenter2, Radius2, -flip);
		normal2 = normalize(intersection2.xyz - lensCenter2);

		// ray3=ray2;
		// ray3=refract(ray2,normal2,1./eta_i);
		ray3 = refract(ray2, normal2, eta_i);

		intersection3 = rayplane(intersection2.xyz, ray3, chroma);

		colors[i] = texture2D(tDiffuse, intersection3.xy / screen.xy).rgb;
	}
#pragma unroll_loop_end

	float r = colors[0].r * .5;
	float y = dot(vec3(2., 2., -1.), colors[1]) / 6.;
	float g = colors[2].g * .5;
	float c = dot(vec3(-1., 2., 2.), colors[3]) / 6.;
	float b = colors[4].b * .5;
	float v = dot(vec3(2., -1., 2.), colors[5]) / 6.;

	float R = r + (2. * v + 2. * y - c) / 3.;
	float G = g + (2. * y + 2. * c - v) / 3.;
	float B = b + (2. * c + 2. * v - y) / 3.;

	gl_FragColor = vec4(0, 0, 0, 0);
	gl_FragColor.a = 1.;
	// gl_FragColor.a=intersection1.a*intersection2.a;

	// gl_FragColor.rgba=texture2D(tDiffuse, vUv);
	// gl_FragColor.rgba=texture2D(tDiffuse,gl_FragCoord.xy/screen.xy);
	// gl_FragColor.rg=gl_FragCoord.xy/screen.xy;
	// gl_FragColor.r=abs(intersection1.x/screen.x);
	// gl_FragColor.b=abs(intersection1.y/screen.y);
	// gl_FragColor.rg=lensPosition.xy / screen.xy;
	// gl_FragColor.rgb=vec3(1,1,1);
	// gl_FragColor.r=gl_FragCoord.x / screen.x;
	// gl_FragColor.r = intersection1.x / screen.x;
	// gl_FragColor.r = intersection3.x / 1.;
	// gl_FragColor.rb=gl_FragCoord.xy / 1000.;
	// gl_FragColor.rgb=gl_FragCoord.xyz / 1000.;
	// gl_FragColor.rgb=abs(colors[0] - colors[5]);
	gl_FragColor.rgb = vec3(R, G, B);
	float alpha = intersection1.a;
	// float alpha = intersection1.a*intersection2.a;
	gl_FragColor.rgb = texture2D(tDiffuse, gl_FragCoord.xy / screen.xy).rgb * (1. - alpha) + gl_FragColor.rgb * alpha;
	// gl_FragColor.rgb = alpha * vec3(1.,1.,1.);
	// gl_FragColor.rgb=colors[5];
	// gl_FragColor.r=gl_FragCoord.z > 0. ? 1. : 0.;

	// vec3 direct=rayplane(cameraCenter.xyz,ray2,wallZ);
	// gl_FragColor.rgba=texture2D(tDiffuse,direct.xy/screen.xy);
	// vec3 direct=intersection1.xyz;
	// vec3 direct=rayplane(intersection2.xyz,ray3,wallZ);
	// gl_FragColor.rgba=texture2D(tDiffuse,direct.xy/screen.xy);
}