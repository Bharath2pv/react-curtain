import * as THREE from 'three';
import chroma from 'chroma-js';

const tmp = new THREE.Vector3();

export class Polyline {
	constructor(params) {
		const { points, color1, color2 } = params;
		this.points = points;
		this.count = points.length;
		this.color1 = color1;
		this.color2 = color2;
		this.init();
		this.updateGeometry();
	}

	init() {
		// const cscale = chroma.scale([chroma.random(), chroma.random()]);
		const cscale = chroma.scale([ this.color1, this.color2 ]);
		this.geometry = new THREE.BufferGeometry();
		this.position = new Float32Array(this.count * 3 * 2);
		this.prev = new Float32Array(this.count * 3 * 2);
		this.next = new Float32Array(this.count * 3 * 2);
		const side = new Float32Array(this.count * 1 * 2);
		const uv = new Float32Array(this.count * 2 * 2);
		const color = new Float32Array(this.count * 3 * 2);
		const index = new Uint16Array((this.count - 1) * 3 * 2);

		const c = new THREE.Color();
		for (let i = 0; i < this.count; i++) {
			const i2 = i * 2;
			side.set([ -1, 1 ], i2);
			const v = i / (this.count - 1);
			uv.set([ 0, v, 1, v ], i * 4);

			c.set(cscale(v).hex());
			c.toArray(color, i2 * 3);
			c.toArray(color, (i2 + 1) * 3);

			if (i === this.count - 1) continue;
			index.set([ i2 + 0, i2 + 1, i2 + 2 ], (i2 + 0) * 3);
			index.set([ i2 + 2, i2 + 1, i2 + 3 ], (i2 + 1) * 3);
		}

		this.geometry.setAttribute('position', new THREE.BufferAttribute(this.position, 3));
		this.geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));
		this.geometry.setAttribute('prev', new THREE.BufferAttribute(this.prev, 3));
		this.geometry.setAttribute('next', new THREE.BufferAttribute(this.next, 3));
		this.geometry.setAttribute('side', new THREE.BufferAttribute(side, 1));
		this.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
		this.geometry.setIndex(new THREE.BufferAttribute(index, 1));
	}

	updateGeometry() {
		this.points.forEach((p, i) => {
			p.toArray(this.position, i * 3 * 2);
			p.toArray(this.position, i * 3 * 2 + 3);

			if (!i) {
				tmp.copy(p).sub(this.points[i + 1]).add(p);
				tmp.toArray(this.prev, i * 3 * 2);
				tmp.toArray(this.prev, i * 3 * 2 + 3);
			} else {
				p.toArray(this.next, (i - 1) * 3 * 2);
				p.toArray(this.next, (i - 1) * 3 * 2 + 3);
			}

			if (i === this.points.length - 1) {
				tmp.copy(p).sub(this.points[i - 1]).add(p);
				tmp.toArray(this.next, i * 3 * 2);
				tmp.toArray(this.next, i * 3 * 2 + 3);
			} else {
				p.toArray(this.prev, (i + 1) * 3 * 2);
				p.toArray(this.prev, (i + 1) * 3 * 2 + 3);
			}
		});

		this.geometry.attributes.position.needsUpdate = true;
		this.geometry.attributes.prev.needsUpdate = true;
		this.geometry.attributes.next.needsUpdate = true;
	}
}
