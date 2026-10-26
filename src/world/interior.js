import * as THREE from 'three';
import {
  meshBox, cylinderBetween, createRoof, createLatticeWindow,
  createDesk, createChair, addBooksAndInk
} from './architecture.js';

// 至公堂内部：清代贡院大殿 → 抗战演讲厅。匾额、讲台、长条听讲椅、人物画像墙。
export function createInterior(materials) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#302e28');
  const interactables = [];

  const floor = meshBox(14, .22, 12, materials.floor, 0, -.11, 0);
  floor.castShadow = false;
  scene.add(floor);
  scene.add(meshBox(14, 5.4, .28, materials.redWall, 0, 2.7, -6));
  scene.add(meshBox(.28, 5.4, 12, materials.redWall, -7, 2.7, 0));
  scene.add(meshBox(.28, 5.4, 12, materials.redWall, 7, 2.7, 0));
  scene.add(meshBox(4.7, 5.4, .28, materials.redWall, -4.65, 2.7, 6));
  scene.add(meshBox(4.7, 5.4, .28, materials.redWall, 4.65, 2.7, 6));
  scene.add(meshBox(4.6, 1.15, .28, materials.darkWood, 0, 4.83, 6));

  // 后墙木格栅
  const backPanel = meshBox(6.3, 4.55, .16, materials.darkWood, 0, 2.35, -5.79);
  scene.add(backPanel);
  for (let x = -3; x <= 3; x += .5) scene.add(meshBox(.035, 4.45, .08, materials.wood, x, 2.35, -5.68));
  for (const x of [-6.75, -3.35, 3.35, 6.75]) {
    scene.add(meshBox(.26, 5.25, .32, materials.darkWood, x, 2.62, -5.7));
    scene.add(meshBox(.46, .22, .46, materials.stone, x, .11, -5.7));
  }
  for (const side of [-1, 1]) {
    for (const z of [-3.8, 0, 3.8]) {
      scene.add(meshBox(.26, 5.25, .26, materials.darkWood, side * 6.75, 2.62, z));
    }
  }

  const roof = createRoof(materials, 14, 12, 2.35);
  roof.position.y = 5.35;
  scene.add(roof);
  for (let x = -6.5; x <= 6.5; x += .72) {
    scene.add(cylinderBetween([x, 5.25, -5.8], [x, 7.5, 0], .07, materials.darkWood, 6));
    scene.add(cylinderBetween([x, 7.5, 0], [x, 5.25, 5.8], .07, materials.darkWood, 6));
  }
  for (const z of [-5.4, -2.7, 0, 2.7, 5.4]) {
    const height = 5.35 + (1 - Math.abs(z) / 6) * 2.15;
    scene.add(meshBox(13.8, .24, .25, materials.wood, 0, height - .18, z));
  }
  scene.add(meshBox(13.8, .32, .35, materials.darkWood, 0, 5.18, -5.62));

  for (const side of [-1, 1]) {
    for (const z of [-2.2, 2.2]) {
      const window = createLatticeWindow(materials, 2.6, 2.4);
      window.position.set(side * 6.83, 2.75, z);
      window.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      scene.add(window);
    }
  }

  // 匾额「至公堂」
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.24),
    materials.sign('至公堂', { background: '#20241f', color: '#d1c5a5' }));
  plaque.position.set(0, 4.55, -5.62);
  plaque.userData.hotspot = 'painting';
  scene.add(plaque);
  interactables.push(plaque);

  // 滇池山水画
  const painting = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 2.9), materials.painting);
  painting.position.set(0, 2.52, -5.6);
  painting.userData.hotspot = 'painting';
  scene.add(painting);
  interactables.push(painting);

  // 人物画像墙：熊庆来、闻一多、李广田（三任校长/名师）
  const portraits = [
    ['熊慶來', -2.6], ['聞一多', 0], ['李廣田', 2.6]
  ];
  portraits.forEach(([name, x], index) => {
    const portrait = new THREE.Mesh(new THREE.PlaneGeometry(.92, 1.18), materials.portrait(name));
    portrait.position.set(x, 2.3, -5.55);
    portrait.userData.hotspot = 'portrait';
    portrait.userData.person = name;
    scene.add(portrait);
    interactables.push(portrait);
    const frame = meshBox(1.06, 1.32, .06, materials.darkWood, x, 2.3, -5.6);
    scene.add(frame);
  });

  // 讲台（长案）
  const altar = createDesk(materials, 5.7, .7, 1.32);
  altar.position.set(0, 0, -4.95);
  scene.add(altar);
  for (const x of [-2.45, 2.45]) {
    const scroll = meshBox(.42, .18, .34, materials.paper, x, 1.49, -4.94);
    scene.add(scroll);
  }

  // 演讲台（闻一多《最后一次讲演》意象）
  const lectureDesk = createDesk(materials, 2.5, 1.18, 1.08);
  lectureDesk.position.set(0, 0, -1.85);
  addBooksAndInk(lectureDesk, materials, 0, 1.18, 0);
  lectureDesk.traverse(object => {
    if (object.userData.hotspot === 'early') object.userData.hotspot = 'lecture';
  });
  const lectureTop = lectureDesk.children[0];
  lectureTop.userData.hotspot = 'lecture';
  interactables.push(lectureTop);
  scene.add(lectureDesk);

  // 长条听讲椅（联大时期排椅）
  const benchPositions = [
    [-4.25, -2.7], [-4.25, .25], [-4.25, 3.15],
    [4.25, -2.7], [4.25, .25], [4.25, 3.15]
  ];
  benchPositions.forEach(([x, z]) => {
    const bench = meshBox(3.2, .1, .58, materials.wood, x, .62, z);
    scene.add(bench);
    for (const bx of [x - 1.4, x + 1.4]) {
      scene.add(meshBox(.12, .62, .12, materials.wood, bx, .31, z));
      scene.add(meshBox(.12, 1.1, .12, materials.wood, bx, 1.05, z - .26));
    }
    scene.add(meshBox(3.2, .12, .1, materials.wood, x, 1.55, z - .26));
  });

  // 侧案
  const sideDesk = createDesk(materials, 1.45, .75, .95);
  sideDesk.position.set(-5.4, 0, -4.7);
  addBooksAndInk(sideDesk, materials, 0, 1.06, 0);
  scene.add(sideDesk);

  // 灯光
  const hemi = new THREE.HemisphereLight('#e6d9bd', '#39362f', 2.3);
  scene.add(hemi);
  const sunlight = new THREE.DirectionalLight('#ffedc9', 2.65);
  sunlight.position.set(5, 9, 7);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.left = -10; sunlight.shadow.camera.right = 10;
  sunlight.shadow.camera.top = 10; sunlight.shadow.camera.bottom = -10;
  sunlight.shadow.camera.near = .5; sunlight.shadow.camera.far = 30;
  sunlight.shadow.bias = -.0002;
  sunlight.shadow.normalBias = .025;
  scene.add(sunlight);
  const warmFill = new THREE.PointLight('#e7b77b', 30, 16, 2);
  warmFill.position.set(-4.5, 3.7, 2.5);
  scene.add(warmFill);
  const frontFill = new THREE.PointLight('#d7e0d2', 30, 15, 2);
  frontFill.position.set(0, 3.8, 5.2);
  scene.add(frontFill);

  const dustGeometry = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(150 * 3);
  for (let index = 0; index < 150; index++) {
    dustPositions[index * 3] = (Math.random() - .5) * 12;
    dustPositions[index * 3 + 1] = Math.random() * 5;
    dustPositions[index * 3 + 2] = (Math.random() - .5) * 10;
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: '#e2d2ad', size: .018, transparent: true, opacity: .4, depthWrite: false }));
  scene.add(dust);

  scene.userData.interactables = interactables;
  scene.userData.hotspots = {
    lecture: new THREE.Vector3(0, 1.45, -1.4),
    painting: new THREE.Vector3(0, 5.25, -5.5),
    portrait: new THREE.Vector3(0, 2.35, -5.3)
  };
  scene.userData.views = {
    overview: { position: [0, 2.3, 5.25], target: [0, 2.45, -3.2] },
    lecture: { position: [0, 2.65, .35], target: [0, 1.15, -1.9] },
    painting: { position: [.1, 2.9, -.55], target: [0, 3.05, -5.6] },
    portrait: { position: [0, 2.5, -3.4], target: [0, 2.35, -5.55] }
  };
  scene.userData.animate = time => {
    dust.rotation.y = time * .006;
    dust.position.y = Math.sin(time * .12) * .06;
  };
  return scene;
}
