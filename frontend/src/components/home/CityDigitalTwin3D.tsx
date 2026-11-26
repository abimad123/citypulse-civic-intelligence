import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CivicCategory, PriorityTier } from '../../types/civic';

export type TwinViewMode = 'map' | 'heat';

interface Beacon {
  id: string;
  category: CivicCategory;
  short: string;
  department: string;
  ward: string;
  priority: PriorityTier;
  confidence: number;
  gps: { lat: number; lng: number };
  /** Position in model units, placed on a road */
  x: number;
  z: number;
  color: string;
  note: string;
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const BEACONS: Beacon[] = [
  {
    id: 'b1',
    category: 'Pothole',
    short: 'Pothole',
    department: 'Roads and Public Works',
    ward: 'Model Town',
    priority: 'P1 Critical',
    confidence: 0.968,
    gps: { lat: 30.9025, lng: 75.8589 },
    x: -108,
    z: -36,
    color: '#D93F2B',
    note: 'Deep asphalt cavity, about 42 cm in radius.',
  },
  {
    id: 'b2',
    category: 'Garbage Accumulation',
    short: 'Garbage',
    department: 'Sanitation and Solid Waste',
    ward: 'Gill Road',
    priority: 'P2 High',
    confidence: 0.942,
    gps: { lat: 30.9012, lng: 75.8568 },
    x: 108,
    z: -72,
    color: '#E08A12',
    note: 'Waste pile partly blocking the lane.',
  },
  {
    id: 'b3',
    category: 'Damaged Streetlight',
    short: 'Streetlight',
    department: 'Electrical and Street Lighting',
    ward: 'Sarabha Nagar',
    priority: 'P2 High',
    confidence: 0.915,
    gps: { lat: 30.9015, lng: 75.858 },
    x: -36,
    z: 144,
    color: '#7C5CE0',
    note: 'Lamp out at the junction, no light at night.',
  },
  {
    id: 'b4',
    category: 'Water Leakage',
    short: 'Water leak',
    department: 'Water Supply and Pipelines',
    ward: 'Dugri',
    priority: 'P1 Critical',
    confidence: 0.974,
    gps: { lat: 30.9002, lng: 75.857 },
    x: 180,
    z: 36,
    color: '#1F6FE0',
    note: 'Fracture in a distribution main.',
  },
  {
    id: 'b5',
    category: 'Drainage Problem',
    short: 'Drainage',
    department: 'Drainage and Sewerage',
    ward: 'Focal Point',
    priority: 'P3 Medium',
    confidence: 0.887,
    gps: { lat: 30.9025, lng: 75.8585 },
    x: 36,
    z: -180,
    color: '#139A6E',
    note: 'Storm drain blocked by sediment, with backflow.',
  },
];

const priorityWeight = (p: PriorityTier): number => {
  if (String(p).startsWith('P1')) return 1;
  if (String(p).startsWith('P2')) return 0.7;
  return 0.45;
};

const priorityChip = (p: PriorityTier): string => {
  if (String(p).startsWith('P1')) return 'bg-[#FDECE8] text-[#B3321F]';
  if (String(p).startsWith('P2')) return 'bg-[#FDF1DC] text-[#9A5B05]';
  return 'bg-[#EAEFF5] text-[#44546A]';
};

/* ------------------------------------------------------------------ */
/* Scene constants                                                     */
/* ------------------------------------------------------------------ */

const BG = '#EEF2F7';
const PITCH = 72; // distance between block centres
const BLOCK = 56; // block size, so roads are 16 wide
const SLAB = 560;
const GRID = 3; // blocks run from -3 to +3 on each axis
const DEFAULT_POS = new THREE.Vector3(300, 250, 300);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

const makeRng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const heatTexture = (): THREE.CanvasTexture => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(229,83,61,0.75)');
  grad.addColorStop(0.45, 'rgba(242,179,94,0.4)');
  grad.addColorStop(1, 'rgba(242,179,94,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

interface TwinApi {
  setMode: (m: TwinViewMode) => void;
  focus: (id: string) => void;
  reset: () => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const CityDigitalTwin3D: React.FC = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const apiRef = useRef<TwinApi | null>(null);
  const selectedRef = useRef<string>('b1');
  const firstFocus = useRef(true);

  const [mode, setMode] = useState<TwinViewMode>('map');
  const [selectedId, setSelectedId] = useState<string>('b1');
  const [showCam, setShowCam] = useState(true);
  const [failed, setFailed] = useState(false);

  const active = BEACONS.find((b) => b.id === selectedId) ?? BEACONS[0];

  /* ---------- build the scene once ---------- */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setFailed(true);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.Fog(BG, 560, 980);

    const camera = new THREE.PerspectiveCamera(32, 1, 10, 2000);
    camera.position.copy(DEFAULT_POS);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 160;
    controls.maxDistance = 700;
    controls.maxPolarAngle = Math.PI * 0.43;
    controls.minPolarAngle = 0.35;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.5;

    /* lights */
    scene.add(new THREE.HemisphereLight('#FFFFFF', '#C9D3E0', 1.0));
    const sun = new THREE.DirectionalLight('#FFFFFF', 1.9);
    sun.position.set(170, 280, 110);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -300;
    sun.shadow.camera.right = 300;
    sun.shadow.camera.top = 300;
    sun.shadow.camera.bottom = -300;
    sun.shadow.camera.near = 50;
    sun.shadow.camera.far = 800;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.6;
    scene.add(sun);

    const rng = makeRng(7);
    const tmpM = new THREE.Matrix4();
    const tmpC = new THREE.Color();

    /* base slab and plinth */
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(SLAB, 10, SLAB),
      new THREE.MeshStandardMaterial({ color: '#D6DDE6', roughness: 1 })
    );
    slab.position.y = -5;
    slab.receiveShadow = true;
    scene.add(slab);

    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(SLAB + 18, 8, SLAB + 18),
      new THREE.MeshStandardMaterial({ color: '#BFC9D6', roughness: 1 })
    );
    plinth.position.y = -14;
    plinth.receiveShadow = true;
    scene.add(plinth);

    /* city blocks */
    const parkKeys = new Set(['-2,1', '1,-2', '2,2', '-1,-3']);
    const waterKeys = new Set(['-3,-1', '-3,0']);
    const blocks: { x: number; z: number; kind: 'city' | 'park' | 'water' }[] = [];
    for (let i = -GRID; i <= GRID; i++) {
      for (let j = -GRID; j <= GRID; j++) {
        const key = `${i},${j}`;
        blocks.push({
          x: i * PITCH,
          z: j * PITCH,
          kind: parkKeys.has(key) ? 'park' : waterKeys.has(key) ? 'water' : 'city',
        });
      }
    }

    const pads = new THREE.InstancedMesh(
      new THREE.BoxGeometry(BLOCK, 1.6, BLOCK),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 1 }),
      blocks.length
    );
    blocks.forEach((b, n) => {
      tmpM.makeTranslation(b.x, b.kind === 'water' ? 0.55 : 0.8, b.z);
      pads.setMatrixAt(n, tmpM);
      pads.setColorAt(
        n,
        tmpC.set(b.kind === 'park' ? '#D4E8D7' : b.kind === 'water' ? '#BCD8F0' : '#F3F5F8')
      );
    });
    pads.receiveShadow = true;
    scene.add(pads);

    /* lane markings */
    const roadCenters: number[] = [];
    for (let k = -4; k <= 3; k++) roadCenters.push((k + 0.5) * PITCH);
    const dashes: { x: number; z: number; rot: number }[] = [];
    for (const c of roadCenters) {
      for (let p = -240; p <= 240; p += 18) {
        if (roadCenters.some((o) => Math.abs(p - o) < 14)) continue;
        dashes.push({ x: c, z: p, rot: Math.PI / 2 });
        dashes.push({ x: p, z: c, rot: 0 });
      }
    }
    const dashGeo = new THREE.PlaneGeometry(8, 1.1);
    dashGeo.rotateX(-Math.PI / 2);
    const dashMesh = new THREE.InstancedMesh(
      dashGeo,
      new THREE.MeshBasicMaterial({ color: '#FFFFFF' }),
      dashes.length
    );
    const q = new THREE.Quaternion();
    const one = new THREE.Vector3(1, 1, 1);
    dashes.forEach((d, n) => {
      q.setFromEuler(new THREE.Euler(0, d.rot, 0));
      tmpM.compose(new THREE.Vector3(d.x, 0.06, d.z), q, one);
      dashMesh.setMatrixAt(n, tmpM);
    });
    scene.add(dashMesh);

    /* buildings */
    interface Bld {
      x: number;
      y: number;
      z: number;
      w: number;
      h: number;
      d: number;
      base: THREE.Color;
    }
    const buildings: Bld[] = [];
    const palette = ['#FFFFFF', '#F7F8FA', '#EEF1F5', '#E4E9F0'];
    const lotOffsets: [number, number][] = [
      [-14, -14],
      [14, -14],
      [-14, 14],
      [14, 14],
    ];
    for (const b of blocks) {
      if (b.kind !== 'city') continue;
      const dist = Math.hypot(b.x, b.z) / PITCH;
      const lots = [...lotOffsets].sort(() => rng() - 0.5);
      const count = 2 + Math.floor(rng() * 3);
      for (let n = 0; n < count; n++) {
        const [lx, lz] = lots[n];
        const w = 13 + rng() * 10;
        const d = 13 + rng() * 10;
        const maxH = Math.max(16, 80 - dist * 15);
        let h = 9 + rng() * maxH;
        if (dist < 2.6 && rng() > 0.9) h *= 1.5;
        const x = b.x + lx + (rng() - 0.5) * 3;
        const z = b.z + lz + (rng() - 0.5) * 3;
        const tone = palette[Math.min(3, Math.floor((h / 110) * 4 + rng() * 1.2))];
        buildings.push({ x, y: 1.6, z, w, h, d, base: new THREE.Color(tone) });
        if (h > 46) {
          buildings.push({
            x,
            y: 1.6 + h,
            z,
            w: w * 0.55,
            h: h * 0.22,
            d: d * 0.55,
            base: new THREE.Color('#DCE3EC'),
          });
        }
      }
    }

    const bMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.9 }),
      buildings.length
    );
    const bScale = new THREE.Vector3();
    const bPos = new THREE.Vector3();
    const qId = new THREE.Quaternion();
    buildings.forEach((b, n) => {
      bPos.set(b.x, b.y + b.h / 2, b.z);
      bScale.set(b.w, b.h, b.d);
      tmpM.compose(bPos, qId, bScale);
      bMesh.setMatrixAt(n, tmpM);
      bMesh.setColorAt(n, b.base);
    });
    bMesh.castShadow = true;
    bMesh.receiveShadow = true;
    scene.add(bMesh);

    /* trees in parks */
    const treeCount = blocks.filter((b) => b.kind === 'park').length * 14;
    const trees = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(3.4, 0),
      new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 1, flatShading: true }),
      treeCount
    );
    const greens = ['#9CCFA6', '#86BE93', '#B2DBB9'];
    let tn = 0;
    for (const b of blocks) {
      if (b.kind !== 'park') continue;
      for (let n = 0; n < 14; n++) {
        const s = 0.8 + rng() * 0.7;
        tmpM.compose(
          new THREE.Vector3(b.x + (rng() - 0.5) * 44, 1.6 + 3.2 * s, b.z + (rng() - 0.5) * 44),
          qId,
          new THREE.Vector3(s, s, s)
        );
        trees.setMatrixAt(tn, tmpM);
        trees.setColorAt(tn, tmpC.set(greens[Math.floor(rng() * greens.length)]));
        tn++;
      }
    }
    trees.castShadow = true;
    scene.add(trees);

    /* heat view: per-building heat and ground glow */
    const heat = buildings.map((b) => {
      let h = 0;
      for (const bc of BEACONS) {
        const dx = b.x - bc.x;
        const dz = b.z - bc.z;
        h += priorityWeight(bc.priority) * Math.exp(-(dx * dx + dz * dz) / (2 * 45 * 45));
      }
      return Math.min(1, h);
    });
    const amber = new THREE.Color('#F2B35E');
    const red = new THREE.Color('#E5533D');

    const applyMode = (m: TwinViewMode) => {
      buildings.forEach((b, n) => {
        tmpC.copy(b.base);
        if (m === 'heat' && heat[n] > 0.04) {
          const h = heat[n];
          if (h < 0.5) tmpC.lerp(amber, h * 2 * 0.9);
          else tmpC.copy(amber).lerp(red, (h - 0.5) * 2);
        }
        bMesh.setColorAt(n, tmpC);
      });
      if (bMesh.instanceColor) bMesh.instanceColor.needsUpdate = true;
      heatGroup.visible = m === 'heat';
    };

    const heatGroup = new THREE.Group();
    const heatTex = heatTexture();
    BEACONS.forEach((b) => {
      const size = 110 + priorityWeight(b.priority) * 90;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({
          map: heatTex,
          transparent: true,
          depthWrite: false,
        })
      );
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(b.x, 1.9, b.z);
      heatGroup.add(plane);
    });
    heatGroup.visible = false;
    scene.add(heatGroup);

    /* beacons */
    const beaconObjs = BEACONS.map((b) => {
      const color = new THREE.Color(b.color);
      const g = new THREE.Group();
      g.position.set(b.x, 0, b.z);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(6, 24, 16),
        new THREE.MeshBasicMaterial({ color })
      );
      head.add(new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12), new THREE.MeshBasicMaterial({ color: '#FFFFFF' })));
      head.position.y = 48;

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 46, 8),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 })
      );
      stem.position.y = 24;

      const dot = new THREE.Mesh(new THREE.CircleGeometry(3, 24), new THREE.MeshBasicMaterial({ color }));
      dot.rotation.x = -Math.PI / 2;
      dot.position.y = 0.12;

      const rings = [0, 1].map(() => {
        const r = new THREE.Mesh(
          new THREE.RingGeometry(5.6, 6.6, 48),
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        );
        r.rotation.x = -Math.PI / 2;
        r.position.y = 0.15;
        g.add(r);
        return r;
      });

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(13, 12, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      hit.position.y = 48;
      hit.userData.id = b.id;

      g.add(head, stem, dot, hit);
      scene.add(g);
      return { id: b.id, x: b.x, z: b.z, head, hit, rings };
    });
    const hitTargets = beaconObjs.map((o) => o.hit);

    /* camera goals (fly-to and reset) */
    let goalTarget: THREE.Vector3 | null = null;
    let goalPos: THREE.Vector3 | null = null;
    let autoResume = true;
    let resumeTimer: number | undefined;

    controls.addEventListener('start', () => {
      goalTarget = null;
      goalPos = null;
      controls.autoRotate = false;
      window.clearTimeout(resumeTimer);
    });
    controls.addEventListener('end', () => {
      if (!autoResume || reduceMotion) return;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        controls.autoRotate = true;
      }, 5000);
    });

    /* picking */
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (e: PointerEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(hitTargets, false);
      return hits.length ? (hits[0].object.userData.id as string) : null;
    };

    let downX = 0;
    let downY = 0;
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onUp = (e: PointerEvent) => {
      renderer.domElement.style.cursor = pick(e) ? 'pointer' : 'grab';
      if (Math.hypot(e.clientX - downX, e.clientY - downY) < 5) {
        const id = pick(e);
        if (id) setSelectedId(id);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.buttons) return;
      renderer.domElement.style.cursor = pick(e) ? 'pointer' : 'grab';
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);

    /* sizing and visibility */
    let width = 1;
    let height = 1;
    const resize = () => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.setViewOffset(width, height, 0, Math.round(height * 0.06), width, height);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    /* api for React state */
    apiRef.current = {
      setMode: applyMode,
      focus: (id) => {
        const b = BEACONS.find((x) => x.id === id);
        if (!b) return;
        goalTarget = new THREE.Vector3(b.x, 0, b.z);
        const dir = camera.position.clone().sub(controls.target).normalize();
        goalPos = goalTarget.clone().addScaledVector(dir, 300);
        controls.autoRotate = false;
        autoResume = false;
      },
      reset: () => {
        goalTarget = DEFAULT_TARGET.clone();
        goalPos = DEFAULT_POS.clone();
        autoResume = true;
        controls.autoRotate = !reduceMotion;
      },
    };

    /* render loop */
    const clock = new THREE.Clock();
    const labelPos = new THREE.Vector3();
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const t = reduceMotion ? 0 : clock.getElapsedTime();

      if (goalTarget && goalPos) {
        const prev = controls.target.clone();
        controls.target.lerp(goalTarget, 0.08);
        camera.position.add(controls.target.clone().sub(prev));
        camera.position.lerp(goalPos, 0.08);
        if (controls.target.distanceTo(goalTarget) < 0.5 && camera.position.distanceTo(goalPos) < 1) {
          goalTarget = null;
          goalPos = null;
        }
      }

      beaconObjs.forEach((o, i) => {
        const sel = o.id === selectedRef.current;
        const y = 48 + Math.sin(t * 2 + i) * 2;
        o.head.position.y = y;
        o.hit.position.y = y;
        o.head.scale.setScalar(THREE.MathUtils.lerp(o.head.scale.x, sel ? 1.4 : 1, 0.15));
        o.rings.forEach((r, k) => {
          const ph = (t * 0.6 + k * 0.5 + i * 0.13) % 1;
          r.scale.setScalar(1 + ph * (sel ? 3.2 : 2.2));
          (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * (sel ? 0.75 : 0.45);
        });

        const el = labelRefs.current[o.id];
        if (el) {
          labelPos.set(o.x, y + 12, o.z).project(camera);
          if (labelPos.z > 1) {
            el.style.display = 'none';
          } else {
            el.style.display = 'block';
            el.style.transform = `translate(${(labelPos.x * 0.5 + 0.5) * width}px, ${(-labelPos.y * 0.5 + 0.5) * height
              }px) translate(-50%, -100%)`;
          }
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resumeTimer);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointermove', onMove);
      controls.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      heatTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      apiRef.current = null;
    };
  }, []);

  /* ---------- sync React state into the scene ---------- */
  useEffect(() => {
    apiRef.current?.setMode(mode);
  }, [mode]);

  useEffect(() => {
    selectedRef.current = selectedId;
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    apiRef.current?.focus(selectedId);
  }, [selectedId]);

  const handleReset = useCallback(() => {
    apiRef.current?.reset();
  }, []);

  const focusRing =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4FE0]';

  return (
    <div className="relative h-[600px] w-full select-none overflow-hidden rounded-xl border border-[#D5DCE4] bg-[#EEF2F7] text-[#0F1B2A]">
      <div ref={hostRef} className="absolute inset-0" />

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-[#44546A]">
          The 3D view needs WebGL, which is not available in this browser. Try another browser or
          turn on hardware acceleration.
        </div>
      )}

      {/* pin labels, positioned from the render loop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {BEACONS.map((b) => {
          const sel = b.id === selectedId;
          return (
            <div
              key={b.id}
              ref={(el) => {
                labelRefs.current[b.id] = el;
              }}
              className="absolute left-0 top-0 hidden will-change-transform"
            >
              <span
                className={`block whitespace-nowrap rounded-md border bg-white px-2 py-0.5 text-xs font-semibold shadow-sm ${sel ? 'text-[#0F1B2A]' : 'border-[#D5DCE4] text-[#44546A]'
                  }`}
                style={sel ? { borderColor: b.color } : undefined}
              >
                {b.short}
              </span>
            </div>
          );
        })}
      </div>

      {/* top left: title */}
      <div className="pointer-events-none absolute left-4 top-4 max-w-[16rem]">
        <p className="text-sm font-semibold">India Smart City 3D Twin</p>
        <p className="mt-0.5 text-xs leading-snug text-[#5B6B7C]">
          Interactive urban sector model. Drag to rotate, select a pin to inspect the report.
        </p>
      </div>

      {/* top right: view controls */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <div
          role="group"
          aria-label="View mode"
          className="flex rounded-lg border border-[#D5DCE4] bg-white/90 p-0.5 backdrop-blur"
        >
          {(
            [
              ['map', 'Map'],
              ['heat', 'Heatmap'],
            ] as [TwinViewMode, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              aria-pressed={mode === key}
              onClick={() => setMode(key)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${focusRing} ${mode === key ? 'bg-[#0F1B2A] text-white' : 'text-[#44546A] hover:bg-[#EEF2F7]'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={handleReset}
          className={`rounded-lg border border-[#D5DCE4] bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#44546A] backdrop-blur transition-colors hover:text-[#0F1B2A] ${focusRing}`}
        >
          Reset view
        </button>
      </div>

      {/* bottom left: report selector */}
      <div className="absolute bottom-4 left-4 hidden max-w-[15rem] flex-wrap gap-1.5 sm:flex">
        {BEACONS.map((b) => (
          <button
            key={b.id}
            aria-pressed={b.id === selectedId}
            onClick={() => setSelectedId(b.id)}
            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium backdrop-blur transition-colors ${focusRing} ${b.id === selectedId
                ? 'border-[#0F1B2A] bg-white text-[#0F1B2A]'
                : 'border-[#D5DCE4] bg-white/80 text-[#44546A] hover:border-[#9AA8B8]'
              }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
            {b.short}
          </button>
        ))}
      </div>

      {/* bottom right: report detail */}
      <div className="absolute bottom-4 right-4 w-[min(19rem,calc(100%-2rem))] rounded-xl border border-[#D5DCE4] bg-white/95 p-4 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold leading-tight">{active.category}</h3>
            <p className="mt-0.5 text-xs text-[#5B6B7C]">{active.ward}</p>
          </div>
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${priorityChip(active.priority)}`}
          >
            {active.priority}
          </span>
        </div>

        {/* illustrative detection frame */}
        <div className="relative mt-3 h-20 overflow-hidden rounded-lg border border-[#E3E8EE] bg-[#F4F6F9]">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(#E3E8EE 1px, transparent 1px), linear-gradient(90deg, #E3E8EE 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />
          {showCam && (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 55%, ${active.color}66 0%, ${active.color}22 40%, transparent 70%)`,
              }}
            />
          )}
          <div
            className="absolute inset-x-8 inset-y-3 rounded border-2 border-dashed"
            style={{ borderColor: active.color }}
          >
            <span
              className="absolute -top-px left-0 -translate-y-full rounded-t px-1.5 py-px text-[10px] font-semibold text-white"
              style={{ backgroundColor: active.color }}
            >
              {active.short} {(active.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#7A8999]">
          <span>Illustrative detection frame</span>
          <button
            aria-pressed={showCam}
            onClick={() => setShowCam((v) => !v)}
            className={`font-semibold text-[#1F4FE0] hover:underline ${focusRing}`}
          >
            {showCam ? 'Hide' : 'Show'} attention map
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[#44546A]">{active.note}</p>

        <dl className="mt-3 space-y-1.5 border-t border-[#E3E8EE] pt-3 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-[#5B6B7C]">Department</dt>
            <dd className="text-right font-medium">{active.department}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#5B6B7C]">Location</dt>
            <dd className="cp-mono font-mono tabular-nums">
              {active.gps.lat.toFixed(4)}, {active.gps.lng.toFixed(4)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#5B6B7C]">Confidence</dt>
            <dd className="flex items-center gap-2">
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[#E3E8EE]">
                <span
                  className="block h-full rounded-full bg-[#1F4FE0]"
                  style={{ width: `${active.confidence * 100}%` }}
                />
              </span>
              <span className="font-semibold tabular-nums">
                {(active.confidence * 100).toFixed(1)}%
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};