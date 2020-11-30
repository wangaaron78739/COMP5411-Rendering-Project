var world = {
    objects: [],
    lenses: [],
    lights: [],
    environment: [],
};
let defaultCfg =
{
    //shaderOptions
    shaderRoot: 'gouraud',
    shaderVis: false,
    animate: false,

    //meshOptions
    flatNormals: true,
    wireframe: false,
    fnVis: false,
    vnVis: false,

    //lightPos
    lightPos: [
        {
            lightPosX: -50.0,
            lightPosY: 30.0,
            lightPosZ: -50.0,
        },
        {
            lightPosX: 50.0,
            lightPosY: 30.0,
            lightPosZ: 50.0,
        }
    ],

    lensesOptions: [
        {
            lensPosX: 0.0,
            lensPosY: 0.0,
            focalLength: 1.0,
            diameter: 4.0,
            distance: -5.0,
        },
        {
            lensPosX: 1.0,
            lensPosY: -1.0,
            focalLength: 1.0,
            diameter: 4.0,
            distance: -10.0,
        }
    ],

    about: function () { }
};

var cfg = defaultCfg;

function getSourceSynch(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
};

function getShaderCustom(name, ty) {
    return getSourceSynch(document.getElementById(`${name}-${ty}-glsl`).src);
}
function getShader(cfg, ty) {
    return getShaderCustom(cfg.shaderRoot, ty);
}

const cube = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20),
    new THREE.ShaderMaterial({
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
        vertexShader: getShader(cfg, 'vs'),
        fragmentShader: getShader(cfg, 'ps'),
    })
);

cube.name = 'cube';
cube.matrixWorld.setPosition(new THREE.Vector3(0.0, 0.0, 0.0));
world.objects.push(cube);

world.objects.forEach(object => object.geometry.computeFlatVertexNormals());


cfg.lightPos.forEach(pos => {
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })));
    pointLight.position.set(pos.lightPosX, pos.lightPosY, pos.lightPosZ);
    world.lights.push(pointLight);
});

const groundTexture = THREE.ImageUtils.loadTexture("tex/checker.png"); //grasslight-big.jpg
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
//groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(50, 50);
groundTexture.anisotropy = 32;
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, specular: 0x000000, map: groundTexture });
ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), groundMaterial);
ground.rotation.x = - Math.PI / 2;
ground.position.y = -22;

world.environment.push(ground);


//Lenses
cfg.lensesOptions.forEach(config => {
    const lens = new THREE.Mesh(new THREE.CircleGeometry(config.diameter, 32), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    lens.position.x = config.lensPosX;
    lens.position.y = config.lensPosY;
    lens.position.z = config.distance;
    world.lenses.push(lens);
})