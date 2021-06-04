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
	// float wallZ=100.;
	float wallZ = gl_FragCoord.z;
	float r1 = lensRadius1 * 30000.;
	float r2 = lensRadius2 * 30000.;
	float lr = lensDiameter / 2.;

	// The center of the lens
	vec3 lensPos = vec3(lensPosition.xy, 0);

	// Calculate the center of curvature of the front face of the lens
	float tmp1 = sqrt(r1 * r1 - lr * lr) * sign(r1) * flip;
	vec3 lensCenter1 = lensPos + vec3(0, 0, -(lensWidth / 2. - tmp1));

	// Calculate the center of curvature of the back face of the lens
	float tmp2 = sqrt(r2 * r2 - lr * lr) * sign(r2) * flip;
	vec3 lensCenter2 = lensPos + vec3(0, 0, (lensWidth / 2. - tmp2));

	// First ray from the 'camera'(center of lens but back) towards the FragCoord
	vec3 cameraCenter = vec3(lensPosition.xy, -lensPosition.z);
	vec3 ray = normalize(gl_FragCoord.xyz - cameraCenter);

	// Intersect the front face of the lens (using standard ray-circle intersection)
	vec4 frontFaceHit = raycirc(cameraCenter, ray, lensCenter1, r1, flip);
	vec3 frontFaceNormal = normalize(frontFaceHit.xyz - lensCenter1);

	vec3 colors[6];
	float eta_i;
	vec3 ray2, backFaceNormal, ray3, intersection3;
	vec4 backFaceHit;
	// Project 6 rays according to different color components (with different refractive indices)
#pragma unroll_loop_start
	for (int i = 0; i < 6; i++) {
		eta_i = 1. / eta[i] / eta[i];
		// Refract through the front face
		ray2 = refract(ray, frontFaceNormal, eta_i);

		// Intersect the back face (using new ray)
		backFaceHit = raycirc(frontFaceHit.xyz, ray2, lensCenter2, r2, -flip);
		backFaceNormal = normalize(backFaceHit.xyz - lensCenter2);

		// Refract through the back face
		ray3 = refract(ray2, backFaceNormal, eta_i);

		// Intersect with the 'back wall' (aka original scene)
		intersection3 = rayplane(backFaceHit.xyz, ray3, chroma);

		// sample the texture
		colors[i] = texture2D(tDiffuse, intersection3.xy / screen.xy).rgb;
	}
#pragma unroll_loop_end

	// This should simulate dispersion
	// 6 color component distribution comes from this paper;
	// https://web.archive.org/web/20061128135550/http://home.iitk.ac.in/~shankars/reports/dispersionraytrace.pdf
	// Take one color component from each ray
	float r = colors[0].r * .5;
	float y = dot(vec3(2., 2., -1.), colors[1]) / 6.;
	float g = colors[2].g * .5;
	float c = dot(vec3(-1., 2., 2.), colors[3]) / 6.;
	float b = colors[4].b * .5;
	float v = dot(vec3(2., -1., 2.), colors[5]) / 6.;
	// mix the color components
	float R = r + (2. * v + 2. * y - c) / 3.;
	float G = g + (2. * y + 2. * c - v) / 3.;
	float B = b + (2. * c + 2. * v - y) / 3.;
	vec4 mixed = vec4(R, G, B, 1);

	// Only render the parts where the ray actually hits the lens, otherwise there are artifacts
	float alpha = frontFaceHit.a;
	gl_FragColor = texture2D(tDiffuse, gl_FragCoord.xy / screen.xy) * (1. - alpha) + mixed * alpha;
}