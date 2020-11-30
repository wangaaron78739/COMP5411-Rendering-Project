
// focal length
// diameter
// reset
// wireframe, vertex normal
// 

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        cfg.wireframe = !cfg.wireframe;
        updateWireframe(cfg.wireframe);
    } else if (keyCode == 65) {
        cfg.animate = !cfg.animate;
    }
};

function updateWireframe(value) {
    ballwires.visible = value;
    conewires.visible = value;
    knotwires.visible = value;
}

function initControls() {
    // controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.15;
    controls.screenSpacePanning = false;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;
}


function makePhongControls(obj, objstr) {
    var gObj = gui.addFolder(objstr);
    gObj.add(obj.material.uniforms.mKa, 'value').min(0.0).max(2.0).step(0.01).name('Ka').listen();
    gObj.add(obj.material.uniforms.mKd, 'value').min(0.0).max(2.0).step(0.01).name('Kd').listen();
    gObj.add(obj.material.uniforms.mKs, 'value').min(0.0).max(2.0).step(0.01).name('Ks').listen();
    var dummy = {}; //needed due to incompatibility between dat.gui and 3js colors
    dummy['mAmbient'] = obj.material.uniforms.mAmbient.value.getStyle();
    gObj.addColor(dummy, 'mAmbient').name('ambient').listen().onChange(function (value) {
        obj.material.uniforms.mAmbient.value = new THREE.Color(value);
        obj.material.uniforms.mAmbient.needsUpdate = true;
    });
    dummy['mDiffuse'] = obj.material.uniforms.mDiffuse.value.getStyle();
    gObj.addColor(dummy, 'mDiffuse').name('diffuse').listen().onChange(function (value) {
        obj.material.uniforms.mDiffuse.value = new THREE.Color(value);
        obj.material.uniforms.mDiffuse.needsUpdate = true;
    });
    dummy['mSpecular'] = obj.material.uniforms.mSpecular.value.getStyle();
    gObj.addColor(dummy, 'mSpecular').name('specular').listen().onChange(function (value) {
        obj.material.uniforms.mSpecular.value = new THREE.Color(value);
        obj.material.uniforms.mSpecular.needsUpdate = true;
    });
    gObj.add(obj.material.uniforms.mShininess, 'value').min(3).max(100).step(1).name('shininess').listen();
    gObj.close();
    return gObj;
}

function refreshShaders(obj) {
    obj.material = new THREE.ShaderMaterial({
        uniforms: obj.material.uniforms,
        lights: true,
        vertexShader: getShader(cfg, 'vs'),
        fragmentShader: getShader(cfg, 'ps'),
    });
    obj.material.needsUpdate = true;
}

function refreshNormals(obj) {
    if (cfg.flatNormals)
        obj.geometry.computeFlatVertexNormals();
    else
        obj.geometry.computeVertexNormals();
}

function updateLight() {
    pointLight.position.set(cfg.lightPosX, cfg.lightPosY, cfg.lightPosZ);
}

function updateMagnify() {
    //TODO:
}

function makeGui(objects, lenses) {
    gui = new dat.GUI();

    gui.add(cfg, 'about').name('Help & About');

    //TODO:
    // gBall = makePhongControls(ball, 'ball');
    // gKnot = makePhongControls(knot, 'knot');
    // gCone = makePhongControls(cone, 'cone');

    var gLight = gui.addFolder('Point Light');
    gLight.add(cfg, 'lightPosX').min(-60.0).max(60.0).step(1.0).name('lightX').listen().onChange(function (value) { updateLight(); });
    gLight.add(cfg, 'lightPosY').min(-60.0).max(60.0).step(1.0).name('lightY').listen().onChange(function (value) { updateLight(); });
    gLight.add(cfg, 'lightPosZ').min(-60.0).max(60.0).step(1.0).name('lightZ').listen().onChange(function (value) { updateLight(); });

    var gMagnify = gui.addFolder('Magnifying Lens Options');
    gMagnify.add(cfg, 'focalLength').min(-60.0).max(60.0).step(1.0).name('Focal Length').listen().onChange(function (value) { updateMagnify(); });
    gMagnify.add(cfg, 'diameter').min(-60.0).max(60.0).step(1.0).name('Diameter').listen().onChange(function (value) { updateMagnify(); });


    var gMesh = gui.addFolder('Mesh Options');
    gMesh.add(cfg, 'flatNormals').name('flat normals').listen().onChange(function (value) {
        objects.forEach(element => {
            refreshNormal(element);

        });
        // ballvnhelper.update();
        // conevnhelper.update();
        // knotvnhelper.update();
    });
    gMesh.add(cfg, 'wireframe').name('wireframe (w)').listen().onChange(function (value) { updateWireframe(value); });
    gMesh.add(cfg, 'fnVis').name('view fNormals').listen().onChange(function (value) {
        // ballfnhelper.visible = value;
        // conefnhelper.visible = value;
        // knotfnhelper.visible = value;
    });
    gMesh.add(cfg, 'vnVis').name('view vNormals').listen().onChange(function (value) {
        // ballvnhelper.visible = value;
        // conevnhelper.visible = value;
        // knotvnhelper.visible = value;
    });

    var gShaders = gui.addFolder('Shading Options');
    gShaders.add(cfg, 'shaderRoot', { gouraud: 'gouraud', phong: 'phong' }).name('shading mode').listen().onChange(function (value) {
        objects.forEach(element => {
            refreshShaders(element);
        });
        if (cfg.shaderVis) {
            document.getElementById('vstext').innerHTML = document.getElementById(cfg.shaderRoot + '-vs-glsl').textContent;
            document.getElementById('pstext').innerHTML = document.getElementById(cfg.shaderRoot + '-ps-glsl').textContent;
        }
    });
    gShaders.add(cfg, 'shaderVis').name('view shaders').listen().onChange(function (value) {
        var e = document.getElementById('splash');
        if (value == false)
            e.style.display = 'none';
        else {
            document.getElementById('vstext').innerHTML = document.getElementById(cfg.shaderRoot + '-vs-glsl').textContent;
            document.getElementById('pstext').innerHTML = document.getElementById(cfg.shaderRoot + '-ps-glsl').textContent;
            e.style.display = 'block';
        }
    });

    gui.add(cfg, 'animate').name('animate (a)').listen();

    gui.close();
}