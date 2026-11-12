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

// 会泽院前的大草坪（龙门道两侧）
function createLawn(scene, materials, trees) {
  const lawn = new THREE.Group();
  lawn.add(meshBox(20, .14, 16, materials.grass, 0, .03, 0));
  scene.add(lawn);
}

// 翠湖一角（校园南面、正门外）：水面、石桥、垂柳式绿树
function createLake(scene, materials, trees, boats) {
  const lake = new THREE.Group();
  lake.position.set(0, 0, 66);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(52, 26), materials.water);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -.05;
  water.receiveShadow = true;
  lake.add(water);
  for (const z of [-13.2, 13.2]) {
    lake.add(meshBox(53, 1.2, .7, materials.stone, 0, -.15, z));
    lake.add(meshBox(53, .18, .9, materials.plasterDark, 0, .5, z));
  }
  scene.add(lake);

  // 南门外主干道延伸过湖堤的石桥
  const bridge = createStoneBridge(materials, 3.6, 18);
  bridge.position.set(0, 0, 66);
  scene.add(bridge);

  boats.push({ x: -12, z: 70, rotation: .12 });
  boats.push({ x: 14, z: 62, rotation: -.1 });
}

export function createExterior(materials) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c8d6cf');
  scene.fog = new THREE.Fog('#c8d6cf', 80, 170);
  const trees = [];
  const lanterns = [];
  const entranceMeshes = [];
  const boatAnchors = [];

  const ground = meshBox(150, .5, 150, materials.grass, 0, -.35, 20);
  ground.castShadow = false;
  scene.add(ground);

  // 主轴线：云大中路（南北向石板路，南门 z=+48 → 会泽院 z=0 → 至公堂 z=-24）
  const mainRoad = meshBox(8.4, .15, 112, materials.stone, 0, -.01, -2);
  mainRoad.castShadow = false;
  scene.add(mainRoad);
  for (const x of [-4.35, 4.35]) {
    scene.add(meshBox(.25, .22, 112, materials.plasterDark, x, .06, -2));
  }
  // 南门外延路（通向翠湖）
  scene.add(meshBox(6, .12, 20, materials.stone, 0, -.02, 55));
  // 东西向横路（映秋院 / 泽清堂一排）
  for (const z of [-22, 4]) {
    const lane = meshBox(96, .12, 5.4, materials.stone, 0, -.02, z);
    lane.castShadow = false;
    scene.add(lane);
  }
  // 至公堂后短横路（通怀周楼）
  scene.add(meshBox(40, .12, 4.6, materials.stone, 0, -.02, -33));

  // ============ 会泽院（地标 01，主楼，坐北朝南，居贡院中轴） ============
  const huize = addBuilding(scene, materials, {
    width: 24, depth: 12, height: 5.4, x: 0, z: 0, sign: '會澤院',
    windows: 5, roofRise: 1.6, base: .9, style: 'huize'
  });
  // 会泽院月台与"九十五级"龙门道台阶
  scene.add(meshBox(30, .5, 6.5, materials.stone, 0, .25, 7.2));
  const stairs = createStairway(materials, 12, 6, .22);
  stairs.position.set(0, .5, 10.8);
  scene.add(stairs);
  // 九五台阶中段平台的西式喷水池（真实位置）
  const fountainBase = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, .5, 24), materials.stone);
  fountainBase.position.set(-9.5, .25, 9);
  scene.add(fountainBase);
  const fountainWater = new THREE.Mesh(new THREE.CircleGeometry(1.9, 24), materials.water);
  fountainWater.rotation.x = -Math.PI / 2;
  fountainWater.position.set(-9.5, .48, 9);
  scene.add(fountainWater);
  // 龙门道石牌坊意象
  const paifang = new THREE.Group();
  paifang.position.set(0, 0, 15.5);
  for (const x of [-4.2, 4.2]) {
    paifang.add(meshBox(.9, 4.6, .9, materials.stone, x, 2.3, 0));
  }
  paifang.add(meshBox(10.5, .8, 1.1, materials.stone, 0, 4.7, 0));
  paifang.add(meshBox(.7, .55, 1.2, materials.redWall, 0, 5.35, 0));
  scene.add(paifang);

  // ============ 至公堂（地标 03，可入内；贡院中轴，会泽院之北） ============
  const zhigong = addBuilding(scene, materials, {
    width: 20, depth: 10, height: 5, x: 0, z: -24, sign: '至公堂',
    windows: 3, roofRise: 2.2, base: .7, style: 'red', sideWindows: false
  });
  const zhigongEntrance = zhigong.userData.entrance;
  zhigongEntrance.userData.action = 'enterInterior';
  zhigongEntrance.userData.landmark = 'zhigong';
  entranceMeshes.push(zhigongEntrance);
  scene.add(meshBox(22, .45, 3.6, materials.stone, 0, .2, -17.6));

  // ============ 革命烈士纪念碑（中轴，会泽院与至公堂之间） ============
  const monument = new THREE.Group();
  monument.position.set(0, 0, -12.5);
  monument.add(meshBox(3.4, .5, 3.4, materials.stone, 0, .25, 0));
  monument.add(meshBox(1.15, 4.2, .8, materials.stone, 0, 2.35, 0));
  monument.add(meshBox(1.5, .45, 1.05, materials.stone, 0, 4.6, 0));
  const monumentPlaque = new THREE.Mesh(new THREE.PlaneGeometry(.95, 2.6), materials.sign('英烈'));
  monumentPlaque.position.set(0, 2.5, .42);
  monument.add(monumentPlaque);
  scene.add(monument);

  // ============ 中轴东侧：熊庆来李广田故居（红墙小院） ============
  addBuilding(scene, materials, {
    width: 13, depth: 8, height: 4, x: 21, z: -12, sign: '故居',
    windows: 2, roofRise: 1.7, base: .55, style: 'red'
  });
  addWall(scene, materials, 12, 21, -6.5, 0, 1.9);
  // 东号舍（贡院考棚遗风，红墙长廊）
  addWall(scene, materials, 20, 30, -24, Math.PI / 2, 2.2);

  // ============ 中轴西侧：映秋院（与至公堂几乎同排，梁思成林徽因设计） ============
  const yingqiu = addBuilding(scene, materials, {
    width: 16, depth: 9, height: 4.4, x: -26, z: -22, sign: '映秋院',
    windows: 3, roofRise: 1.9, base: .55, style: 'red'
  });
  // 映秋院月台
  scene.add(meshBox(18, .45, 3.2, materials.stone, -26, .2, -16.6));
  // 泽清堂（映秋院东北侧，卢汉夫人龙泽清捐建，女生食堂）
  addBuilding(scene, materials, {
    width: 13, depth: 8, height: 4.1, x: -15, z: -33, sign: '澤清堂',
    windows: 2, roofRise: 1.7, base: .55, style: 'red'
  });
  // 风节亭（贡院旧迹，映秋院与泽清堂之间）
  const pavilion = new THREE.Group();
  pavilion.position.set(-25, 0, -34);
  for (const [px, pz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) {
    pavilion.add(cylinderBetween([px, 0, pz], [px, 2.6, pz], .14, materials.redWall, 6));
  }
  pavilion.add(meshBox(4.6, .3, 4.6, materials.stone, 0, .15, 0));
  const pavilionRoof = createRoof(materials, 5.2, 1.5, .6);
  pavilionRoof.position.y = 2.6;
  pavilion.add(pavilionRoof);
  scene.add(pavilion);

  // ============ 钟楼（1955 水塔兼钟楼，会泽院西北） ============
  const clockTower = createClockTower(materials);
  clockTower.position.set(-40, 0, -9);
  scene.add(clockTower);
  // 云南第一天文点（钟楼与文津楼之间）
  const astroPoint = new THREE.Group();
  astroPoint.position.set(-45, 0, -8);
  astroPoint.add(meshBox(3.2, .55, 3.2, materials.stone, 0, .27, 0));
  astroPoint.add(meshBox(1.5, 1.15, 1.5, materials.stone, 0, .95, 0));
  scene.add(astroPoint);
  // 文津楼意象（天文点紧靠文津楼）
  addBuilding(scene, materials, {
    width: 12, depth: 8, height: 4.2, x: -52, z: -9, sign: '文津樓',
    windows: 3, roofRise: 1.5, base: .5
  });

  // ============ 怀周楼（中轴最北端，至公堂之后） ============
  addBuilding(scene, materials, {
    width: 14, depth: 8, height: 4.8, x: 0, z: -36, sign: '懷周樓',
    windows: 3, roofRise: 1.2, base: .5
  });

  // 会泽院两翼配楼
  addBuilding(scene, materials, { width: 10, depth: 7, height: 4, x: -18, z: -2, windows: 2, roofRise: 1.6, base: .6 });
  addBuilding(scene, materials, { width: 10, depth: 7, height: 4, x: 18, z: -2, windows: 2, roofRise: 1.6, base: .6 });

  // ============ 校门（地标 02 起点，南门，坐南朝北迎银杏道） ============
  const gate = new THREE.Group();
  gate.position.set(0, 0, 48);
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
  scene.add(meshBox(14, .3, 3, materials.stone, 0, .1, 44.5));

  // ============ 银杏道（会泽院北侧：从文渊楼延伸到会泽院，真实位置） ============
  for (const x of [-8.5, 8.5]) {
    for (let i = 0; i < 4; i++) {
      addTree(scene, trees, materials, x, -4 - i * 5.4, .85 + (i % 2) * .25, i * 3 + (x > 0 ? 1 : 0), 'ginkgo');
    }
  }
  // 银杏道灯柱与灯笼
  for (const x of [-6.6, 6.6]) {
    for (const z of [-6, -12, -18]) {
      const lantern = createLantern(materials, .8);
      lantern.position.set(x, 3.6, z);
      scene.add(lantern);
      scene.add(cylinderBetween([x, 0, z], [x, 3, z], .07, materials.darkWood, 6));
      lanterns.push(lantern);
    }
  }
  // 九五台阶两旁松柏（真实：龙门道两旁为松柏、柳树）
  [[-7.2, 13.5], [7.2, 13.5], [-7.4, 8.6], [7.4, 8.6], [-8, 19], [8, 19],
   [-10, 28], [10, 28], [-9, 36], [9, 36], [-8, 43], [8, 43]].forEach(([x, z], index) => {
    addTree(scene, trees, materials, x, z, .95 + (index % 3) * .12, index + 40);
  });

  // 大草坪（龙门道东侧）
  const lawn = new THREE.Group();
  lawn.position.set(13, 0, 10);
  createLawn(scene, materials, trees);

  // ============ 翠湖一角（南门外） ============
  createLake(scene, materials, trees, boatAnchors);

  // 周边院落与树木
  addBuilding(scene, materials, { width: 12, depth: 7, height: 3.9, x: -46, z: -32, windows: 2, roofRise: 1.6 });
  addBuilding(scene, materials, { width: 13, depth: 7, height: 4, x: 46, z: -32, windows: 3, rotation: Math.PI, roofRise: 1.7 });
  addBuilding(scene, materials, { width: 12, depth: 7, height: 3.8, x: -52, z: 36, windows: 2, rotation: Math.PI, roofRise: 1.6 });
  addBuilding(scene, materials, { width: 13, depth: 7, height: 4, x: 52, z: 40, windows: 2, rotation: Math.PI, roofRise: 1.7 });

  [
    [-24, -42, 1.1], [-38, -44, 1.2], [-12, -44, 1], [12, -44, .95], [26, -42, 1.15],
    [40, -42, 1.1], [-16, 24, .9], [-34, 30, 1.05], [-50, 28, 1.1], [16, 26, .85],
    [30, 32, .95], [46, 2, .9], [-46, -20, 1], [-56, 22, 1.1], [56, 26, 1],
    [-16, 2, .8], [26, 2, .85], [-28, -14, 1.05], [32, -10, .95], [-56, -24, 1.1],
    [56, -18, 1.05], [14, 44, .9], [-14, 46, .85], [-22, 38, .95], [24, 40, .9],
    [-34, -16, 1], [-36, -2, .95]
  ].forEach(([x, z, scale], index) => addTree(scene, trees, materials, x, z, scale, index));

  // 灯光
  const hemi = new THREE.HemisphereLight('#e7eee3', '#5a5848', 2.2);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff1d4', 3.1);
  sun.position.set(-35, 58, 28);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -85; sun.shadow.camera.right = 85;
  sun.shadow.camera.top = 85; sun.shadow.camera.bottom = -85;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 200;
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
