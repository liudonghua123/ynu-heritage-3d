import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function meshBox(width, height, depth, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function cylinderBetween(start, end, radius, material, segments = 8) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), segments), material);
  mesh.position.copy(from.add(to).multiplyScalar(.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  return mesh;
}

export function createRoof(materials, width, depth, rise = 2) {
  const group = new THREE.Group();
  const w = width + 1.1;
  const d = depth + 1.2;
  const positions = [
    -w / 2, 0, d / 2, w / 2, 0, d / 2, -w / 2, rise, 0, w / 2, rise, 0,
    -w / 2, 0, -d / 2, w / 2, 0, -d / 2
  ];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0,0, 1,0, 0,1, 1,1, 0,0, 1,0], 2));
  geometry.setIndex([0,1,3, 0,3,2, 2,3,5, 2,5,4]);
  geometry.computeVertexNormals();
  const roof = new THREE.Mesh(geometry, materials.roof);
  roof.castShadow = true; roof.receiveShadow = true;
  group.add(roof);

  const gableGeometry = new THREE.BufferGeometry();
  gableGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -width / 2, 0, -depth / 2, -width / 2, 0, depth / 2, -width / 2, rise - .12, 0,
    width / 2, 0, depth / 2, width / 2, 0, -depth / 2, width / 2, rise - .12, 0
  ], 3));
  gableGeometry.setAttribute('uv', new THREE.Float32BufferAttribute([0,0, 1,0, .5,1, 0,0, 1,0, .5,1], 2));
  gableGeometry.computeVertexNormals();
  const gables = new THREE.Mesh(gableGeometry, materials.plasterDark);
  gables.material.side = THREE.DoubleSide;
  group.add(gables);

  const ribs = [];
  const slopeLength = Math.hypot(rise, d / 2) + .12;
  const baseRib = new THREE.CylinderGeometry(.055, .075, slopeLength, 6, 1);
  const up = new THREE.Vector3(0, 1, 0);
  for (let x = -w / 2 + .12; x <= w / 2; x += .34) {
    for (const side of [-1, 1]) {
      const direction = new THREE.Vector3(0, -rise, side * d / 2).normalize();
      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
      const midpoint = new THREE.Vector3(x, rise / 2 + .035, side * d / 4);
      matrix.compose(midpoint, quaternion, new THREE.Vector3(1, 1, 1));
      ribs.push(baseRib.clone().applyMatrix4(matrix));
    }
  }
  const merged = mergeGeometries(ribs);
  const tileRibs = new THREE.Mesh(merged, materials.roofRib);
  tileRibs.castShadow = true;
  group.add(tileRibs);
  ribs.forEach(item => item.dispose());
  baseRib.dispose();

  group.add(cylinderBetween([-w / 2 - .12, rise + .04, 0], [w / 2 + .12, rise + .04, 0], .13, materials.roofRib, 10));
  group.add(meshBox(w, .15, .16, materials.darkWood, 0, -.02, d / 2));
  group.add(meshBox(w, .15, .16, materials.darkWood, 0, -.02, -d / 2));
  for (const side of [-1, 1]) {
    const ornament = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), materials.roofRib);
    ornament.position.set(side * (w / 2 + .12), rise + .08, 0);
    ornament.scale.set(1.4, .8, .8);
    group.add(ornament);
  }
  return group;
}

export function createLatticeWindow(materials, width = 1.7, height = 2.1) {
  const group = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), materials.lattice);
  panel.castShadow = true;
  group.add(panel);
  group.add(meshBox(width + .16, .1, .12, materials.darkWood, 0, height / 2 + .03, .025));
  group.add(meshBox(width + .22, .13, .22, materials.darkWood, 0, -height / 2 - .03, .06));
  group.add(meshBox(.1, height, .12, materials.darkWood, -width / 2 - .03, 0, .025));
  group.add(meshBox(.1, height, .12, materials.darkWood, width / 2 + .03, 0, .025));
  return group;
}

// 会泽院式建筑：米黄墙体 + 红墙基座 + 西式立柱 + 中式坡顶
export function createBuilding(materials, options = {}) {
  const {
    width = 12, depth = 8, height = 4.2, x = 0, z = 0, rotation = 0,
    sign = '', signStyle = 'plaque', windows = 2, door = true, roofRise = 1.8, base = .35,
    dark = false, sideWindows = true, style = 'huize'
  } = options;
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  const wallMaterial = dark ? materials.plasterDark : (style === 'red' ? materials.redWall : materials.creamWall);
  // 红石基座 + 主墙
  group.add(meshBox(width + .3, Math.max(.6, base), depth + .3, materials.stone, 0, Math.max(.6, base) / 2, 0));
  const wallBase = Math.max(.6, base);
  const walls = meshBox(width, height, depth, wallMaterial, 0, wallBase + height / 2, 0);
  group.add(walls);
  group.add(meshBox(width + .15, .18, .2, materials.darkWood, 0, wallBase + height - .25, depth / 2 + .06));
  group.add(meshBox(width + .15, .14, .18, materials.darkWood, 0, wallBase + .55, depth / 2 + .07));

  // 西式立柱（会泽院特征）
  const columnMaterial = style === 'huize' ? materials.creamWall : materials.darkWood;
  for (const columnX of [-width / 2 + .3, width / 2 - .3]) {
    const column = new THREE.Mesh(new THREE.BoxGeometry(.34, height * .92, .34), columnMaterial);
    column.position.set(columnX, wallBase + height * .46, depth / 2 + .16);
    column.castShadow = true;
    group.add(column);
    const capital = meshBox(.5, .16, .5, materials.stone, columnX, wallBase + height * .92, depth / 2 + .16);
    group.add(capital);
  }

  const frontZ = depth / 2 + .09;
  let entrance = null;
  if (door) {
    entrance = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 2.85), materials.door);
    entrance.position.set(0, wallBase + 1.425, frontZ + .025);
    entrance.castShadow = true;
    group.add(entrance);
    // 拱券门楣
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, .3, 20, 1, false, 0, Math.PI), materials.stone);
    arch.rotation.x = Math.PI / 2;
    arch.position.set(0, wallBase + 2.85, frontZ);
    group.add(arch);
    group.add(meshBox(2.15, .16, .65, materials.stone, 0, wallBase + .02, frontZ + .18));
  }

  const usable = width - 3.6;
  for (let index = 0; index < windows; index++) {
    const window = createLatticeWindow(materials, Math.min(2, usable / windows - .5), 2.05);
    const px = windows === 1 ? -width * .27 : -usable / 2 + usable * (index + .5) / windows;
    window.position.set(px, wallBase + 2.15, frontZ + .035);
    group.add(window);
  }
  if (sideWindows) {
    for (const side of [-1, 1]) {
      const window = createLatticeWindow(materials, 1.7, 1.9);
      window.position.set(side * (width / 2 + .015), wallBase + 2.15, 0);
      window.rotation.y = side * Math.PI / 2;
      group.add(window);
    }
  }
  if (sign) {
    if (signStyle === 'vertical') {
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(.56, 2.05),
        materials.sign(sign, { width: 256, height: 768, vertical: true, fontSize: 142, background: '#20241f', color: '#d1c5a5' }));
      plaque.position.set(-1.45, wallBase + 2.25, frontZ + .09);
      group.add(plaque);
    } else {
      const signWidth = Math.max(2.6, Math.min(5.6, sign.length * .85));
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(signWidth, .82), materials.sign(sign));
      plaque.position.set(0, wallBase + height - .85, frontZ + .09);
      group.add(plaque);
    }
  }
  const roof = createRoof(materials, width, depth, roofRise);
  roof.position.y = wallBase + height;
  group.add(roof);
  group.userData.entrance = entrance;
  return group;
}

export function createCourtyardWall(materials, width, height = 2.4, withCap = true, material = null) {
  const group = new THREE.Group();
  group.add(meshBox(width, height, .34, material || materials.redWall, 0, height / 2, 0));
  group.add(meshBox(width + .05, .3, .4, materials.plasterDark, 0, .15, 0));
  if (withCap) {
    const cap = createRoof(materials, width, .45, .28);
    cap.position.y = height;
    group.add(cap);
  }
  return group;
}

export function createTree(materials, scale = 1, seed = 0, kind = 'green') {
  const group = new THREE.Group();
  const trunkHeight = 3.4 * scale;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.18 * scale, .3 * scale, trunkHeight, 7), materials.wood);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  group.add(trunk);
  for (let index = 0; index < 3; index++) {
    const angle = index * 2.1 + seed;
    const branch = cylinderBetween([0, trunkHeight * .65, 0], [Math.cos(angle) * scale, trunkHeight + .3 * scale, Math.sin(angle) * scale], .1 * scale, materials.wood, 6);
    group.add(branch);
  }
  const canopy = new THREE.Group();
  const clusters = [
    [0, .8, 0, 1.5], [1.05, .35, .2, 1.1], [-.9, .3, .45, 1.2], [.2, .25, -1, 1.15], [-.45, 1.25, -.3, 1]
  ];
  const leaves = kind === 'ginkgo' ? materials.ginkgoLeaf : materials.leaf;
  clusters.forEach(([x, y, z, size], index) => {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(size * scale, 1), leaves[(index + seed) % leaves.length | 0]);
    leaf.position.set(x * scale, trunkHeight + y * scale, z * scale);
    leaf.scale.y = .82;
    leaf.castShadow = true;
    canopy.add(leaf);
  });
  group.add(canopy);
  group.userData.canopy = canopy;
  return group;
}

export function createLantern(materials, scale = 1) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(.34 * scale, 16, 10), materials.red);
  body.scale.y = 1.15;
  body.castShadow = true;
  group.add(body);
  for (const y of [-.37, .37]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.16 * scale, .16 * scale, .09 * scale, 12), materials.brass);
    cap.position.y = y * scale;
    group.add(cap);
  }
  group.add(cylinderBetween([0, .42 * scale, 0], [0, .9 * scale, 0], .015 * scale, materials.rope, 5));
  group.add(cylinderBetween([0, -.4 * scale, 0], [0, -.85 * scale, 0], .025 * scale, materials.red, 5));
  return group;
}

export function createStoneBridge(materials, width = 3.4, length = 15) {
  const group = new THREE.Group();
  const steps = 15;
  for (let index = 0; index < steps; index++) {
    const t = index / (steps - 1);
    const z = (t - .5) * length;
    const y = .22 + Math.sin(t * Math.PI) * 1.55;
    const slab = meshBox(width, .32, length / steps + .09, materials.stone, 0, y, z);
    group.add(slab);
    if (index % 2 === 0) {
      for (const side of [-1, 1]) {
        group.add(meshBox(.2, .85, .2, materials.stone, side * (width / 2 - .1), y + .52, z));
      }
    }
  }
  for (const side of [-1, 1]) {
    for (let index = 0; index < steps - 1; index++) {
      const t1 = index / (steps - 1), t2 = (index + 1) / (steps - 1);
      const p1 = [side * (width / 2 - .1), 1 + Math.sin(t1 * Math.PI) * 1.55, (t1 - .5) * length];
      const p2 = [side * (width / 2 - .1), 1 + Math.sin(t2 * Math.PI) * 1.55, (t2 - .5) * length];
      group.add(cylinderBetween(p1, p2, .09, materials.stone, 6));
    }
  }
  return group;
}

// 龙门道：九十五级青石台阶的抽象化
export function createStairway(materials, width = 5, steps = 12, rise = .32) {
  const group = new THREE.Group();
  for (let index = 0; index < steps; index++) {
    group.add(meshBox(width, rise, .62, materials.stone, 0, index * rise + rise / 2, -index * .62));
  }
  for (const side of [-1, 1]) {
    group.add(meshBox(.5, steps * rise + 1.1, steps * .62 + .4, materials.stone, side * (width / 2 + .25), steps * rise / 2, -steps * .62 / 2 + .3));
  }
  return group;
}

// 钟楼（映秋院旁的标志性水塔钟楼抽象）
export function createClockTower(materials) {
  const group = new THREE.Group();
  group.add(meshBox(3.2, .8, 3.2, materials.stone, 0, .4, 0));
  group.add(meshBox(2.6, 8.2, 2.6, materials.creamWall, 0, 4.9, 0));
  for (const side of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const face = new THREE.Mesh(new THREE.CircleGeometry(.82, 20), materials.paper);
    face.position.set(side[0] * 1.34, 7.6, side[1] * 1.34);
    if (side[1] !== 0) face.rotation.y = side[1] > 0 ? 0 : Math.PI;
    if (side[0] !== 0) face.rotation.y = side[0] > 0 ? Math.PI / 2 : -Math.PI / 2;
    group.add(face);
    const hand = cylinderBetween([side[0] * 1.38, 7.6, side[1] * 1.38], [side[0] * 1.38 + (side[0] ? 0 : .0), 8.1, side[1] * 1.38 + (side[1] ? 0 : 0)], .04, materials.ink, 5);
    hand.position.x += side[0] * .01;
    group.add(hand);
  }
  const towerRoof = createRoof(materials, 3, 3, 1.1);
  towerRoof.position.y = 9;
  group.add(towerRoof);
  return group;
}

export function createDesk(materials, width = 1.8, depth = .9, height = 1.05, special = false) {
  const group = new THREE.Group();
  const top = meshBox(width, .12, depth, special ? materials.early : materials.lightWood, 0, height, 0);
  top.userData.hotspot = special ? 'early' : undefined;
  group.add(top);
  for (const x of [-width / 2 + .12, width / 2 - .12]) {
    for (const z of [-depth / 2 + .1, depth / 2 - .1]) {
      group.add(meshBox(.12, height, .12, materials.wood, x, height / 2, z));
    }
  }
  group.add(meshBox(width - .15, .22, .08, materials.wood, 0, height - .19, depth / 2 - .05));
  group.add(meshBox(width - .15, .22, .08, materials.wood, 0, height - .19, -depth / 2 + .05));
  group.add(meshBox(.08, .16, depth - .12, materials.wood, -width / 2 + .07, height - .17, 0));
  group.add(meshBox(.08, .16, depth - .12, materials.wood, width / 2 - .07, height - .17, 0));
  group.userData.early = special;
  return group;
}

export function createChair(materials, width = .78) {
  const group = new THREE.Group();
  group.add(meshBox(width, .1, .72, materials.wood, 0, .59, 0));
  for (const x of [-width / 2 + .08, width / 2 - .08]) {
    for (const z of [-.27, .27]) group.add(meshBox(.09, .6, .09, materials.wood, x, .3, z));
  }
  for (const x of [-width / 2 + .07, width / 2 - .07]) group.add(meshBox(.09, 1.1, .09, materials.wood, x, 1.08, -.28));
  group.add(meshBox(width, .12, .1, materials.wood, 0, 1.58, -.28));
  for (const x of [-.18, 0, .18]) group.add(meshBox(.045, .75, .055, materials.wood, x, 1.17, -.28));
  return group;
}

export function addBooksAndInk(group, materials, x = 0, y = 1.14, z = 0) {
  const book = meshBox(.42, .06, .3, materials.paper, x - .25, y, z);
  book.rotation.y = .12;
  group.add(book);
  group.add(meshBox(.34, .045, .22, materials.ink, x + .25, y, z + .08));
  const brush = cylinderBetween([x, y + .03, z - .18], [x + .48, y + .03, z - .1], .018, materials.lightWood, 6);
  group.add(brush);
}
