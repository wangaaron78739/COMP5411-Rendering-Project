varying vec2 vUv;
varying vec2 lensUV[6];
uniform sampler2D tDiffuse;
varying float debugflag;

void main() { 
    vec4 tex = texture2D(tDiffuse, vUv); 
    // gl_FragColor = debugflag * vec4(1.,1.,1.,0.) + (1.-debugflag)* tex; 
    gl_FragColor = debugflag * texture2D(tDiffuse, lensUV[0]) + + (1.-debugflag)* tex; 
    // gl_FragColor = tex; 
}