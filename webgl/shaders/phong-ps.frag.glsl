varying vec3 vNormal;
varying vec3 vPos;
#if NUM_POINT_LIGHTS > 0
    struct PointLight {
        vec3 position;
        vec3 color;
    };
    uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
#endif	
uniform vec3 ambientLightColor;
uniform vec3 mDiffuse;
uniform vec3 mAmbient;
uniform vec3 mSpecular;
uniform float mShininess;
uniform float mKa;
uniform float mKd;
uniform float mKs;
void main() {	
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vPos);
    vec3 lDif = vec3(0.0, 0.0, 0.0);
    float lSpec = 0.0;
    for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
        vec3 L = normalize(pointLights[l].position - vPos);
        float lamb = clamp(dot(L, N), 0.0, 1.0);
        lDif += lamb * pointLights[l].color;
        if(lamb > 0.0) {
            vec3 R = reflect(-L, N);
            float specAngle = max(dot(R, V), 0.0);
            lSpec += pow(specAngle, mShininess);
        }
    }
    gl_FragColor = vec4(mKa * ambientLightColor * mAmbient +
                        mKd * lDif * mDiffuse +
                        mKs * lSpec * mSpecular, 1.0);
}