var objects = [];
var lens = [];
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
    lightPosX: -20.0,
    lightPosY: 30.0,
    lightPosZ: -50.0,

    //magnifyOptions
    focalLength: 1.0,
    diameter: 2.0,

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

objects.push(cube);
objects.forEach(object => object.geometry.computeFlatVertexNormals());


var pointLight = new THREE.PointLight(0xffffff);
pointLight.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })));
pointLight.position.set(cfg.lightPosX, cfg.lightPosY, cfg.lightPosZ);

