import * as THREE from 'three';

function randomSource(seed = 18) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(width, height, draw, repeat = null) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  if (repeat) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(...repeat);
  }
  return texture;
}

function speckles(context, width, height, random, count, colors) {
  for (let i = 0; i < count; i++) {
    context.fillStyle = colors[Math.floor(random() * colors.length)];
    const size = random() * 2.4 + 0.3;
    context.fillRect(random() * width, random() * height, size, size);
  }
}

export function makeTextTexture(text, options = {}) {
  const {
    width = 1024,
    height = 256,
    background = '#b6a077',
    color = '#1c1c18',
    vertical = false,
    border = true,
    fontSize = vertical ? 150 : 148,
    family = '"Songti SC", "STSong", "SimSun", serif'
  } = options;
  return canvasTexture(width, height, (context, w, h) => {
    context.fillStyle = background;
    context.fillRect(0, 0, w, h);
    const random = randomSource(text.length * 41);
    speckles(context, w, h, random, 1700, ['#00000008', '#ffffff0b']);
    if (border) {
      context.strokeStyle = '#2b291f';
      context.lineWidth = Math.max(5, w * 0.007);
      context.strokeRect(12, 12, w - 24, h - 24);
      context.lineWidth = 2;
      context.strokeRect(24, 24, w - 48, h - 48);
    }
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `600 ${fontSize}px ${family}`;
    if (vertical) {
      const characters = [...text];
      const step = h / (characters.length + 0.45);
      characters.forEach((character, index) => {
        context.fillText(character, w / 2, step * (index + 0.72));
      });
    } else {
      context.fillText(text, w / 2, h / 2 + fontSize * 0.04, w * 0.88);
    }
  });
}

function makePaintingTexture() {
  // 会泽院内的字画：滇池山水小景
  return canvasTexture(512, 900, (context, w, h) => {
    context.fillStyle = '#d9cfb4';
    context.fillRect(0, 0, w, h);
    const random = randomSource(77);
    speckles(context, w, h, random, 7000, ['#4b443408', '#fff8df10']);
    // 远山
    context.fillStyle = '#6d7a72';
    context.globalAlpha = 0.55;
    context.beginPath();
    context.moveTo(40, 560);
    context.quadraticCurveTo(150, 380, 268, 520);
    context.quadraticCurveTo(360, 620, 470, 540);
    context.lineTo(470, 820);
    context.lineTo(40, 820);
    context.fill();
    context.globalAlpha = 0.85;
    context.fillStyle = '#59665e';
    context.beginPath();
    context.moveTo(20, 640);
    context.quadraticCurveTo(180, 470, 330, 610);
    context.quadraticCurveTo(420, 690, 500, 620);
    context.lineTo(500, 830);
    context.lineTo(20, 830);
    context.fill();
    context.globalAlpha = 1;
    // 水面
    context.strokeStyle = '#7c8a80';
    context.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      const y = 660 + i * 14;
      context.beginPath();
      context.moveTo(60 + (i % 3) * 30, y);
      context.lineTo(300 + (i % 4) * 40, y);
      context.stroke();
    }
    // 一叶小舟
    context.strokeStyle = '#3f4a42';
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(240, 700);
    context.quadraticCurveTo(262, 714, 284, 700);
    context.stroke();
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(262, 700);
    context.lineTo(262, 668);
    context.stroke();
    context.fillStyle = '#403e33';
    context.font = '22px "Songti SC", serif';
    context.fillText('滇池春晓', 48, 115);
    context.fillStyle = '#9a4a38';
    context.fillRect(52, 135, 24, 24);
    context.strokeStyle = '#eee5cd';
    context.lineWidth = 8;
    context.strokeRect(8, 8, w - 16, h - 16);
  });
}

function makePortraitTexture(name = '人物') {
  return canvasTexture(360, 460, (context, w, h) => {
    context.fillStyle = '#b6a485'; context.fillRect(0, 0, w, h);
    const random = randomSource(91);
    speckles(context, w, h, random, 5000, ['#1c160d0a', '#fff4dc0a']);
    context.strokeStyle = '#51483a'; context.lineWidth = 4;
    context.fillStyle = '#9b8b70';
    context.beginPath(); context.ellipse(180, 193, 73, 96, 0, 0, Math.PI * 2); context.fill(); context.stroke();
    context.beginPath(); context.moveTo(105, 172); context.quadraticCurveTo(100, 66, 183, 73); context.quadraticCurveTo(263, 80, 253, 177); context.stroke();
    context.beginPath(); context.moveTo(140, 181); context.lineTo(160, 178); context.moveTo(204, 178); context.lineTo(224, 181); context.stroke();
    context.beginPath(); context.moveTo(183, 185); context.lineTo(176, 225); context.lineTo(190, 228); context.stroke();
    context.beginPath(); context.moveTo(151, 251); context.quadraticCurveTo(183, 266, 215, 249); context.stroke();
    context.fillStyle = '#6b6050';
    context.beginPath(); context.moveTo(74, 440); context.quadraticCurveTo(83, 302, 147, 289); context.lineTo(181, 329); context.lineTo(215, 289); context.quadraticCurveTo(282, 312, 292, 440); context.fill();
    context.fillStyle = '#3d382f'; context.font = '20px "Songti SC", serif'; context.textAlign = 'center'; context.fillText(name, 180, 420);
  });
}

export function createMaterials() {
  const random = randomSource();
  const plasterMap = canvasTexture(512, 512, (context, w, h) => {
    context.fillStyle = '#d8d6c9'; context.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) {
      const x = random() * w, y = random() * h, r = random() * 55 + 5;
      const gradient = context.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, random() > .5 ? '#62685b16' : '#fffef322');
      gradient.addColorStop(1, '#00000000');
      context.fillStyle = gradient; context.fillRect(x - r, y - r, r * 2, r * 2);
    }
    speckles(context, w, h, random, 7000, ['#383c320a', '#ffffff12', '#88877d12']);
    context.strokeStyle = '#55594d20'; context.lineWidth = 1;
    for (let i = 0; i < 13; i++) {
      let x = random() * w, y = random() * h;
      context.beginPath(); context.moveTo(x, y);
      for (let j = 0; j < 5; j++) { x += (random() - .5) * 24; y += random() * 18; context.lineTo(x, y); }
      context.stroke();
    }
  }, [2, 1]);

  // 云大红墙：暖赭红砖
  const redWallMap = canvasTexture(512, 512, (context, w, h) => {
    context.fillStyle = '#8d4034'; context.fillRect(0, 0, w, h);
    const rowHeight = 42;
    for (let row = -1; row < 13; row++) {
      const offset = row % 2 ? -40 : 0;
      for (let column = -1; column < 13; column++) {
        const x = column * 80 + offset, y = row * rowHeight;
        const shade = 110 + Math.floor(random() * 36);
        context.fillStyle = `rgb(${shade + 34},${shade - 38},${shade - 44})`;
        context.fillRect(x + 1.5, y + 1.5, 77, rowHeight - 3);
      }
    }
    speckles(context, w, h, random, 8000, ['#2c120c14', '#e8b28a12', '#54291f18']);
  }, [3, 3]);

  // 米黄外墙（会泽院）
  const creamWallMap = canvasTexture(512, 512, (context, w, h) => {
    context.fillStyle = '#d9c49a'; context.fillRect(0, 0, w, h);
    speckles(context, w, h, random, 9000, ['#8a6f4216', '#f4e6c422', '#a98a5a18']);
    context.strokeStyle = '#b0986833'; context.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      let x = random() * w, y = random() * h;
      context.beginPath(); context.moveTo(x, y);
      for (let j = 0; j < 4; j++) { x += (random() - .5) * 30; y += random() * 22; context.lineTo(x, y); }
      context.stroke();
    }
  }, [2, 2]);

  const stoneMap = canvasTexture(512, 512, (context, w, h) => {
    context.fillStyle = '#8f9186'; context.fillRect(0, 0, w, h);
    const rowHeight = 85;
    for (let row = -1; row < 7; row++) {
      const offset = row % 2 ? -80 : 0;
      for (let column = -1; column < 5; column++) {
        const x = column * 160 + offset + 3, y = row * rowHeight + 3;
        const shade = 126 + Math.floor(random() * 30);
        context.fillStyle = `rgb(${shade},${shade + 2},${shade - 5})`;
        context.fillRect(x, y, 154, rowHeight - 6);
        context.strokeStyle = '#d0cfc22b'; context.strokeRect(x + 1, y + 1, 152, rowHeight - 8);
      }
    }
    speckles(context, w, h, random, 9000, ['#272c2515', '#e4e2d715', '#555b5014']);
  }, [7, 7]);

  const woodMap = canvasTexture(512, 512, (context, w, h) => {
    context.fillStyle = '#40352a'; context.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 5 + random() * 8) {
      context.strokeStyle = random() > .5 ? '#160f0b35' : '#b59a6a18';
      context.lineWidth = random() * 2 + .5;
      context.beginPath(); context.moveTo(x, 0);
      for (let y = 0; y <= h; y += 32) context.lineTo(x + Math.sin(y * .025 + x) * 4, y);
      context.stroke();
    }
    speckles(context, w, h, random, 2200, ['#00000012', '#d0b9890b']);
  }, [2, 2]);

  const roofMap = canvasTexture(512, 512, (context, w, h) => {
    context.fillStyle = '#454a46'; context.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 42) {
      for (let x = -20; x < w; x += 32) {
        context.strokeStyle = '#1e24229c'; context.lineWidth = 4;
        context.beginPath(); context.arc(x + (y % 84 ? 16 : 0), y, 18, 0, Math.PI); context.stroke();
        context.strokeStyle = '#8d93833b'; context.lineWidth = 2;
        context.beginPath(); context.arc(x + (y % 84 ? 16 : 0), y - 2, 15, 0, Math.PI); context.stroke();
      }
    }
    speckles(context, w, h, random, 4000, ['#0e140f18', '#bac0aa10']);
  }, [3, 2]);

  const latticeMap = canvasTexture(512, 512, (context, w, h) => {
    context.fillStyle = '#171b18'; context.fillRect(0, 0, w, h);
    context.fillStyle = '#27322d'; context.fillRect(20, 20, w - 40, h - 40);
    context.strokeStyle = '#796349'; context.lineWidth = 12; context.strokeRect(8, 8, w - 16, h - 16);
    context.lineWidth = 7;
    for (let x = 45; x < w - 25; x += 55) { context.beginPath(); context.moveTo(x, 24); context.lineTo(x, h - 24); context.stroke(); }
    for (let y = 45; y < h - 25; y += 55) { context.beginPath(); context.moveTo(24, y); context.lineTo(w - 24, y); context.stroke(); }
    context.strokeStyle = '#9a805c'; context.lineWidth = 2; context.strokeRect(27, 27, w - 54, h - 54);
  });

  const doorMap = canvasTexture(512, 768, (context, w, h) => {
    context.fillStyle = '#171a17'; context.fillRect(0, 0, w, h);
    for (let x = 5; x < w; x += 13) {
      context.fillStyle = x % 26 ? '#252820' : '#10130f'; context.fillRect(x, 0, 8, h);
      context.fillStyle = '#79806a16'; context.fillRect(x + 1, 0, 1, h);
    }
    context.strokeStyle = '#756249'; context.lineWidth = 12; context.strokeRect(7, 7, w - 14, h - 14);
    context.lineWidth = 9;
    for (let x = 45; x < w; x += 65) { context.beginPath(); context.moveTo(x, 20); context.lineTo(x, 205); context.stroke(); }
    for (let y = 42; y < 210; y += 45) { context.beginPath(); context.moveTo(12, y); context.lineTo(w - 12, y); context.stroke(); }
    context.fillStyle = '#8d8053'; context.beginPath(); context.arc(w * .44, h * .54, 8, 0, Math.PI * 2); context.fill();
  });

  const floorMap = stoneMap.clone();
  floorMap.repeat.set(4, 4);
  const waterMap = canvasTexture(512, 512, (context, w, h) => {
    context.fillStyle = '#718c7c'; context.fillRect(0, 0, w, h);
    for (let i = 0; i < 380; i++) {
      context.strokeStyle = random() > .5 ? '#d5e1ce25' : '#243f3622';
      context.lineWidth = random() * 2 + .5;
      const x = random() * w, y = random() * h;
      context.beginPath(); context.moveTo(x, y); context.quadraticCurveTo(x + 20, y - 5, x + 45 + random() * 50, y); context.stroke();
    }
  }, [5, 2]);

  const materials = {
    plaster: new THREE.MeshStandardMaterial({ map: plasterMap, color: '#eeeade', roughness: .96 }),
    plasterDark: new THREE.MeshStandardMaterial({ map: plasterMap, color: '#b9b9aa', roughness: .98 }),
    redWall: new THREE.MeshStandardMaterial({ map: redWallMap, color: '#b8574a', roughness: .92 }),
    creamWall: new THREE.MeshStandardMaterial({ map: creamWallMap, color: '#e0cda6', roughness: .94 }),
    stone: new THREE.MeshStandardMaterial({ map: stoneMap, color: '#b7b6a8', roughness: .95 }),
    floor: new THREE.MeshStandardMaterial({ map: floorMap, color: '#88877c', roughness: .92 }),
    wood: new THREE.MeshStandardMaterial({ map: woodMap, color: '#66503b', roughness: .83 }),
    darkWood: new THREE.MeshStandardMaterial({ map: woodMap, color: '#302c25', roughness: .85 }),
    lightWood: new THREE.MeshStandardMaterial({ map: woodMap, color: '#d4ae7f', roughness: .8 }),
    roof: new THREE.MeshStandardMaterial({ map: roofMap, color: '#666c64', roughness: .92, side: THREE.DoubleSide }),
    roofRib: new THREE.MeshStandardMaterial({ color: '#383e39', roughness: .9 }),
    lattice: new THREE.MeshStandardMaterial({ map: latticeMap, roughness: .77, side: THREE.DoubleSide }),
    door: new THREE.MeshStandardMaterial({ map: doorMap, roughness: .78, side: THREE.DoubleSide }),
    red: new THREE.MeshStandardMaterial({ color: '#a12f22', roughness: .65, emissive: '#8c1e10', emissiveIntensity: .12 }),
    brass: new THREE.MeshStandardMaterial({ color: '#9b8350', metalness: .45, roughness: .55 }),
    grass: new THREE.MeshStandardMaterial({ color: '#77836b', roughness: 1 }),
    earth: new THREE.MeshStandardMaterial({ color: '#514b37', roughness: 1 }),
    leaf: ['#415c3b', '#567044', '#6b7e4d', '#354f38'].map(color => new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true })),
    ginkgoLeaf: ['#c9a531', '#d9b83f', '#b8962a', '#e0c654'].map(color => new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true })),
    crop: new THREE.MeshStandardMaterial({ color: '#69834a', roughness: 1, flatShading: true }),
    water: new THREE.MeshPhysicalMaterial({ map: waterMap, bumpMap: waterMap, bumpScale: .13, color: '#527c6e', roughness: .28, metalness: .08, transparent: true, opacity: .96 }),
    paper: new THREE.MeshStandardMaterial({ color: '#d8ceb3', roughness: .95, side: THREE.DoubleSide }),
    ink: new THREE.MeshStandardMaterial({ color: '#191c18', roughness: .8 }),
    rope: new THREE.MeshStandardMaterial({ color: '#8b7656', roughness: 1 })
  };

  materials.sign = (text, options) => new THREE.MeshStandardMaterial({ map: makeTextTexture(text, options), roughness: .88, side: THREE.DoubleSide });
  materials.painting = new THREE.MeshStandardMaterial({ map: makePaintingTexture(), roughness: .95, side: THREE.DoubleSide });
  materials.portrait = name => new THREE.MeshStandardMaterial({ map: makePortraitTexture(name), roughness: .95 });
  return materials;
}
