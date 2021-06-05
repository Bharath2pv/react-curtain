import React, { useEffect } from 'react';
import * as THREE from 'three';
import chroma from 'chroma-js';
import { Polyline } from './polyline';
import { useDispatch, useSelector } from 'react-redux';
const { randFloat: rnd, randFloatSpread: rndFS } = THREE.Math;

const mouse = new THREE.Vector2(),
	oldMouse = new THREE.Vector2();
const verlet = new window.VerletJS(),
	polylines = [];
const uCx = { value: 0 },
	uCy = { value: 0 };
let width, height;
let renderer, scene, camera;
const conf = {
	el: 'canvas',
	gravity: -0.2,
	nx: 100,
	ny: 40,
	mouseRadius: 10,
	mouseStrength: 0.4
};

function GetMesh(props) {
    const cameraEvent = useSelector((state) => state.coordinateReducer.eventCoordinates);
    const movingEvent = useSelector((state) => state.coordinateReducer.moveCoordinates);
    const curtainSize = useSelector((state) => state.coordinateReducer.curtainSize);
	useEffect(() => {
		initializeCurtin();
	}, []);

    useEffect(() => {
		updateMouse(cameraEvent);
	}, [cameraEvent]);

    useEffect(() => {
		move(movingEvent);
	}, [movingEvent]);

	useEffect(() => {
		const id = setInterval(updateColors, 10000);
		return () => clearInterval(id);
	}, []);

    useEffect(() => {
		initializeCurtin();
	}, []);

	const initializeCurtin = () => {
		renderer = new THREE.WebGLRenderer({ canvas: document.getElementById(conf.el), antialias: true, alpha: true });
		camera = new THREE.PerspectiveCamera();

		verlet.width = 256;
		verlet.height = 256;

		updateSize();
		window.addEventListener('resize', updateSize, false);

		initScene();
		// initListeners();
		animate();
	};

	const initScene = () => {
		scene = new THREE.Scene();
		verlet.gravity = new THREE.Vector2(0, conf.gravity);
		initCurtain();
	};

	const initCurtain = () => {
		const material = new THREE.ShaderMaterial({
			transparent: true,
			uniforms: {
				uCx,
				uCy,
				uSize: { value: curtainSize / conf.nx }
			},
			vertexShader: `
              uniform float uCx;
              uniform float uCy;
              uniform float uSize;
              attribute vec3 color;
              attribute vec3 next;
              attribute vec3 prev;
              attribute float side;
      
              varying vec4 vColor;
      
              void main() {
                vec3 pos = vec3(position.x * uCx, position.y * uCy, 0.0);
                vec2 sprev = vec2(prev.x * uCx, prev.y * uCy);
                vec2 snext = vec2(next.x * uCx, next.y * uCy);
      
                vec2 tangent = normalize(snext - sprev);
                vec2 normal = vec2(-tangent.y, tangent.x);
      
                float dist = length(snext - sprev);
                normal *= smoothstep(0.0, 0.02, dist);
      
                vColor = vec4(color, 1.0 - smoothstep(0.5, 1.0, uv.y) * 0.5);
      
                normal *= uSize;// * (1.0 - uv.y);
                pos.xy -= normal * side;
      
                gl_Position = vec4(pos, 1.0);
              }
            `,
			fragmentShader: `
              varying vec4 vColor;
              void main() {
                gl_FragColor = vColor;
              }
            `
		});

		const dx = verlet.width / conf.nx,
			dy = -verlet.height / (conf.ny - 1);
		const ox = -dx * (conf.nx / 2 - 0.5),
			oy = verlet.height / 2 - dy / 2;
		const cscale = chroma.scale([ 0x051924, 0xc00a1c ]);
		for (let i = 0; i < conf.nx; i++) {
			const points = [];
			const vpoints = [];
			for (let j = 0; j < conf.ny; j++) {
				const x = ox + i * dx,
					y = oy + j * dy;
				points.push(new THREE.Vector3(x, y, 0));
				vpoints.push(new THREE.Vector2(x, y));
			}
			const polyline = new Polyline({ points, color1: cscale(rnd(0, 1)), color2: cscale(rnd(0, 1)) });
			polylines.push(polyline);

			polyline.segment = verlet.lineSegments(vpoints, 5);
			polyline.segment.pin(0);
			// polyline.segment.particles.forEach(p => { p.pos.x += rndFS(5); });

			const mesh = new THREE.Mesh(polyline.geometry, material);
			scene.add(mesh);
		}

		for (let i = 0; i < 256; i++) {
			const ox = -256 / 2;
			setTimeout(() => {
				moveCurtain(new THREE.Vector2(ox + i, 0), new THREE.Vector2(ox + i + 1, 0));
			}, i * 15);
		}
	};

	const updatePoints = () => {
		polylines.forEach((line) => {
			for (let i = 0; i < line.points.length; i++) {
				const p = line.segment.particles[i].pos;
				line.points[i].x = p.x;
				line.points[i].y = p.y;
			}
			line.updateGeometry();
		});
	};

	const updateColors = () => {
		const c1 = chroma.random(),
			c2 = chroma.random();
		const cscale = chroma.scale([ c1, c2 ]);
		polylines.forEach((line) => {
			line.color1 = cscale(rnd(0, 1));
			line.color2 = cscale(rnd(0, 1));
			const cscale1 = chroma.scale([ line.color1, line.color2 ]);
			const colors = line.geometry.attributes.color.array;
			const c = new THREE.Color();
			for (let i = 0; i < line.count; i++) {
				c.set(cscale1(i / line.count).hex());
				c.toArray(colors, i * 2 * 3);
				c.toArray(colors, (i * 2 + 1) * 3);
			}
			line.geometry.attributes.color.needsUpdate = true;
		});
	};

	const animate = () => {
		verlet.frame(16);
		updatePoints();
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	};

	// const initListeners = () => {
	// 	if ('ontouchstart' in window) {
	// 		document.body.addEventListener('touchstart', updateMouse, false);
	// 		document.body.addEventListener('touchmove', move, false);
	// 	} else {
	// 		document.body.addEventListener('mouseenter', updateMouse, false);
	// 		document.body.addEventListener('mousemove', move, false);
	// 	}
	// };

	const move = (e) => {
		updateMouse(e);
		moveCurtain(oldMouse, mouse);
	};

	const moveCurtain = (oV, nV) => {
		const v1 = new THREE.Vector2(),
			v2 = new THREE.Vector2();
		polylines.forEach((line) => {
			for (let i = 0; i < line.points.length; i++) {
				const position = line.segment.particles[i].pos;
				const l = v1.copy(oV).sub(v2.set(position.x, position.y)).length();
				if (l < conf.mouseRadius) {
					v1.copy(nV).sub(oV).multiplyScalar(conf.mouseStrength);
					position.x += v1.x;
					position.y += v1.y;
				}
			}
		});
	};

	const updateMouse = (e) => {
		oldMouse.copy(mouse);
		mouse.set((e.x - width / 2) * verlet.width / width, (height / 2 - e.y) * verlet.height / height);
	};

	const updateSize = () => {
		width = window.innerWidth;
		height = window.innerHeight;
		uCx.value = 2 / verlet.width;
		uCy.value = 2 / verlet.height;
		renderer.setSize(width, height);
	};

	return (
		<div>
			<canvas id="canvas" />
		</div>
	);
}

export default GetMesh;
