'use client';
import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { profiles, type Station } from '@/lib/content';

export type SceneApi = {
  setStations: (items: Station[]) => void;
  focus: (id: string) => void;
  reset: () => void;
  enter: () => void;
  zoom: (factor: number) => void;
  setPaused: (paused: boolean) => void;
  setLowPower: (low: boolean) => void;
  setJourney: (progress: number) => void;
};
type Props = {
  apiRef: RefObject<SceneApi | null>;
  onReady: () => void;
  onSelect: (station: Station) => void;
  onError: (message: string) => void;
  guided?: boolean;
};
const assetNames = [
  'floor',
  'wall',
  'trim',
  'column',
  'computer',
  'access',
  'light',
  'cable',
  'vent',
  'rail',
] as const;
const stationPositions = [
  [-4.3, 0, -3.4],
  [-1.45, 0, -3.4],
  [1.45, 0, -3.4],
  [4.3, 0, -3.4],
  [-4.3, 0, 1.4],
  [-1.45, 0, 1.4],
  [1.45, 0, 1.4],
  [4.3, 0, 1.4],
];

export default function WorkspaceScene({
  apiRef,
  onReady,
  onSelect,
  onError,
  guided = false,
}: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onReady, onSelect, onError });
  useEffect(() => {
    callbacks.current = { onReady, onSelect, onError };
  }, [onReady, onSelect, onError]);

  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: 'low-power',
        alpha: false,
      });
    } catch {
      callbacks.current.onError(
        'Your browser could not start 3D. You can browse every profile and project in the link view.',
      );
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x080c11);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute(
      'aria-label',
      '3D sci-fi developer workspace. Drag to orbit, scroll to zoom, or use arrow keys while focused. Select labelled computer stations or use the station buttons.',
    );
    host.appendChild(canvas);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080c11, 0.018);
    const camera = new THREE.PerspectiveCamera(41, 1, 0.1, 90);
    const homePosition = new THREE.Vector3(10.6, 8.8, 13.3);
    if (host.clientWidth < 650) homePosition.multiplyScalar(1.3);
    const homeTarget = new THREE.Vector3(0, 1.3, 0);
    camera.position.copy(homePosition);
    const controls = new OrbitControls(camera, canvas);
    controls.enabled = !guided;
    if (guided) canvas.style.touchAction = 'pan-y';
    controls.target.copy(homeTarget);
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 28;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2 - 0.06;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.65;
    controls.update();

    scene.add(new THREE.HemisphereLight(0xc4d9f1, 0x202630, 2));
    const key = new THREE.DirectionalLight(0xb5d8ff, 3.7);
    key.position.set(2, 12, 7);
    scene.add(key);
    const side = new THREE.DirectionalLight(0x72e5d4, 2.2);
    side.position.set(-7, 4, -6);
    scene.add(side);
    const amber = new THREE.PointLight(0xffc487, 24, 22, 2);
    amber.position.set(5, 4, 1);
    scene.add(amber);
    const cyan = new THREE.PointLight(0x77d7ee, 35, 20, 2);
    cyan.position.set(-4, 4, -2);
    scene.add(cyan);

    let disposed = false,
      loaded = false,
      paused = matchMedia('(prefers-reduced-motion: reduce)').matches,
      low = false;
    let raf = 0,
      lastFrame = 0,
      wakeUntil = 0,
      activeTime = 0;
    let items: Station[] = profiles;
    let focusedId = '',
      hoveredId = '';
    let travel: { position: THREE.Vector3; target: THREE.Vector3 } | null = null;
    const room = new THREE.Group();
    scene.add(room);
    const labels: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
    const stations: THREE.Group[] = [];
    const labelTextures: THREE.Texture[] = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pressX = 0,
      pressY = 0;
    const disposableTextures = new Set<THREE.Texture>();
    const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x88e7db });
    const leds = new THREE.Group();
    room.add(leds);

    const wake = () => {
      wakeUntil = performance.now() + 1400;
    };
    const go = (position: THREE.Vector3, target: THREE.Vector3) => {
      travel = { position, target };
      wake();
    };
    const reset = () => {
      focusedId = '';
      go(homePosition.clone(), homeTarget.clone());
    };

    function createLabel(item: Station, index: number) {
      const surface = document.createElement('canvas');
      surface.width = 512;
      surface.height = 176;
      const ctx = surface.getContext('2d')!;
      ctx.fillStyle = '#101a23';
      ctx.fillRect(0, 0, 512, 176);
      ctx.fillStyle = item.color;
      ctx.fillRect(0, 0, 5, 176);
      ctx.font = '500 19px monospace';
      ctx.fillText(
        `0${index + 1} / ${item.label.split(' · ')[0].toUpperCase().slice(0, 31)}`,
        25,
        35,
      );
      ctx.fillStyle = '#f3f5f6';
      ctx.font = '600 43px sans-serif';
      ctx.fillText(item.name, 24, 97, 460);
      ctx.fillStyle = '#8ca0ad';
      ctx.font = '20px monospace';
      ctx.fillText('SELECT TO CONNECT', 25, 144);
      const texture = new THREE.CanvasTexture(surface);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }
    function setStations(next: Station[]) {
      items = next;
      focusedId = '';
      hoveredId = '';
      labels.forEach((label, i) => {
        labelTextures[i]?.dispose();
        label.visible = i < items.length;
        stations[i].visible = i < items.length;
        if (!items[i]) return;
        const texture = createLabel(items[i], i);
        labelTextures[i] = texture;
        label.material.map = texture;
        label.material.needsUpdate = true;
        label.userData.id = items[i].id;
        stations[i].userData.id = items[i].id;
      });
      wake();
    }
    apiRef.current = {
      setJourney(progress) {
        const poses = [
          [new THREE.Vector3(3, 3.3, 5.9), new THREE.Vector3(-1, 2, -3)],
          [new THREE.Vector3(-1, 2.6, 1), new THREE.Vector3(-4.3, 1.8, -3.4)],
          [new THREE.Vector3(5, 2.9, 1.6), new THREE.Vector3(1.45, 1.9, -3.4)],
          [new THREE.Vector3(4.5, 4.2, 7), new THREE.Vector3(1.45, 1.8, 1.4)],
          [homePosition.clone(), homeTarget.clone()],
        ];
        const scaled = THREE.MathUtils.clamp(progress, 0, 1) * 4;
        const index = Math.min(Math.floor(scaled), 3);
        const t = THREE.MathUtils.smoothstep(scaled - index, 0, 1);
        const position = poses[index][0].clone().lerp(poses[index + 1][0], t);
        if (host.clientWidth < 650) position.add(new THREE.Vector3(0, 1.5, 4));
        go(position, poses[index][1].clone().lerp(poses[index + 1][1], t));
      },
      setStations,
      focus(id) {
        const index = items.findIndex((s) => s.id === id);
        if (index < 0 || index >= stationPositions.length) return;
        focusedId = id;
        const p = stationPositions[index];
        go(new THREE.Vector3(p[0] + 1.6, 3.5, p[2] + 5.3), new THREE.Vector3(p[0], 1.55, p[2]));
      },
      reset,
      enter() {
        focusedId = '';
        go(new THREE.Vector3(0, 2.5, 5.4), new THREE.Vector3(0, 1.7, -3.4));
      },
      zoom(factor) {
        const offset = camera.position.clone().sub(controls.target).multiplyScalar(factor);
        offset.clampLength(2, 28);
        go(controls.target.clone().add(offset), controls.target.clone());
      },
      setPaused(value) {
        paused = value;
        wake();
      },
      setLowPower(value) {
        low = value;
        renderer.setPixelRatio(value ? 1 : Math.min(devicePixelRatio, 1.5));
        resize();
        wake();
      },
    };

    const resize = () => {
      const w = host.clientWidth,
        h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      wake();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const loader = new GLTFLoader();
    async function buildRoom() {
      try {
        const assets = await Promise.all(
          assetNames.map(
            async (name) => [name, (await loader.loadAsync(`/models/${name}.gltf`)).scene] as const,
          ),
        );
        const prototypes = Object.fromEntries(assets) as Record<
          (typeof assetNames)[number],
          THREE.Group
        >;
        if (disposed) {
          assets.forEach(([, group]) => disposeObject(group));
          return;
        }
        function place(
          name: (typeof assetNames)[number],
          x: number,
          y: number,
          z: number,
          rotation = 0,
          scale = 1,
        ) {
          const object = prototypes[name].clone(true);
          object.position.set(x, y, z);
          object.rotation.y = rotation;
          object.scale.setScalar(scale);
          room.add(object);
          return object;
        }
        // The room uses authored, UV-mapped meshes, not generated placeholder geometry.
        for (let x = -4; x <= 4; x += 4) for (let z = -4; z <= 4; z += 4) place('floor', x, 0, z);
        for (let x = -4; x <= 4; x += 4) {
          place('wall', x, 0, -8, Math.PI / 2);
          place('trim', x, 0, -8, Math.PI / 2);
        }
        for (let z = -4; z <= 4; z += 4) {
          place('wall', -4, 0, z);
          place('trim', -4, 0, z);
        }
        [
          [-6, -6],
          [-6, -2],
          [-6, 2],
          [-6, 6],
          [6, -6],
          [2, -6],
          [-2, -6],
        ].forEach(([x, z]) => place('column', x, 0, z));
        for (let i = 0; i < 8; i++) {
          const [x, y, z] = stationPositions[i];
          const computer = place('computer', x, y, z, 0, 1.15);
          stations.push(computer);
          const label = new THREE.Mesh(
            new THREE.PlaneGeometry(2.2, 0.756),
            new THREE.MeshBasicMaterial({
              transparent: true,
              side: THREE.DoubleSide,
              depthTest: true,
              toneMapped: false,
            }),
          );
          label.position.set(x, 2.35, z);
          room.add(label);
          labels.push(label);
          const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.025), ledMaterial);
          strip.rotation.x = -Math.PI / 2;
          strip.position.set(x, 0.012, z + 0.8);
          leds.add(strip);
        }
        place('access', 0, 0.1, -6.08, Math.PI / 2, 1.9);
        place('cable', -2, 0.015, 2, 0, 0.8);
        place('cable', 2, 0.015, -1, Math.PI / 2, 0.8);
        place('vent', -4, 0.01, 4);
        place('vent', 4, 0.01, 4);
        place('rail', 6, 0, 6);
        place('rail', 6, 0, 2);
        [-4, 0, 4].forEach((x) => {
          place('light', x + 0.6, 4.4, -5.6, Math.PI / 2);
          const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.05), ledMaterial);
          glow.position.set(x, 4.1, -5.95);
          room.add(glow);
        });
        // Centre wall identity panel, attached to the authored room rather than a floating hero object.
        const identityCanvas = document.createElement('canvas');
        identityCanvas.width = 1024;
        identityCanvas.height = 320;
        const ctx = identityCanvas.getContext('2d')!;
        ctx.fillStyle = '#0b141c';
        ctx.fillRect(0, 0, 1024, 320);
        ctx.fillStyle = '#89e6d7';
        ctx.font = '25px monospace';
        ctx.fillText('HARSHIT GUPTA / PERSONAL NETWORK', 48, 66);
        ctx.fillStyle = '#ecf3f5';
        ctx.font = 'bold 90px sans-serif';
        ctx.fillText('BUILD. LEARN. REPEAT.', 45, 195);
        ctx.fillStyle = '#8099a7';
        ctx.font = '24px monospace';
        ctx.fillText('CODE  /  OPEN SOURCE  /  SYSTEMS', 48, 264);
        const identityTexture = new THREE.CanvasTexture(identityCanvas);
        identityTexture.colorSpace = THREE.SRGBColorSpace;
        disposableTextures.add(identityTexture);
        const screen = new THREE.Mesh(
          new THREE.PlaneGeometry(6.2, 1.94),
          new THREE.MeshBasicMaterial({ map: identityTexture, toneMapped: false }),
        );
        screen.position.set(0.3, 3.5, -5.96);
        room.add(screen);
        prototypes.floor.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => {
              for (const value of Object.values(m))
                if (value instanceof THREE.Texture) disposableTextures.add(value);
            });
          }
        });
        loaded = true;
        setStations(items);
        callbacks.current.onReady();
        wake();
      } catch {
        if (!disposed)
          callbacks.current.onError(
            'The 3D assets could not be loaded. Every profile and project is available in the link view.',
          );
      }
    }
    void buildRoom();

    function pick(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(
        [...labels.filter((l) => l.visible), ...stations.filter((s) => s.visible)],
        true,
      );
      if (!hits.length) return '';
      let object: THREE.Object3D | null = hits[0].object;
      while (object && !object.userData.id) object = object.parent;
      return (object?.userData.id as string) ?? '';
    }
    const pointerDown = (e: PointerEvent) => {
      pressX = e.clientX;
      pressY = e.clientY;
      travel = null;
      wake();
    };
    const pointerMove = (e: PointerEvent) => {
      hoveredId = pick(e);
      canvas.style.cursor = hoveredId ? 'pointer' : e.buttons ? 'grabbing' : 'grab';
      wake();
    };
    const pointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - pressX, e.clientY - pressY) > 7) return;
      const id = pick(e);
      const item = items.find((i) => i.id === id);
      if (item) callbacks.current.onSelect(item);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Home') {
        e.preventDefault();
        reset();
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        apiRef.current?.zoom(0.85);
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        apiRef.current?.zoom(1.18);
        return;
      }
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      travel = null;
      const spherical = new THREE.Spherical().setFromVector3(
        camera.position.clone().sub(controls.target),
      );
      if (e.key === 'ArrowLeft') spherical.theta -= 0.12;
      if (e.key === 'ArrowRight') spherical.theta += 0.12;
      if (e.key === 'ArrowUp') spherical.phi -= 0.08;
      if (e.key === 'ArrowDown') spherical.phi += 0.08;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.25, Math.PI / 2 - 0.06);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update();
      wake();
    };
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('wheel', wake, { passive: true });
    canvas.addEventListener('keydown', onKey);
    controls.addEventListener('start', wake);
    controls.addEventListener('change', wake);
    const onContextLost = (event: Event) => {
      event.preventDefault();
      callbacks.current.onError(
        'The browser paused 3D rendering. All links remain available in the link view.',
      );
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    let inView = true;
    const intersection = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      wake();
    });
    intersection.observe(host);

    function frame(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden || !inView || now - lastFrame < 1000 / (low ? 20 : 30)) return;
      const delta = Math.min((now - lastFrame) / 1000, 0.06);
      lastFrame = now;
      if (paused && !travel && now > wakeUntil) return;
      if (!paused) activeTime += delta;
      if (travel) {
        const alpha = 1 - Math.exp(-5 * delta);
        camera.position.lerp(travel.position, alpha);
        controls.target.lerp(travel.target, alpha);
        if (
          camera.position.distanceTo(travel.position) < 0.015 &&
          controls.target.distanceTo(travel.target) < 0.015
        )
          travel = null;
      }
      controls.update();
      if (loaded) {
        labels.forEach((label, i) => {
          if (!items[i]) return;
          label.quaternion.copy(camera.quaternion);
          const isActive = focusedId === items[i].id || hoveredId === items[i].id;
          const target = isActive ? 1.08 : 1;
          label.scale.lerp(new THREE.Vector3(target, target, target), 0.16);
          label.position.y = 2.35 + (paused ? 0 : Math.sin(activeTime * 0.75 + i * 0.6) * 0.035);
          label.material.color.set(isActive ? 0xffffff : 0xc4d3dc);
        });
        ledMaterial.color.setRGB(
          0.36,
          0.78 + (paused ? 0 : Math.sin(activeTime * 0.8) * 0.06),
          0.7,
        );
      }
      renderer.render(scene, camera);
      canvas.dataset.drawCalls = String(renderer.info.render.calls);
      canvas.dataset.triangles = String(renderer.info.render.triangles);
      canvas.dataset.frameCap = String(low ? 20 : 30);
      canvas.dataset.renderedFrames = String(Number(canvas.dataset.renderedFrames ?? 0) + 1);
    }
    raf = requestAnimationFrame(frame);
    function disposeObject(object: THREE.Object3D) {
      object.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose();
            m.dispose();
          });
        }
      });
    }
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      controls.dispose();
      apiRef.current = null;
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('wheel', wake);
      canvas.removeEventListener('keydown', onKey);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      disposeObject(scene);
      labelTextures.forEach((t) => t.dispose());
      disposableTextures.forEach((t) => t.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, [apiRef, guided]);
  return <div className="scene-mount" ref={mount} />;
}
