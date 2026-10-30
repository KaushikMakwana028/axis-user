import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const EDGE_COLOR = '#c5833f'; // Warm amber/burnt laser-cut wood edge matching 3axis.co

const buildMesh = (panel, thickness, color) => {
  const shape = new THREE.Shape();
  panel.outline.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  const m = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(...panel.u),
    new THREE.Vector3(...panel.v),
    new THREE.Vector3(...panel.nrm)
  );
  m.setPosition(new THREE.Vector3(...panel.origin));
  geo.applyMatrix4(m);

  // Group 0: front and back faces (user-selected swatch color)
  const faceMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  // Group 1: laser-cut thickness edges (filled with warm amber/burnt wood tone)
  const edgeMat = new THREE.MeshStandardMaterial({
    color: EDGE_COLOR,
    roughness: 0.65,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, [faceMat, edgeMat]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo, 30),
    new THREE.LineBasicMaterial({ color: 0x9a5a1e, linewidth: 1 })
  );
  mesh.add(edges);
  mesh.userData.explode = panel.explode;
  return mesh;
};

const disposeGroup = (group) => {
  group.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) {
        o.material.forEach((m) => m.dispose());
      } else {
        o.material.dispose();
      }
    }
  });
  while (group.children.length) group.remove(group.children[0]);
};

/**
 * Three.js viewer. `box` is the output of buildBox().
 * `explode` 0..1 spreads the panels apart, `resetKey` re-centres the camera.
 */
const Box3DViewer = ({ box, color = '#c9a26d', explode = 0, resetKey = 0 }) => {
  const mountRef = useRef(null);
  const three = useRef({});

  // One-time scene setup
  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 20000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xe8dccf, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.35);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun, sun.target);
    const fill = new THREE.DirectionalLight(0xfff1e6, 0.45);
    fill.position.set(-300, 120, -200);
    scene.add(fill);
    const bottomLight = new THREE.DirectionalLight(0xfff5ee, 0.4);
    bottomLight.position.set(0, -300, 0);
    scene.add(bottomLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShadowMaterial({ opacity: 0.16, depthWrite: false })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const group = new THREE.Group();
    scene.add(group);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    // Allow full 360 degree rotation vertically and horizontally
    controls.minPolarAngle = 0.01;
    controls.maxPolarAngle = Math.PI - 0.01;

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    three.current = { scene, camera, renderer, controls, group, ground, sun, maxDim: 0 };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      disposeGroup(group);
      ground.geometry.dispose();
      ground.material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Rebuild meshes whenever geometry / colour changes
  useEffect(() => {
    const t = three.current;
    if (!t.group) return;
    const { width: W, height: H, depth: D, thickness } = box.dims;
    disposeGroup(t.group);
    box.panels.forEach((p) => t.group.add(buildMesh(p, thickness, color)));
    t.group.position.set(-W / 2, -H / 2, -D / 2);

    const maxDim = Math.max(W, H, D);
    t.ground.scale.set(maxDim * 8, maxDim * 8, 1);
    t.ground.position.y = -H / 2 - maxDim * 0.02;
    t.sun.position.set(maxDim * 1.2, maxDim * 2, maxDim * 1.0);
    const sc = t.sun.shadow.camera;
    const r = maxDim * 2.2;
    sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r;
    sc.near = 1; sc.far = maxDim * 8;
    sc.updateProjectionMatrix();
    t.sun.shadow.bias = -0.0004;
    t.sun.shadow.normalBias = Math.max(0.5, maxDim * 0.004);

    if (!t.maxDim) {
      t.camera.position.set(maxDim * 1.5, maxDim * 1.15, maxDim * 1.9);
      t.controls.target.set(0, 0, 0);
    } else if (Math.abs(t.maxDim - maxDim) > 0.001) {
      const k = maxDim / t.maxDim;
      t.camera.position.multiplyScalar(k);
    }
    t.maxDim = maxDim;
    t.camera.far = maxDim * 40;
    t.camera.updateProjectionMatrix();
    t.controls.minDistance = maxDim * 0.5;
    t.controls.maxDistance = maxDim * 10;
  }, [box, color]);

  // Explode amount (cheap, no rebuild)
  useEffect(() => {
    const t = three.current;
    if (!t.group) return;
    const spread = t.maxDim * 0.55 * explode;
    t.group.children.forEach((m) => {
      const e = m.userData.explode || [0, 0, 0];
      m.position.set(e[0] * spread, e[1] * spread, e[2] * spread);
    });
  }, [explode, box, color]);

  // Reset camera
  useEffect(() => {
    const t = three.current;
    if (!t.camera || !resetKey) return;
    const d = t.maxDim;
    t.camera.position.set(d * 1.5, d * 1.15, d * 1.9);
    t.controls.target.set(0, 0, 0);
  }, [resetKey]);

  return <div className="tool-3d-canvas" ref={mountRef} />;
};

export default Box3DViewer;
