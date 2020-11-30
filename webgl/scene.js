
function makeBaseScene(cfg, camera, scene, world) {
    world.objects.forEach(object => { scene.add(object); });
    world.environment.forEach(env => { scene.add(env); });
    camera.position.z = 5;

    var ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    world.lights.forEach(light => { scene.add(light); });
}


function makeLensScene(cfg, camera, scene, world) {
    world.lenses.forEach(lens => { scene.add(lens); });
    var ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    // world.lights.forEach(light => { scene.add(light); });
}
