// SETUP stats box
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// SETUP THREE.js
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.autoClear = false;
document.body.appendChild(renderer.domElement);

// SETUP THREE scenes
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const sceneTexture = new THREE.WebGLRenderTarget(window.innerWidth*2, window.innerHeight*2, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
makeScene(cfg, camera, scene, world);

const sceneScreen = new THREE.Scene();
((scene) => {
    const materialScreen = new THREE.ShaderMaterial({
        uniforms: { tDiffuse: { value: sceneTexture.texture } },
        vertexShader: getShaderCustom('screen', 'vs'),
        fragmentShader: getShaderCustom('screen', 'ps'),

        depthWrite: false
    });

    const plane = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);
    const quad = new THREE.Mesh(plane, materialScreen);
    quad.position.z = -100;
    // quad.position.z = - 100;

    scene.add(quad);
})(sceneScreen);

const sceneTotal = new THREE.Scene();
const cameraOrtho = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000);
const cameraPerspective = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
cameraPerspective.position.z = 5;


// SETUP OrbitControls & DragControls
const orbitControls = initControls();
const dragControls = new THREE.DragControls(world.objects, camera, renderer.domElement);
dragControls.addEventListener('dragstart', function () { orbitControls.enabled = false; });
dragControls.addEventListener('dragend', function () { orbitControls.enabled = true; });

function renderTo(target, fn) {
    renderer.setRenderTarget(target);
    renderer.clear();
    fn(renderer);

}

requestAnimationFrame(animate);

function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    orbitControls.update();

    renderTo(sceneTexture, function (renderer) {
        renderer.setClearColor(0xff0000, 0);
        renderer.render(scene, camera);
    });
    renderTo(null, function (renderer) {
        renderer.render(sceneScreen, cameraOrtho);
        // renderer.render(sceneScreen, cameraPerspective);
        renderer.render(sceneTotal, cameraPerspective);
    });

    stats.end();
}

makeGui(world);

animate();