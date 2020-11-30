
function makeScene(cfg, camera, scene, world) {
    world.objects.forEach(object => { scene.add(object); });
    world.environment.forEach(env => { scene.add(env); console.log(env); });
    camera.position.z = 5;

    var ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    world.lights.forEach(light => { scene.add(light); });
}
