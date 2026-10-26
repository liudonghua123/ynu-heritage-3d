import * as THREE from 'three';
import {
  meshBox, cylinderBetween, createBuilding, createRoof, createCourtyardWall,
  createTree, createLantern, createStoneBridge, createStairway, createClockTower
} from './architecture.js';

function addBuilding(scene, materials, options) {
  const building = createBuilding(materials, options);
  scene.add(building);
  return building;
}

function addWall(scene, materials, width, x, z, rotation = 0, height = 2.2) {
  const wall = createCourtyardWall(materials, width, height);
  wall.position.set(x, 0, z);
  wall.rotation.y = rotation;
  scene.add(wall);
  return wall;
}

function addTree(scene, trees, materials, x, z, scale = 1, seed = 0, kind = 'green') {
  const tree = createTree(materials, scale, seed, kind);
  tree.position.set(x, 0, z);
  scene.add(tree);
  trees.push(tree);
  return tree;
}

// 会泽院前的大草坪与银杏道
function createLawn(scene, materials, trees) {
  const lawn = new THREE.Group();
  lawn.add(meshBox(26, .14, 20, materials.grass, 0, .03, 0));
  // 草坪中央的喷泉小池
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, .5, 24), materials.stone);
  pool.position.y = .25;
  lawn.add(pool);
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.9, 24), materials.water);
  water.rotation.x = -Math.PI / 2;
  water.position.y = .48;
  lawn.add(water);
  scene.add(lawn);
}

// 翠湖一角：水面、石桥、垂柳式绿树
function createLake(scene, materials, trees, boats) {
  const lake = new THREE.Group();
  lake.position.set(34, 0, 26);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(34, 22), materials.water);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -.05;
  water.receiveShadow = true;
  lake.add(water);
  for (const z of [-11.2, 11.2]) {
    lake.add(meshBox(35, 1.2, .7, materials.stone, 0, -.15, z));
    lake.add(meshBox(35, .18, .9, materials.plasterDark, 0, .5, z));
  }
  scene.add(lake);

  const bridge = createStoneBridge(materials, 3.2, 15);
  bridge.position.set(34, 0, 26);
  scene.add(bridge);

  boats.push({ x: 27, z: 30, rotation: .12 });
  boats.push({ x: 42, z: 22, rotation: -.1 });
}

export function createExterior(materials) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c8d6cf');
  scene.fog = new THREE.Fog('#c8d6cf', 70, 150);
  const trees = [];
  const lanterns = [];
  const entranceMeshes = [];
  const boatAnchors = [];

  const ground = meshBox(130, .5, 100, materials.grass, 0, -.35, 0);
  ground.castShadow = false;
  scene.add(ground);

  // 主轴线：云大中路（南北向石板路）
  const mainRoad = meshBox(8.4, .15, 108, materials.stone, 0, -.01, -4);
  mainRoad.castShadow = false;
  scene.add(mainRoad);
  for (const x of [-4.35, 4.35]) {
    scene.add(meshBox(.25, .22, 108, materials.plasterDark, x, .06, -4));
  }
  // 东西向横路
  for (const z of [-26, 14]) {
    const lane = meshBox(96, .12, 5.4, materials.stone, 0, -.02, z);
    lane.castShadow = false;
    scene.add(lane);
  }

  // ============ 会泽院（地标 01，主楼） ============
  const huize = addBuilding(scene, materials, {
    width: 24, depth: 12, height: 5.4, x: 0, z: -22, sign: '會澤院',
    windows: 5, roofRise: 1.6, base: .9, style: 'huize'
  });
  // 会泽院月台与大台阶
  scene.add(meshBox(30, .5, 6.5, materials.stone, 0, .25, -14.8));
  const stairs = createStairway(materials, 12, 6, .22);
  stairs.position.set(0, .5, -11.2);
  scene.add(stairs);

  // ============ 至公堂（地标 03，可入内） ============
  const zhigong = addBuilding(scene, materials, {
    width: 20, depth: 10, height: 5, x: -28, z: 8, sign: '至公堂',
    windows: 3, roofRise: 2.2, base: .7, style: 'red', sideWindows: false
  });
  const zhigongEntrance = zhigong.userData.entrance;
  zhigongEntrance.userData.action = 'enterInterior';
  zhigongEntrance.userData.landmark = 'zhigong';
  entranceMeshes.push(zhigongEntrance);
  scene.add(meshBox(22, .45, 3.6, materials.stone, -28, .2, 14.2));

  // ============ 映秋院（地标 04） ============
  const yingqiu = addBuilding(scene, materials, {
    width: 16, depth: 9, height: 4.4, x: 28, z: 6, sign: '映秋院',
    windows: 3, roofRise: 1.9, base: .55, style: 'red'
  });

  // ============ 贡院考棚遗风（两侧红墙长廊） ============
  addWall(scene, materials, 18, -14, 8, 0, 2);
  addWall(scene, materials, 16, 12, 8, 0, 2);
  addWall(scene, materials, 14, -40, -4, Math.PI / 2, 2.2);
  addWall(scene, materials, 14, 40, -6, Math.PI / 2, 2.2);

  // 会泽院两翼
  addBuilding(scene, materials, { width: 10, depth: 7, height: 4, x: -18, z: -24, windows: 2, roofRise: 1.6, base: .6 });
  addBuilding(scene, materials, { width: 10, depth: 7, height: 4, x: 18, z: -24, windows: 2, roofRise: 1.6, base: .6 });

  // ============ 校门（地标 02 起点） ============
  const gate = new THREE.Group();
  gate.position.set(0, 0, 46);
  for (const x of [-5.6, 5.6]) {
    gate.add(meshBox(1.3, 5.4, 1.3, materials.redWall, x, 2.7, 0));
    gate.add(meshBox(1.5, .45, 1.5, materials.stone, x, .22, 0));
  }
  gate.add(meshBox(.7, .7, 12.5, materials.darkWood, 0, 5.1, 0));
  const gateRoof = createRoof(materials, 12.5, 2.2, .95);
  gateRoof.rotation.y = Math.PI / 2;
  gateRoof.position.y = 5.5;
  gate.add(gateRoof);
  const gatePlaque = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.05), materials.sign('雲南大學'));
  gatePlaque.rotation.y = Math.PI / 2;
  gatePlaque.position.set(.42, 4.9, 0);
  gate.add(gatePlaque);
  scene.add(gate);
  scene.add(meshBox(14, .3, 3, materials.stone, 0, .1, 42.5));

  // ============ 银杏道（校门至会泽院两侧） ============
  for (const x of [-8.5, 8.5]) {
    for (let i = 0; i < 5; i++) {
      addTree(scene, trees, materials, x, 38 - i * 9, .85 + (i % 2) * .25, i * 3 + (x > 0 ? 1 : 0), 'ginkgo');
    }
  }
  // 银杏道灯柱与灯笼
  for (const x of [-6.6, 6.6]) {
    for (const z of [34, 20, 4]) {
      const lantern = createLantern(materials, .8);
      lantern.position.set(x, 3.6, z);
      scene.add(lantern);
      scene.add(cylinderBetween([x, 0, z], [x, 3, z], .07, materials.darkWood, 6));
      lanterns.push(lantern);
    }
  }

  // 大草坪（会泽院前）
  const lawn = new THREE.Group();
  lawn.position.set(0, 0, -2);
  createLawn(scene, materials, trees);
  lawn.position.set(0, 0, 0);
  // 实际放在 z=-2 附近
  scene.children[scene.children.length - 1].position.set(0, 0, -2);

  // ============ 翠湖一角 ============
  createLake(scene, materials, trees, boatAnchors);

  // ============ 钟楼 ============
  const clockTower = createClockTower(materials);
  clockTower.position.set(-44, 0, 24);
  scene.add(clockTower);

  // 周边院落与树木
  addBuilding(scene, materials, { width: 12, depth: 7, height: 3.9, x: -46, z: -22, windows: 2, roofRise: 1.6 });
  addBuilding(scene, materials, { width: 13, depth: 7, height: 4, x: 46, z: -24, windows: 3, rotation: Math.PI, roofRise: 1.7 });
  addBuilding(scene, materials, { width: 12, depth: 7, height: 3.8, x: -50, z: 40, windows: 2, rotation: Math.PI, roofRise: 1.6 });
  addBuilding(scene, materials, { width: 13, depth: 7, height: 4, x: 50, z: 44, windows: 2, rotation: Math.PI, roofRise: 1.7 });

  [
    [-24, -34, 1.1], [-38, -36, 1.2], [-12, -36, 1], [12, -36, .95], [26, -34, 1.15],
    [40, -34, 1.1], [-22, 20, .9], [-36, 26, 1.05], [-18, 32, 1.1], [16, 22, .85],
    [22, 30, .95], [46, 8, .9], [-46, 12, 1], [-52, 30, 1.1], [54, 30, 1],
    [-8, 20, .8], [8, 26, .85], [-30, -8, 1.05], [30, -10, .95], [-56, -6, 1.1],
    [56, -8, 1.05], [14, 40, .9], [-14, 42, .85]
  ].forEach(([x, z, scale], index) => addTree(scene, trees, materials, x, z, scale, index));

  // 灯光
  const hemi = new THREE.HemisphereLight('#e7eee3', '#5a5848', 2.2);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1d4', 3.1);
  sun.position.set(-35, 58, 28);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -75; sun.shadow.camera.right = 75;
  sun.shadow.camera.top = 62; sun.shadow.camera.bottom = -62;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 160;
  sun.shadow.bias = -.00025;
  sun.shadow.normalBias = .035;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#c5d8d0', .55);
  fill.position.set(30, 20, -40);
  scene.add(fill);

  scene.userData.animate = time => {
    materials.water.map.offset.x = time * .006;
    materials.water.map.offset.y = Math.sin(time * .18) * .025;
    materials.water.bumpMap.offset.copy(materials.water.map.offset);
    lanterns.forEach((lantern, index) => { lantern.rotation.z = Math.sin(time * .7 + index) * .025; });
    trees.forEach((tree, index) => {
      tree.userData.canopy.rotation.z = Math.sin(time * .35 + index * .7) * .006;
    });
  };

  scene.userData.setTimeOfDay = mode => {
    const dusk = mode === 'dusk';
    scene.background.set(dusk ? '#77685f' : '#c8d6cf');
    scene.fog.color.set(dusk ? '#77685f' : '#c8d6cf');
    hemi.color.set(dusk ? '#b6a09a' : '#e7eee3');
    hemi.groundColor.set(dusk ? '#3c3835' : '#5a5848');
    hemi.intensity = dusk ? 1.25 : 2.2;
    sun.color.set(dusk ? '#ffb36b' : '#fff1d4');
    sun.intensity = dusk ? 2.25 : 3.1;
    sun.position.set(dusk ? -55 : -35, dusk ? 20 : 58, 28);
    fill.intensity = dusk ? .3 : .55;
    materials.red.emissiveIntensity = dusk ? 1.8 : .12;
    materials.water.color.set(dusk ? '#465b58' : '#527c6e');
  };

  scene.userData.entranceMeshes = entranceMeshes;
  scene.userData.landmarkBuildings = { huize, zhigong, yingqiu };
  return scene;
}
