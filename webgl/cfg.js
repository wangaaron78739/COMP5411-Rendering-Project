const defaultCfg =
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

    lensesOptions: [],

    startingLensesNum: 1,

    about: function () {
        var e = document.getElementById('about');
        e.style.display = 'block';
    },
    addLens: function () {
        let minD = this.lensesOptions.length ? (this.lensesOptions[this.lensesOptions.length - 1].lensPosition.z + 1) : 1;
        this.lensesOptions.push({
            lensPosition: new THREE.Vector3(Math.random() * 10.0 - 5.0, Math.random() * 10.0 - 5.0, - Math.floor(Math.random() * 10.0) + minD),
            lensRadius1: 1000.0,
            lensRadius2: 1000.0,
            lensWidth: 0.5,
            lensDiameter: 1.0,
        });
    },

    removeLens: function () {
        this.lensesOptions.pop();
    }
};


function addLensesToWorld(cfg, world) {
    world.lenses.forEach(lens => delete lens);
    world.lenses = [];
    cfg.lensesOptions.forEach((config, idx) => {
        const lens = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.ShaderMaterial({
            uniforms: {
                lensRadius1: { value: config.lensRadius1 },
                lensRadius2: { value: config.lensRadius2 },
                lensDiameter: { value: config.lensDiameter },
                lensWidth: { value: config.lensWidth },
                lensPosition: { value: config.lensPosition },
                screen: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                eta: { value: [1.15, 1.17, 1.19, 1.21, 1.23, 1.25] }
            },
            lights: false,
            vertexShader: getShaderCustom('lens', 'vs'),
            fragmentShader: getShaderCustom('lens', 'ps'),
        }));
        lens.position.set(config.lensPosition.x, config.lensPosition.y, config.lensPosition.z);
        lens.scale.set(config.lensDiameter, config.lensDiameter);
        lens.idx = idx;
        world.lenses.push(lens);
    });
}

function initConfig() {
    var world = {
        objects: [],
        lenses: [],
        lights: [],
        environment: [],
    };
    var cfg = defaultCfg;
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

    const groundTexture = THREE.ImageUtils.loadTexture("tex/checker.png");
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50, 50);
    groundTexture.anisotropy = 32;
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x333333, specular: 0x000000, map: groundTexture });
    ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), groundMaterial);
    ground.rotation.x = - Math.PI / 2;
    ground.position.y = -22;

    world.environment.push(ground);

    for (let i = 0; i < cfg.startingLensesNum; i++) {
        cfg.addLens();
    }

    return [cfg, world];
}

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