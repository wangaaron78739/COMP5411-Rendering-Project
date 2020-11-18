// SETUP THREE.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// SETUP OrbitControls
controls = new THREE.OrbitControls(camera, renderer.domElement);
//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.15;
controls.screenSpacePanning = false;
controls.minDistance = 5;
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // renderer.clear(true, true, true);
    renderer.render(scene, camera);
}

makeGui();
makeScene();

animate();