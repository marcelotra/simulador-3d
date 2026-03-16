import * as THREE from 'three';
const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(5.7, 0);
shape.lineTo(0, 1.5);
shape.lineTo(0, 0);
const geo = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: 50, bevelEnabled: false });
const pos = geo.getAttribute('position');
const zs = new Set();
for (let i = 0; i < pos.count; i++) {
    zs.add(pos.getZ(i));
}
console.log(Array.from(zs).sort((a, b) => a - b));
