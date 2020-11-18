function getSourceSynch(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
};
function getShader(ty) {
    return getSourceSynch(document.getElementById(`${cfg.shaderRoot}-${ty}-glsl`).src);
}

function makeScene() {
    const geometry = new THREE.BoxGeometry();
    geometry.computeFlatVertexNormals();
    
    const material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib["lights"],
            {
                mAmbient: { type: "c", value: new THREE.Color(0x0000ff) }, //0x00dd00, // should generally match color
                mDiffuse: { type: "c", value: new THREE.Color(0x0000ff) }, //0x00dd00, 
                mSpecular: { type: "c", value: new THREE.Color(0xffffff) },
                mShininess: { type: "f", value: 40.0 },
                mKa: { type: "f", value: 0.3 },
                mKd: { type: "f", value: 0.8 },
                mKs: { type: "f", value: 0.8 }
            }
        ]),
        lights: true,
        vertexShader: getShader('vs'),
        fragmentShader: getShader('ps'),

    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    var ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(0xffffff);
    pointLight.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })));
    pointLight.position.set(cfg.lightPosX, cfg.lightPosY, cfg.lightPosZ);
    scene.add(pointLight);

}
