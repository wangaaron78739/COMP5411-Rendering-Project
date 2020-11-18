var cfg =
{
    shaderRoot: 'gouraud',
    flatNormals: true,
    wireframe: false,
    animate: false,
    fnvis: false,
    vnvis: false,
    shadervis: false,
    lightPosX: -20.0,
    lightPosY: 30.0,
    lightPosZ: -50.0,
    about: function () { }
};

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

function makeGui() {
    gui = new dat.GUI();

    gui.add(cfg, 'about').name('Help & About');

    // gBall = makePhongControls(ball, 'ball');
    // gKnot = makePhongControls(knot, 'knot');
    // gCone = makePhongControls(cone, 'cone');

    //light
    var gLight = gui.addFolder('point light');
    gLight.add(cfg, 'lightPosX').min(-60.0).max(60.0).step(1.0).name('lightX').listen().onChange(function (value) { updateLight(); });
    gLight.add(cfg, 'lightPosY').min(-60.0).max(60.0).step(1.0).name('lightY').listen().onChange(function (value) { updateLight(); });
    gLight.add(cfg, 'lightPosZ').min(-60.0).max(60.0).step(1.0).name('lightZ').listen().onChange(function (value) { updateLight(); });

    gui.add(cfg, 'shaderRoot', { gouraud: 'gourand', phong: 'phong', toon: 'toon', depth: 'depth' }).name('shading mode').listen().onChange(function (value) {
        refreshShaders(ball);
        refreshShaders(cone);
        refreshShaders(knot);
        if (cfg.shadervis) {
            document.getElementById('vstext').innerHTML = document.getElementById(cfg.shaderRoot + '-vs-glsl').textContent;
            document.getElementById('pstext').innerHTML = document.getElementById(cfg.shaderRoot + '-ps-glsl').textContent;
        }
    });

    gui.add(cfg, 'flatNormals').name('flat normals').listen().onChange(function (value) {
        refreshNormals(ball);
        refreshNormals(cone);
        refreshNormals(knot);
        ballvnhelper.update();
        conevnhelper.update();
        knotvnhelper.update();
    });

    gui.add(cfg, 'animate').name('animate (a)').listen();

    gui.add(cfg, 'wireframe').name('wireframe (w)').listen().onChange(function (value) { updateWireframe(value); });

    gui.add(cfg, 'fnvis').name('view fNormals').listen().onChange(function (value) {
        ballfnhelper.visible = value;
        conefnhelper.visible = value;
        knotfnhelper.visible = value;
    });

    gui.add(cfg, 'vnvis').name('view vNormals').listen().onChange(function (value) {
        ballvnhelper.visible = value;
        conevnhelper.visible = value;
        knotvnhelper.visible = value;
    });

    gui.add(cfg, 'shadervis').name('view shaders').listen().onChange(function (value) {
        var e = document.getElementById('splash');
        if (value == false)
            e.style.display = 'none';
        else {
            document.getElementById('vstext').innerHTML = document.getElementById(cfg.shaderRoot + '-vs-glsl').textContent;
            document.getElementById('pstext').innerHTML = document.getElementById(cfg.shaderRoot + '-ps-glsl').textContent;
            e.style.display = 'block';
        }
    });

    gui.close();
}