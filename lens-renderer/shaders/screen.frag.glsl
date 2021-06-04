varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() { 
    // vec2 fragmentScreenCoordinates = vec2(gl_FragCoord.x / _ScreenParams.x, gl_FragCoord.y / _ScreenParams.y);
    // vec4 tex = texture2D(tDiffuse, fragmentScreenCoordinates); 
    vec4 tex = texture2D(tDiffuse, vUv); 
    gl_FragColor = tex; 
}