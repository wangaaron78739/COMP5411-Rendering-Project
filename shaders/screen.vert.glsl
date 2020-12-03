varying vec2 vUv;
varying vec2 lensUV[6];
varying float debugflag;
uniform float lensRadius1;
uniform float lensRadius2;
uniform float lensDiameter;
uniform float lensWidth;
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

#define flip (1.)

vec3 trace2(vec3 orig, vec3 ray, vec3 frontNormal, float eta, float wallZ, vec3 lensCenter, float radius) {
	// Refract off the front face
	vec3 ray2 = refract(ray, frontNormal, eta);
	return rayplane(orig, ray2, wallZ);

	
	// Hit the back face
	vec4 hit = raycirc(orig.xyz, ray2, lensCenter, radius, -flip);
	vec3 normal = normalize(hit.xyz - lensCenter);

	// Refract off the back face (maybe)
	vec3 ray3=ray2;
	// vec3 ray3 = refract(ray2, normal, 1. / eta);
	// vec3 ray3 = refract(ray2, normal, eta);

	// Hit the back wall
	return rayplane(hit.xyz, ray3, wallZ);
}

void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	vec3 coord = vec3(vUv * screen, gl_Position.z);
	float ringRadius = lensDiameter * 50.;
	float d = length(lensPosition.xy - coord.xy);
	debugflag = step(d, ringRadius);

	// The curvature of the front face of the lens
	float r1 = lensRadius1 * 200000.;
	float tmp1 = sqrt(r1 * r1 - ringRadius * ringRadius) * sign(r1);
	vec3 lensCenter1 = lensPosition + vec3(0, 0, -flip*(lensWidth / 2. - tmp1));

	// The curvature of the back face of the lens
	float r2 = lensRadius2 * 200000.;
	float tmp2 = sqrt(r2 * r2 - ringRadius * ringRadius) * sign(r2);
	vec3 lensCenter2 = lensPosition + vec3(0, 0, flip*(lensWidth / 2. - tmp2));

	// First ray
	// vec3 cameraCenter = vec3(coord.xy, 0);
	vec3 cameraCenter = vec3(lensPosition.xy, 0);
	vec3 ray = normalize(coord.xyz - cameraCenter);

	// Intersect the front face of the lens
	vec4 hit = raycirc(cameraCenter, ray, lensCenter1, r1, flip);
	vec3 normal = normalize(hit.xyz - lensCenter1);
	debugflag *= hit.a;

	lensUV[0] =
		trace2(hit.xyz, ray, normal, eta[0], gl_Position.z / gl_Position.w, lensCenter2, r2).xy / screen.xy;
		// lensUV[0] = hit.xy/screen;
}