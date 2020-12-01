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

function initControls(camera, cameraPerspective, renderer, world) {
    const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    orbitControls.dampingFactor = 0.15;
    orbitControls.screenSpacePanning = false;
    orbitControls.minDistance = 50;
    orbitControls.maxDistance = 500;
    orbitControls.maxPolarAngle = Math.PI / 2;

    const dragControls = new THREE.DragControls(world.lenses, cameraPerspective, renderer.domElement);
    dragControls.addEventListener('dragstart', function () { orbitControls.enabled = false; });
    dragControls.addEventListener('dragend', function () { orbitControls.enabled = true; });
    return [orbitControls, dragControls];
}


function refreshLensShaders(obj) {
    cfg.lensesOptions[obj.idx].lensPosition.x = obj.position.x;
    cfg.lensesOptions[obj.idx].lensPosition.y = obj.position.y;
    const config = cfg.lensesOptions[obj.idx];
    obj.material.uniforms.lensRadius1.value = (config.lensRadius1Neg ? -1.0 : 1.0) * config.lensRadius1;
    obj.material.uniforms.lensRadius2.value = (config.lensRadius2Neg ? -1.0 : 1.0) * config.lensRadius2;
    obj.material.uniforms.lensDiameter.value = config.lensDiameter;
    obj.material.uniforms.lensWidth.value = config.lensWidth;
    obj.material.uniforms.lensPosition.value.copy(obj.position);
    obj.material.uniforms.lensPosition.value.z = -obj.position.z;

    obj.material.needsUpdate = true;
}

function updateDragControls(orbitControls, cameraPerspective, renderer, world) {
    dragControls.dispose();
    dragControls = new THREE.DragControls(world.lenses, cameraPerspective, renderer.domElement);
    dragControls.addEventListener('dragstart', function (event) {
        orbitControls.enabled = false;
    });
    dragControls.addEventListener('dragend', function (event) {
        orbitControls.enabled = true;
    });
    dragControls.addEventListener('drag', function (event) {
        refreshLensShaders(event.object);
    });
}


function makePhongControls(gui, obj, objstr) {
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


function updateMagnify(gui, lens, value, lensId, maxId) {
    refreshLensShaders(lens);
    lens.scale.set(cfg.lensesOptions[lensId].lensDiameter, cfg.lensesOptions[lensId].lensDiameter);
    lens.position.x = cfg.lensesOptions[lensId].lensPosition.x;
    lens.position.y = cfg.lensesOptions[lensId].lensPosition.y;
    lens.position.z = -cfg.lensesOptions[lensId].lensPosition.z;
}

function setDistanceBound(gui, lens, value, lensId, maxId) {
    // Set max of previous
    if (lensId > 0) { gui.__folders[`Lens ${lensId - 1}`].__controllers[6].__max = value - 1; }
    // Set min of next
    if (lensId < maxId) { gui.__folders[`Lens ${lensId + 1}`].__controllers[6].__min = value + 1; }
}

function setRadiusBound(gui, lens, value, lensId, maxId) {
    // Set max of distance
    gui.__folders[`Lens ${lensId}`].__controllers[5].__max = Math.min(Math.min(gui.__folders[`Lens ${lensId}`].__controllers[0].getValue(), gui.__folders[`Lens ${lensId}`].__controllers[2].getValue()) / 2.0, 10);
}

function setDiameterBound(gui, lens, value, lensId, maxId) {
    // Set min of radius1 and 2
    gui.__folders[`Lens ${lensId}`].__controllers[0].__min = value * 2;
    gui.__folders[`Lens ${lensId}`].__controllers[2].__min = value * 2;
}

function makeLensControls(gui, cfg, lens, lensId, maxId) {
    var gLens = gui.addFolder(`Lens ${lensId}`);
    gLens.add(cfg.lensesOptions[lensId], 'lensRadius1').min(100.0).max(2000.0).step(5.0).name('Radius 1').listen().onChange(function (value) {
        updateMagnify(gui, lens, value, lensId, maxId);
        setRadiusBound(gui, lens, value, lensId, maxId);
    });
    gLens.add(cfg.lensesOptions[lensId], 'lensRadius1Neg').name('R1 Concave').listen().onChange(function (value) {
        refreshLensShaders(lens);
    });
    gLens.add(cfg.lensesOptions[lensId], 'lensRadius2').min(100.0).max(2000.0).step(5.0).name('Radius 2').listen().onChange(function (value) {
        updateMagnify(gui, lens, value, lensId, maxId);
        setRadiusBound(gui, lens, value, lensId, maxId);
    });
    gLens.add(cfg.lensesOptions[lensId], 'lensRadius2Neg').name('R2 Concave').listen().onChange(function (value) {
        refreshLensShaders(lens);
    });
    gLens.add(cfg.lensesOptions[lensId], 'lensWidth').min(0.0).max(1.0).step(0.05).name('Width').listen().onChange(function (value) { updateMagnify(gui, lens, value, lensId, maxId); });
    gLens.add(cfg.lensesOptions[lensId], 'lensDiameter').min(1.0).max(10.0).step(0.05).name('Diameter').listen().onChange(function (value) {
        updateMagnify(gui, lens, value, lensId, maxId);
        setDiameterBound(gui, lens, value, lensId, maxId);
    });
    let minD = 1.0;
    let maxD = 60.0;
    if (lensId > 0) minD = cfg.lensesOptions[lensId - 1].lensPosition.z;
    if (lensId < maxId) maxD = cfg.lensesOptions[lensId + 1].lensPosition.z;
    gLens.add(cfg.lensesOptions[lensId].lensPosition, 'z').min(minD).max(maxD).step(1.0).name('Distance').listen().onChange(function (value) {
        updateMagnify(gui, lens, value, lensId, maxId);
        setDistanceBound(gui, lens, value, lensId, maxId);
    });

}

function makeLightControls(gui, cfg, light, lightId) {
    var gLight = gui.addFolder(`Light ${lightId}`);
    gLight.add(cfg.lightPos[lightId], 'lightPosX').min(-60.0).max(60.0).step(1.0).name('X Coordinate').listen().onChange(function (value) {
        light.position.set(cfg.lightPos[lightId].lightPosX, cfg.lightPos[lightId].lightPosY, cfg.lightPos[lightId].lightPosZ);
    });
    gLight.add(cfg.lightPos[lightId], 'lightPosY').min(-60.0).max(60.0).step(1.0).name('Y Coordinate').listen().onChange(function (value) {
        light.position.set(cfg.lightPos[lightId].lightPosX, cfg.lightPos[lightId].lightPosY, cfg.lightPos[lightId].lightPosZ);
    });
    gLight.add(cfg.lightPos[lightId], 'lightPosZ').min(-60.0).max(60.0).step(1.0).name('Z Coordinate').listen().onChange(function (value) {
        light.position.set(cfg.lightPos[lightId].lightPosX, cfg.lightPos[lightId].lightPosY, cfg.lightPos[lightId].lightPosZ);
    });
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

dat.GUI.prototype.removeFolder = function (name) {
    var folder = this.__folders[name];
    if (!folder) {
        return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
}

function reloadLensGui(gui, cfg, world) {
    for (const [key, value] of Object.entries(gui.__folders['Lens'].__folders)) {
        gui.__folders['Lens'].removeFolder(key);
    }
    world.lenses.forEach((lens, idx) => { makeLensControls(gui.__folders['Lens'], cfg, lens, idx, world.lenses.length - 1); });
}

function makeGui(cfg, world) {
    let gui = new dat.GUI();

    gui.add(cfg, 'about').name('Help & About');

    var gObject = gui.addFolder('Objects');
    world.objects.forEach(object => { makePhongControls(gObject, object, object.name); });

    var gMagnify = gui.addFolder('Lens');
    gMagnify.add({ func: function () { cfg.addLens(); reload(gui, cfg, world); } }, "func").name("Add Lens");
    gMagnify.add({ func: function () { cfg.removeLens(); reload(gui, cfg, world); } }, "func").name("Remove Lens");
    // world.lenses.forEach((lens, idx) => { makeLensControls(gMagnify, cfg, lens, idx, world.lenses.length - 1); });

    var gLight = gui.addFolder('Lights');
    world.lights.forEach((light, idx) => { makeLightControls(gLight, cfg, light, idx); });

    var gMesh = gui.addFolder('Mesh Options');
    gMesh.add(cfg, 'flatNormals').name('flat normals').listen().onChange(function (value) {
        world.objects.forEach(element => { refreshNormal(element); });
    });
    gMesh.add(cfg, 'wireframe').name('wireframe (w)').listen().onChange(function (value) { updateWireframe(value); });
    gMesh.add(cfg, 'fnVis').name('view fNormals').listen().onChange(function (value) {
    });
    gMesh.add(cfg, 'vnVis').name('view vNormals').listen().onChange(function (value) {
    });

    var gShaders = gui.addFolder('Shading Options');
    gShaders.add(cfg, 'shaderRoot', { gouraud: 'gouraud', phong: 'phong' }).name('shading mode').listen().onChange(function (value) {
        world.objects.forEach(element => {
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
    return gui;
}
