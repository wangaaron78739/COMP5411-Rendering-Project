function initControls(camera, cameraPerspective, renderer, world) {
    const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    orbitControls.dampingFactor = 0.15;
    orbitControls.screenSpacePanning = false;
    orbitControls.minDistance = 50;
    orbitControls.maxDistance = 200;
    orbitControls.maxPolarAngle = Math.PI / 2;

    const dragControls = new THREE.DragControls(world.lenses, cameraPerspective, renderer.domElement);
    dragControls.addEventListener('dragstart', function () { orbitControls.enabled = false; });
    dragControls.addEventListener('dragend', function () { orbitControls.enabled = true; });
    return [orbitControls, dragControls];
}


function refreshLensShaders(obj) {
    cfg.lensesOptions[obj.idx].lensPosition.x = obj.position.x;
    cfg.lensesOptions[obj.idx].lensPosition.y = obj.position.y;
    const lensRing = world.lensRings[obj.idx];
    lensRing.position.x = obj.position.x;
    lensRing.position.y = obj.position.y;
    lensRing.material.transparent = true;
    lensRing.material.opacity = cfg.lensBorder ? 1.0 : 0.0;
    lensRing.material.needsUpdate = true;

    const config = cfg.lensesOptions[obj.idx];
    obj.material.uniforms.lensRadius1.value = (config.convex ? -1.0 : 1.0) / config.lensRadius1;
    obj.material.uniforms.lensRadius2.value = (config.convex ? -1.0 : 1.0) / config.lensRadius2;
    obj.material.uniforms.lensDiameter.value = config.lensDiameter;
    obj.material.uniforms.lensWidth.value = config.lensWidth;
    obj.material.uniforms.chroma.value = config.chroma;

    let pos = obj.material.uniforms.lensPosition.value;
    pos = obj.getWorldPosition(pos);
    pos.project(cameraPerspective);

    let widthHalf = obj.material.uniforms.screen.value.x / 2;
    let heightHalf = obj.material.uniforms.screen.value.y / 2;

    pos.x = (pos.x * widthHalf) + widthHalf;
    pos.y = (pos.y * heightHalf) + heightHalf;

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
    const p = cfg.lensesOptions[lensId].lensPosition;
    lens.position.x = p.x;
    lens.position.y = p.y;
    lens.position.z = -p.z;

    world.lensRings[lensId].scale.set(cfg.lensesOptions[lensId].lensDiameter, cfg.lensesOptions[lensId].lensDiameter);
    world.lensRings[lensId].position.x = p.x;
    world.lensRings[lensId].position.y = p.y;
    world.lensRings[lensId].position.z = -p.z;
}

function makeLensControls(gui, cfg, lens, lensId, maxId) {
    var gLens = gui.addFolder(`Lens ${lensId}`);
    gLens.add(cfg.lensesOptions[lensId], 'lensRadius1').min(0.01).max(1.0).step(0.0001).name('Curvature 1').listen().onChange(function (value) {
        if (cfg.lensesOptions[lensId].sameRadius) {
            cfg.lensesOptions[lensId].lensRadius2 = cfg.lensesOptions[lensId].lensRadius1;
        }
        updateMagnify(gui, lens, value, lensId, maxId);
    });
    gLens.add(cfg.lensesOptions[lensId], 'lensRadius2').min(0.01).max(1.0).step(0.0001).name('Curvature 2').listen().onChange(function (value) {
        if (cfg.lensesOptions[lensId].sameRadius) {
            cfg.lensesOptions[lensId].lensRadius1 = cfg.lensesOptions[lensId].lensRadius2;
        }
        updateMagnify(gui, lens, value, lensId, maxId);
    });
    gLens.add(cfg.lensesOptions[lensId], 'convex').name('Convex').listen().onChange(function (value) {
        refreshLensShaders(lens);
    });
    gLens.add(cfg.lensesOptions[lensId], 'lensWidth').min(0.0).max(10.0).step(0.05).name('Width').listen().onChange(function (value) { updateMagnify(gui, lens, value, lensId, maxId); });
    gLens.add(cfg.lensesOptions[lensId], 'lensDiameter').min(1.0).max(10.0).step(0.05).name('Diameter').listen().onChange(function (value) {
        updateMagnify(gui, lens, value, lensId, maxId);
    });
    let minD = 1.0;
    let maxD = 60.0;
    if (lensId > 0) minD = cfg.lensesOptions[lensId - 1].lensPosition.z;
    if (lensId < maxId) maxD = cfg.lensesOptions[lensId + 1].lensPosition.z;
    gLens.add(cfg.lensesOptions[lensId].lensPosition, 'z').min(minD).max(maxD).step(0.001).name('Distance').listen().onChange(function (value) {
        updateMagnify(gui, lens, value, lensId, maxId);
    });
    gLens.add(cfg.lensesOptions[lensId], 'chroma').min(-10.).max(10.).step(0.001).name('Chroma').listen().onChange(function (value) {
        updateMagnify(gui, lens, value, lensId, maxId);
    });
    gLens.add(cfg.lensesOptions[lensId], 'sameRadius').name('Same Curvature').listen().onChange(function (value) {
        if (value) {
            cfg.lensesOptions[lensId].lensRadius2 = cfg.lensesOptions[lensId].lensRadius1;
        }
        refreshLensShaders(lens);
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

    gui.add(cfg, 'about').name('About');

    var gObject = gui.addFolder('Objects');
    world.objects.forEach(object => { makePhongControls(gObject, object, object.name); });

    var gLight = gui.addFolder('Lights');
    world.lights.forEach((light, idx) => { makeLightControls(gLight, cfg, light, idx); });

    var gMagnify = gui.addFolder('Lens');
    gMagnify.add({ func: function () { cfg.addLens(); reload(gui, cfg, world); } }, "func").name("Add Lens");
    gMagnify.add({ func: function () { cfg.removeLens(); reload(gui, cfg, world); } }, "func").name("Remove Lens");

    gui.add(cfg, 'lensBorder').name('Draw Lens Border').listen().onChange(function (value) {
        refreshAllLenses(world);
    });

    gui.close();
    return gui;
}
