varying vec3 vNormal;
varying vec3 vPos;
void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalMatrix * normal;
    gl_Position.z += 0.0001; //for wireframe z-fighting
}