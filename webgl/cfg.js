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
            lightPosX: -5.0,
            lightPosY: 5.0,
            lightPosZ: -5.0,
        },
        {
            lightPosX: 5.0,
            lightPosY: 5.0,
            lightPosZ: 5.0,
        }
    ],

    lensesOptions: [
        {
            focalLength: 1.0,
            diameter: 2.0,
        }
    ],
    //magnifyOptions


    about: function () { }
};

var cfg = defaultCfg;

function getSourceSynch(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
};

function getShader(cfg, ty) {
    return getSourceSynch(document.getElementById(`${cfg.shaderRoot}-${ty}-glsl`).src);
}

const cube = new THREE.Mesh(new THREE.BoxGeometry(),
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


cfg.lightPos.forEach((pos => {
    var pointLight = new THREE.PointLight(0xffffff);
    pointLight.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })));
    pointLight.position.set(pos.lightPosX, pos.lightPosY, pos.lightPosZ);
    world.lights.push(pointLight);
}));

var groundTexture = THREE.ImageUtils.loadTexture("tex/checker.png"); //grasslight-big.jpg
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
//groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(50, 50);
groundTexture.anisotropy = 32;
var groundMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, specular: 0x000000, map: groundTexture });
ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), groundMaterial);
ground.rotation.x = - Math.PI / 2;
ground.position.y = -22;

world.environment.push(ground);