
function makeScene(cfg, objects, lens, pointLight) {
    objects.forEach(object => {
        scene.add(object);
    });
    camera.position.z = 5;

    var ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    scene.add(pointLight);
}
