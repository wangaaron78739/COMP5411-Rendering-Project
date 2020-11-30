// SETUP THREE.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// SETUP OrbitControls
orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
orbitControls.dampingFactor = 0.15;
orbitControls.screenSpacePanning = false;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 500;
orbitControls.maxPolarAngle = Math.PI / 2;

makeScene(cfg, camera, scene, world);

const dragControls = new THREE.DragControls(world.objects, camera, renderer.domElement);
dragControls.addEventListener('dragstart', function () { orbitControls.enabled = false; });
dragControls.addEventListener('dragend', function () { orbitControls.enabled = true; });


var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

requestAnimationFrame(animate);

function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    orbitControls.update();
    renderer.render(scene, camera);
    stats.end();
}

makeGui(world);

animate();