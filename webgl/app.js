// SETUP config
var [cfg, world] = initConfig();

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
const sceneTexture = new THREE.WebGLRenderTarget(window.innerWidth * 2, window.innerHeight * 2, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
makeBaseScene(cfg, camera, scene, world);

const cameraOrtho = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000);
const cameraPerspective = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
cameraOrtho.position.z = 0;
cameraPerspective.position.z = 5;


let lensScenes = [];
let prevTexture = sceneTexture;
let gui = makeGui(cfg, world);
let [orbitControls, dragControls] = initControls(camera, cameraPerspective, renderer, world);

function genLensScenes(world) {
    lensScenes = [];
    prevTexture = sceneTexture;
    for (let idx = world.lenses.length - 1; idx >= 0; idx--) {
        const nextTexture = new THREE.WebGLRenderTarget(window.innerWidth * 2, window.innerHeight * 2, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });

        const sceneScreen = new THREE.Scene();
        ((scene) => {
            const materialScreen = new THREE.ShaderMaterial({
                uniforms: { tDiffuse: { value: prevTexture.texture } },
                vertexShader: getShaderCustom('screen', 'vs'),
                fragmentShader: getShaderCustom('screen', 'ps'),
                depthWrite: false
            });

            const plane = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);
            const quad = new THREE.Mesh(plane, materialScreen);
            quad.position.z = -100;

            scene.add(quad);
        })(sceneScreen);

        world.lenses[idx].material.uniforms.tDiffuse.value = prevTexture.texture;

        const sceneTotal = new THREE.Scene();
        // Add lenses (textured semispheres) to sceneTotal

        const lens = { screen: sceneScreen, total: sceneTotal, tex: nextTexture };
        lensScenes.push(lens);
        prevTexture = nextTexture;
        sceneTotal.add(world.lenses[idx]);
    }
    lensScenes[world.lenses.length - 1].tex = null; //render last lens to screen 
}

function renderTo(target, fn) {
    renderer.setRenderTarget(target);
    renderer.clear();
    fn(renderer);
}

function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    orbitControls.update();

    renderTo(sceneTexture, function (renderer) {
        renderer.setClearColor(0xff0000, 0);
        renderer.render(scene, camera);
    });

    lensScenes.forEach(lens => {
        renderTo(lens.tex, function (renderer) {
            renderer.render(lens.screen, cameraOrtho);
            renderer.render(lens.total, cameraPerspective);
        });
    });

    stats.end();
}

function reload(gui, cfg, world) {
    addLensesToWorld(cfg, world);
    genLensScenes(world);
    reloadLensGui(gui, cfg, world);
    updateDragControls(orbitControls, cameraPerspective, renderer, world);
    world.lenses.forEach(lens => refreshLensShaders(lens));
    animate();
}

reload(gui, cfg, world);
