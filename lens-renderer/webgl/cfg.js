const defaultCfg = {
  //shaderOptions
  lensBorder: true,

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
    },
  ],

  lensesOptions: [],

  startingLensesNum: 1,

  about: function () {
    var e = document.getElementById("about");
    e.style.display = "block";
  },
  addLens: function () {
    let minD = this.lensesOptions.length
      ? this.lensesOptions[this.lensesOptions.length - 1].lensPosition.z + 1
      : 1;
    this.lensesOptions.push({
      lensPosition: new THREE.Vector3(
        0 * 10.0 - 5.0,
        0 * 10.0 - 5.0,
        Math.floor(1 * 10.0) + minD
      ),
      // lensPosition: new THREE.Vector3(Math.random() * 10.0 - 5.0, Math.random() * 10.0 - 5.0, Math.floor(Math.random() * 10.0) + minD),
      convex: false,
      lensRadius1: 0.2,
      lensRadius2: 0.2,
      chroma: 0,
      sameRadius: true,
      lensWidth: 0.5,
      lensDiameter: 10.0,
    });
  },

  removeLens: function () {
    this.lensesOptions.pop();
  },
};

function addLensesToWorld(cfg, world) {
  world.lenses = [];
  world.lensRings = [];
  cfg.lensesOptions.forEach((config, idx) => {
    const newPos = config.lensPosition.clone();
    newPos.z = -config.lensPosition.z;
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: null },
          lensRadius1: {
            value: (config.lensRadius1Neg ? -1.0 : 1.0) * config.lensRadius1,
          },
          lensRadius2: {
            value: (config.lensRadius1Neg ? -1.0 : 1.0) * config.lensRadius2,
          },
          lensDiameter: { value: config.lensDiameter },
          lensWidth: { value: config.lensWidth },
          chroma: { value: config.chroma },
          lensPosition: { value: newPos },
          screen: {
            value: new THREE.Vector2(
              window.innerWidth * window.devicePixelRatio,
              window.innerHeight * window.devicePixelRatio
            ),
          },
          eta: { value: [1.15, 1.17, 1.19, 1.21, 1.23, 1.25] },
        },
        lights: false,
        vertexShader: getShaderCustom("lens", "vs"),
        fragmentShader: getShaderCustom("lens", "ps"),
      })
    );
    const lensRing = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1, 64),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    lens.position.copy(newPos);
    lens.scale.set(config.lensDiameter, config.lensDiameter);
    lensRing.position.copy(newPos);
    lensRing.scale.set(config.lensDiameter, config.lensDiameter);
    lens.idx = idx;
    world.lenses.push(lens);
    world.lensRings.push(lensRing);
  });
}

function initConfig() {
  var world = {
    objects: [],
    lenses: [],
    lensRings: [],
    lights: [],
    environment: [],
  };
  var cfg = defaultCfg;
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 20),
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
          mKs: { type: "f", value: 0.8 },
        },
      ]),
      lights: true,
      vertexShader: getShaderCustom("phong", "vs"),
      fragmentShader: getShaderCustom("phong", "ps"),
    })
  );

  cube.name = "Cube";
  cube.matrixWorld.setPosition(new THREE.Vector3(0.0, 0.0, 0.0));
  cube.position.y = -12;

  world.objects.push(cube);

  world.objects.forEach((object) => object.geometry.computeFlatVertexNormals());

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(10, 20, 128),
    new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
          mAmbient: { type: "c", value: new THREE.Color(0xffff00) }, //0x00dd00, // should generally match color
          mDiffuse: { type: "c", value: new THREE.Color(0xffff00) }, //0x00dd00,
          mSpecular: { type: "c", value: new THREE.Color(0xffffff) },
          mShininess: { type: "f", value: 40.0 },
          mKa: { type: "f", value: 0.3 },
          mKd: { type: "f", value: 0.8 },
          mKs: { type: "f", value: 0.8 },
        },
      ]),
      lights: true,
      vertexShader: getShaderCustom("phong", "vs"),
      fragmentShader: getShaderCustom("phong", "ps"),
    })
  );

  cone.name = "Cone";
  cone.matrixWorld.setPosition(new THREE.Vector3(0.0, 0.0, 0.0));
  cone.position.y = 15.0;
  cone.position.x = 15.0;
  world.objects.push(cone);

  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 10, 20),
    new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib["lights"],
        {
          mAmbient: { type: "c", value: new THREE.Color(0xff0000) }, //0x00dd00, // should generally match color
          mDiffuse: { type: "c", value: new THREE.Color(0xff0000) }, //0x00dd00,
          mSpecular: { type: "c", value: new THREE.Color(0xffffff) },
          mShininess: { type: "f", value: 40.0 },
          mKa: { type: "f", value: 0.3 },
          mKd: { type: "f", value: 0.8 },
          mKs: { type: "f", value: 0.8 },
        },
      ]),
      lights: true,
      vertexShader: getShaderCustom("phong", "vs"),
      fragmentShader: getShaderCustom("phong", "ps"),
    })
  );

  cylinder.name = "Cylinder";
  cylinder.matrixWorld.setPosition(new THREE.Vector3(0.0, 0.0, 0.0));
  cylinder.position.y = 15.0;
  cylinder.position.x = -15.0;
  world.objects.push(cylinder);

  world.objects.forEach((object) => object.geometry.computeFlatVertexNormals());

  cfg.lightPos.forEach((pos) => {
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      )
    );
    pointLight.position.set(pos.lightPosX, pos.lightPosY, pos.lightPosZ);
    world.lights.push(pointLight);
  });

  const groundTexture = THREE.TextureLoader.load(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAY0AAAGNCAYAAADtpy3RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAGYktHRAD/AP8A/6C9p5MAAAAhdEVYdENyZWF0aW9uIFRpbWUAMjAxOTowNToxNiAyMjozNTo1OOwpg4oAAAXJSURBVHhe7dcxjsMwDABBM///s+Lg3N92ZjEDCGIvEAvNdV3nPixxjufYZOa3ImxhP973eW4A+JdoAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgDZnNszs8DMPBMbWI9d7Mf7/DQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMhEA4BMNADIRAOATDQAyEQDgEw0AMjmPudvZINzPMcmM78VYQv78T4/DQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0AMtEAIBMNADLRACATDQAy0QAgEw0Asjm3Z2aBmXkmNrAeu9iP9/lpAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGAJloAJCJBgCZaACQiQYAmWgAkIkGANF1fQGOvh8Nrm+KyQAAAABJRU5ErkJggggQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACJhzzn19BL/u9RybzMzrE/iwj13sYxc/dAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAgQdAAIEHQACBB0AAj4DzNIKuFuCZ7dAAAAAElFTkSuQmCC"
  );
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(50, 50);
  groundTexture.anisotropy = 32;
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x333333,
    specular: 0x000000,
    map: groundTexture,
    side: THREE.DoubleSide,
  });
  ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2000, 2000),
    groundMaterial
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -20;

  world.environment.push(ground);
  for (let [x, y, z] of [
    [1, 1, 0],
    [-1, 1, 0],
    [0, 0, -1],
    [0, 0, 1],
  ]) {
    console.log(x, y);
    const wall = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      groundMaterial
    );
    wall.rotation.y = (Math.PI / 2) * y;
    wall.position.x = -200 * x;
    wall.position.z = -200 * z;

    world.environment.push(wall);
  }

  for (let i = 0; i < cfg.startingLensesNum; i++) {
    cfg.addLens();
  }

  return [cfg, world];
}

function getSourceSynch(url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return req.status == 200 ? req.responseText : null;
}

function getShaderCustom(name, ty) {
  return getSourceSynch(document.getElementById(`${name}-${ty}-glsl`).src);
  // return document.getElementById(`${name}-${ty}-glsl`).textContent;
}
