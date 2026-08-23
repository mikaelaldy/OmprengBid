import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, Trophy, RotateCcw, Zap, Target } from 'lucide-react';
import { Project } from '../types';

interface ThreeStackEngineProps {
  project: Project;
  rank1Project?: Project;
  isPaused?: boolean;
  onOpenTutorial?: () => void;
  onGameOver: (stats: {
    score: number;
    traysStacked: number;
    maxCombo: number;
    perfectDrops: number;
    heightMeters: number;
  }) => void;
  onScoreUpdate?: (currentScore: number, trays: number, comboMultiplier: number) => void;
}

interface TrayData {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  sizeX: number;
  sizeZ: number;
}

interface DebrisData {
  mesh: THREE.Mesh;
  vy: number;
  vx: number;
  vz: number;
  rotVx: number;
  rotVz: number;
  opacity: number;
}

export const ThreeStackEngine: React.FC<ThreeStackEngineProps> = ({
  project,
  rank1Project,
  isPaused = false,
  onOpenTutorial,
  onGameOver,
  onScoreUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [traysStacked, setTraysStacked] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [maxCombo, setMaxCombo] = useState(1);
  const [perfectDropsCount, setPerfectDropsCount] = useState(0);
  const [comboAlert, setComboAlert] = useState<{ title: string; subtitle?: string; isRestore?: boolean } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // References for Three.js engine
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const omprengTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Game state refs for render loop
  const isPausedRef = useRef<boolean>(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const stackRef = useRef<TrayData[]>([]);
  const debrisRef = useRef<DebrisData[]>([]);
  const activeTrayRef = useRef<{
    mesh: THREE.Mesh;
    axis: 'x' | 'z';
    dir: number;
    speed: number;
    sizeX: number;
    sizeZ: number;
    y: number;
  } | null>(null);
  const cameraTargetY = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const comboStreakRef = useRef<number>(0);
  const comboMultiplierRef = useRef<number>(1);
  const maxComboRef = useRef<number>(1);
  const perfectDropsRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const traysStackedRef = useRef<number>(0);

  const BASE_POINTS_PER_TRAY = 100;
  const TRAY_HEIGHT = 0.5;
  const INITIAL_SIZE_X = 3.6;
  const INITIAL_SIZE_Z = 2.6;
  const MOVE_BOUNDS = 4.8;

  // Generate procedural realistic 5-compartment stainless steel texture
  const createOmprengTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    // Stainless steel brushed gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 384);
    bgGrad.addColorStop(0, '#E6ECF2');
    bgGrad.addColorStop(0.3, '#CBD5E1');
    bgGrad.addColorStop(0.5, '#F1F5F9');
    bgGrad.addColorStop(0.8, '#94A3B8');
    bgGrad.addColorStop(1, '#CBD5E1');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 384);

    // Subtle brushed metal streaks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 40; i++) {
      const y = Math.random() * 384;
      ctx.fillRect(0, y, 512, 1 + Math.random() * 2);
    }

    // Outer rim border
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 492, 364);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, 484, 356);

    // 5 Compartments layout (Standard Indonesian MBG 5-Sekat Tray):
    // Left: Big Main Compartment (Rice / Nasi)
    ctx.fillStyle = 'rgba(7, 30, 73, 0.08)';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // 1. Nasi / Rice section (left side)
    roundRect(26, 26, 210, 332, 14);

    // 2. Lauk Utama (Protein / Chicken / Fish - top middle)
    roundRect(250, 26, 140, 155, 12);

    // 3. Sayur (Veggies - bottom middle)
    roundRect(250, 195, 140, 163, 12);

    // 4. Buah (Fruit - top right)
    roundRect(402, 26, 84, 155, 10);

    // 5. Susu / Sambal cup (Round - bottom right)
    ctx.beginPath();
    ctx.arc(444, 276, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Embossed Institutional Stamp in the Rice section
    ctx.fillStyle = 'rgba(7, 30, 73, 0.28)';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OMPRENG • BID', 131, 185);
    ctx.font = '9px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SUS 304 STAINLESS STEEL', 131, 202);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  };

  // Create tray mesh with authentic stainless steel material
  const createTrayMesh = (sizeX: number, sizeZ: number, isBase = false): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry(sizeX, TRAY_HEIGHT, sizeZ);
    
    // Materials for 6 faces: Right, Left, Top, Bottom, Front, Back
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0xCBD5E1,
      metalness: 0.85,
      roughness: 0.25,
    });

    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0xE2E8F0,
      map: omprengTextureRef.current,
      metalness: 0.8,
      roughness: 0.28,
    });

    const materials = [
      sideMaterial, // +X
      sideMaterial, // -X
      topMaterial,  // +Y (Top face with 5 compartments)
      sideMaterial, // -Y
      sideMaterial, // +Z
      sideMaterial, // -Z
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (isBase) {
      // Base pedestal badge
      const rim = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0x071E49, linewidth: 1.5 })
      );
      mesh.add(rim);
    }

    return mesh;
  };

  // Trigger golden spark confetti for perfect drops
  const triggerPerfectSparks = (x: number, y: number) => {
    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.45, x: 0.5 },
        colors: ['#D1B06C', '#E5D5B4', '#071E49', '#FFFFFF'],
        ticks: 90,
        gravity: 1.2,
        scalar: 0.8,
      });
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF8FAFC);
    sceneRef.current = scene;

    // 2. Camera (2.5D Isometric Orthographic)
    const aspect = width / height;
    const d = 5.8;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    camera.position.set(18, 18, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting (Crisp institutional studio lights)
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.85);
    dirLight.position.set(15, 25, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    const dLight = 10;
    dirLight.shadow.camera.left = -dLight;
    dirLight.shadow.camera.right = dLight;
    dirLight.shadow.camera.top = dLight;
    dirLight.shadow.camera.bottom = -dLight;
    scene.add(dirLight);

    // Subtle blue rim light
    const rimLight = new THREE.DirectionalLight(0x93C5FD, 0.35);
    rimLight.position.set(-15, 10, -15);
    scene.add(rimLight);

    // Subtle shadow catcher ground plane
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -TRAY_HEIGHT / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Texture for trays
    omprengTextureRef.current = createOmprengTexture();

    // Create Initial Base Tray (Tumpukan Dasar)
    const baseMesh = createTrayMesh(INITIAL_SIZE_X, INITIAL_SIZE_Z, true);
    baseMesh.position.set(0, 0, 0);
    scene.add(baseMesh);

    stackRef.current = [
      {
        mesh: baseMesh,
        x: 0,
        y: 0,
        z: 0,
        sizeX: INITIAL_SIZE_X,
        sizeZ: INITIAL_SIZE_Z,
      },
    ];

    // Spawn first moving tray
    spawnNextTray();

    // 5. Render & Game Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update active sliding tray
      if (activeTrayRef.current && isPlayingRef.current && !isPausedRef.current) {
        const tray = activeTrayRef.current;
        if (tray.axis === 'x') {
          tray.mesh.position.x += tray.dir * tray.speed;
          if (tray.mesh.position.x > MOVE_BOUNDS) {
            tray.mesh.position.x = MOVE_BOUNDS;
            tray.dir = -1;
          } else if (tray.mesh.position.x < -MOVE_BOUNDS) {
            tray.mesh.position.x = -MOVE_BOUNDS;
            tray.dir = 1;
          }
        } else {
          tray.mesh.position.z += tray.dir * tray.speed;
          if (tray.mesh.position.z > MOVE_BOUNDS) {
            tray.mesh.position.z = MOVE_BOUNDS;
            tray.dir = -1;
          } else if (tray.mesh.position.z < -MOVE_BOUNDS) {
            tray.mesh.position.z = -MOVE_BOUNDS;
            tray.dir = 1;
          }
        }
      }

      // Update falling debris physics
      for (let i = debrisRef.current.length - 1; i >= 0; i--) {
        const deb = debrisRef.current[i];
        deb.vy -= 18 * dt; // gravity
        deb.mesh.position.y += deb.vy * dt;
        deb.mesh.position.x += deb.vx * dt;
        deb.mesh.position.z += deb.vz * dt;
        deb.mesh.rotation.x += deb.rotVx * dt;
        deb.mesh.rotation.z += deb.rotVz * dt;
        deb.opacity = Math.max(0, deb.opacity - 0.7 * dt);

        if (deb.mesh.position.y < -12 || deb.opacity <= 0) {
          scene.remove(deb.mesh);
          debrisRef.current.splice(i, 1);
        }
      }

      // Smooth camera interpolation upward
      if (cameraRef.current) {
        const targetY = cameraTargetY.current;
        cameraRef.current.position.y += (18 + targetY - cameraRef.current.position.y) * 0.08;
        cameraRef.current.lookAt(0, targetY, 0);
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const asp = w / h;
      cameraRef.current.left = -d * asp;
      cameraRef.current.right = d * asp;
      cameraRef.current.top = d;
      cameraRef.current.bottom = -d;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Spawn the next active moving tray above the stack
  const spawnNextTray = () => {
    if (!sceneRef.current) return;
    const topTray = stackRef.current[stackRef.current.length - 1];
    const newY = topTray.y + TRAY_HEIGHT;
    const nextAxis: 'x' | 'z' = (stackRef.current.length % 2 === 1) ? 'x' : 'z';
    const baseSpeed = 0.062 + Math.min(0.045, (stackRef.current.length - 1) * 0.0015);

    const newMesh = createTrayMesh(topTray.sizeX, topTray.sizeZ);
    const startPos = -MOVE_BOUNDS;

    if (nextAxis === 'x') {
      newMesh.position.set(startPos, newY, topTray.z);
    } else {
      newMesh.position.set(topTray.x, newY, startPos);
    }

    sceneRef.current.add(newMesh);

    activeTrayRef.current = {
      mesh: newMesh,
      axis: nextAxis,
      dir: 1,
      speed: baseSpeed,
      sizeX: topTray.sizeX,
      sizeZ: topTray.sizeZ,
      y: newY,
    };

    isPlayingRef.current = true;
  };

  // Slicing and placement action
  const handleDrop = useCallback(() => {
    if (isGameOver || isPausedRef.current || !activeTrayRef.current || !sceneRef.current) return;
    if (!hasStarted) setHasStarted(true);

    const active = activeTrayRef.current;
    const topTray = stackRef.current[stackRef.current.length - 1];
    const axis = active.axis;
    const currentPos = active.mesh.position[axis];
    const prevPos = topTray[axis];
    const delta = currentPos - prevPos;
    const currentSize = axis === 'x' ? active.sizeX : active.sizeZ;

    // 1. PERFECT DROP CHECK (Within tight 0.12 units threshold, < 2px alignment)
    if (Math.abs(delta) < 0.12) {
      // Snap exact alignment
      active.mesh.position[axis] = prevPos;
      
      const newStreak = comboStreakRef.current + 1;
      const newMultiplier = newStreak;
      const newMaxCombo = Math.max(maxComboRef.current, newMultiplier);
      const newPerfect = perfectDropsRef.current + 1;
      const newTrays = traysStackedRef.current + 1;

      // Bonus points based on combo multiplier
      const bonusPoints = BASE_POINTS_PER_TRAY * newMultiplier;
      const pointsGained = BASE_POINTS_PER_TRAY + bonusPoints;
      const newScore = scoreRef.current + pointsGained;

      comboStreakRef.current = newStreak;
      comboMultiplierRef.current = newMultiplier;
      maxComboRef.current = newMaxCombo;
      perfectDropsRef.current = newPerfect;
      traysStackedRef.current = newTrays;
      scoreRef.current = newScore;

      setComboStreak(newStreak);
      setComboMultiplier(newMultiplier);
      setMaxCombo(newMaxCombo);
      setPerfectDropsCount(newPerfect);
      setTraysStacked(newTrays);
      setScore(newScore);

      if (onScoreUpdate) onScoreUpdate(newScore, newTrays, newMultiplier);

      sound.playPerfect(newStreak);
      triggerPerfectSparks(active.mesh.position.x, active.mesh.position.y);

      // Check if 5 consecutive perfect drops restores tray width
      if (newStreak > 0 && newStreak % 5 === 0) {
        sound.playRestore();
        const restoreAmount = 0.35;
        const expandedX = Math.min(INITIAL_SIZE_X, active.sizeX + restoreAmount);
        const expandedZ = Math.min(INITIAL_SIZE_Z, active.sizeZ + restoreAmount);
        active.sizeX = expandedX;
        active.sizeZ = expandedZ;

        sceneRef.current.remove(active.mesh);
        const restoredMesh = createTrayMesh(expandedX, expandedZ);
        restoredMesh.position.set(topTray.x, active.y, topTray.z);
        sceneRef.current.add(restoredMesh);
        active.mesh = restoredMesh;

        setComboAlert({
          title: `LEBAR BAKI PULIH (+${restoreAmount.toFixed(2)})`,
          subtitle: `5x Presisi Beruntun • Bonus Multiplier x${newMultiplier} (+${pointsGained} pts)`,
          isRestore: true,
        });
      } else {
        setComboAlert({
          title: newMultiplier === 1 ? 'PERFECT DROP!' : `PERFECT DROP x${newMultiplier}!`,
          subtitle: `+${pointsGained} pts (Multiplikator x${newMultiplier})`,
          isRestore: false,
        });
      }

      setTimeout(() => setComboAlert(null), 1200);

      // Add to stack
      stackRef.current.push({
        mesh: active.mesh,
        x: active.mesh.position.x,
        y: active.y,
        z: active.mesh.position.z,
        sizeX: active.sizeX,
        sizeZ: active.sizeZ,
      });

      cameraTargetY.current = (stackRef.current.length - 1) * TRAY_HEIGHT * 0.9;
      spawnNextTray();
      return;
    }

    // 2. COMPLETE MISS (Game Over)
    if (Math.abs(delta) >= currentSize) {
      isPlayingRef.current = false;
      setIsGameOver(true);
      sound.playGameOver();

      // Convert active tray into falling debris
      debrisRef.current.push({
        mesh: active.mesh,
        vy: 0,
        vx: (Math.random() - 0.5) * 4,
        vz: (Math.random() - 0.5) * 4,
        rotVx: (Math.random() - 0.5) * 8,
        rotVz: (Math.random() - 0.5) * 8,
        opacity: 1,
      });

      const finalScore = scoreRef.current;
      const finalTrays = traysStackedRef.current;
      const heightM = +(finalTrays * 0.045).toFixed(2);

      setTimeout(() => {
        onGameOver({
          score: finalScore,
          traysStacked: finalTrays,
          maxCombo: maxComboRef.current,
          perfectDrops: perfectDropsRef.current,
          heightMeters: heightM,
        });
      }, 700);

      return;
    }

    // 3. SLICE & DROP (Non-perfect placement)
    comboStreakRef.current = 0;
    comboMultiplierRef.current = 1;
    setComboStreak(0);
    setComboMultiplier(1);
    sound.playSlice();

    const overlapSize = currentSize - Math.abs(delta);
    const sliceSize = Math.abs(delta);

    let newSizeX = active.sizeX;
    let newSizeZ = active.sizeZ;
    let newPosX = active.mesh.position.x;
    let newPosZ = active.mesh.position.z;

    let slicePosX = newPosX;
    let slicePosZ = newPosZ;
    let sliceSizeX = newSizeX;
    let sliceSizeZ = newSizeZ;

    if (axis === 'x') {
      newSizeX = overlapSize;
      sliceSizeX = sliceSize;
      newPosX = prevPos + delta / 2;
      slicePosX = delta > 0 ? prevPos + overlapSize / 2 + sliceSize / 2 : prevPos - overlapSize / 2 - sliceSize / 2;
    } else {
      newSizeZ = overlapSize;
      sliceSizeZ = sliceSize;
      newPosZ = prevPos + delta / 2;
      slicePosZ = delta > 0 ? prevPos + overlapSize / 2 + sliceSize / 2 : prevPos - overlapSize / 2 - sliceSize / 2;
    }

    // Remove the old full-sized active mesh
    sceneRef.current.remove(active.mesh);

    // Create stacked trimmed mesh
    const trimmedMesh = createTrayMesh(newSizeX, newSizeZ);
    trimmedMesh.position.set(newPosX, active.y, newPosZ);
    sceneRef.current.add(trimmedMesh);

    // Create falling slice debris
    const sliceMesh = createTrayMesh(sliceSizeX, sliceSizeZ);
    sliceMesh.position.set(slicePosX, active.y, slicePosZ);
    sceneRef.current.add(sliceMesh);

    debrisRef.current.push({
      mesh: sliceMesh,
      vy: 1,
      vx: axis === 'x' ? Math.sign(delta) * 3 : (Math.random() - 0.5) * 2,
      vz: axis === 'z' ? Math.sign(delta) * 3 : (Math.random() - 0.5) * 2,
      rotVx: (Math.random() - 0.5) * 6,
      rotVz: (Math.random() - 0.5) * 6,
      opacity: 1,
    });

    const pointsGained = BASE_POINTS_PER_TRAY;
    const newScore = scoreRef.current + pointsGained;
    const newTrays = traysStackedRef.current + 1;

    scoreRef.current = newScore;
    traysStackedRef.current = newTrays;
    setScore(newScore);
    setTraysStacked(newTrays);

    if (onScoreUpdate) onScoreUpdate(newScore, newTrays, 1);

    stackRef.current.push({
      mesh: trimmedMesh,
      x: newPosX,
      y: active.y,
      z: newPosZ,
      sizeX: newSizeX,
      sizeZ: newSizeZ,
    });

    cameraTargetY.current = (stackRef.current.length - 1) * TRAY_HEIGHT * 0.9;
    spawnNextTray();
  }, [isGameOver, hasStarted, onGameOver, onScoreUpdate]);

  // Handle keyboard (Spacebar) and touch/clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleDrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDrop]);

  const targetToBeat = rank1Project ? rank1Project.bestScore : 48;
  const gapToRank1 = Math.max(0, targetToBeat - traysStacked + 1);

  return (
    <div
      className="relative w-full h-full select-none cursor-pointer overflow-hidden bg-[#F1F5F9]"
      onClick={handleDrop}
    >
      {/* Giant Minimalist Background Stack Counter */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10 select-none">
        <span className="text-slate-300/40 text-7xl sm:text-8xl md:text-9xl font-bold tabular-nums tracking-tight leading-none font-mono">
          {String(traysStacked).padStart(2, '0')}
        </span>
        <p className="text-[11px] font-medium text-slate-500 bg-white/80 border border-slate-200 px-3 py-0.5 rounded-full shadow-xs -mt-1">
          Tumpukan Baki Ompreng
        </p>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full relative z-0" />

      {/* Top HUD: Current Project & Score Display */}
      <div className="absolute top-4 inset-x-4 flex items-start justify-between pointer-events-none z-20">
        {/* Left: Minimalist Project Badge */}
        <div className="bg-[#071E49] text-white px-3.5 py-2 rounded-xl shadow-xs border border-slate-700 flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D1B06C] animate-pulse shrink-0" />
          <div>
            <div className="text-[10px] text-[#D1B06C] font-medium">
              Mewakili Proyek
            </div>
            <div className="text-xs sm:text-sm font-semibold tracking-tight truncate max-w-[150px] sm:max-w-[220px]">
              {project.name}
            </div>
          </div>
        </div>

        {/* Center/Right: Target / Score Indicator */}
        <div className="flex flex-col items-end space-y-1.5">
          <div className="bg-white/90 backdrop-blur-xs border border-slate-200 shadow-xs px-3.5 py-2 rounded-xl text-right">
            <div className="text-[10px] text-slate-500 font-medium">
              Skor Poin
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#071E49] font-mono leading-none flex items-baseline justify-end space-x-1 mt-0.5">
              <span>{score.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">pts</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              {traysStacked} baki ({(traysStacked * 0.045).toFixed(2)}m)
            </div>
          </div>

          {/* Overtake #1 indicator */}
          {rank1Project && traysStacked < rank1Project.bestScore && (
            <div className="bg-slate-800/90 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-xs">
              <Target className="w-3 h-3 text-[#D1B06C]" />
              <span>
                <strong className="text-[#D1B06C] font-semibold">{gapToRank1}</strong> baki menuju #1
              </span>
            </div>
          )}

          {rank1Project && traysStacked >= rank1Project.bestScore && (
            <div className="bg-[#D1B06C] text-[#071E49] px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs">
              <Trophy className="w-3 h-3" />
              <span>Rekor Juara #1 Terlampaui!</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Right: Combo Multiplier Card */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2 pointer-events-none z-20">
        <div className="bg-white/95 backdrop-blur-xs p-3 sm:p-3.5 rounded-xl shadow-sm border border-slate-200 min-w-[150px]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-slate-500">
              Multiplikator Kombo
            </p>
            {comboStreak > 0 && (
              <span className="text-[10px] bg-amber-50 text-amber-700 font-medium px-1.5 py-0.5 rounded border border-amber-200">
                Streak: {comboStreak}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl sm:text-3xl font-bold font-mono leading-none ${comboMultiplier > 1 ? 'text-[#D1B06C]' : 'text-slate-700'}`}>
              x{comboMultiplier}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {comboStreak >= 5 ? 'Pulih!' : comboStreak > 0 ? 'Presisi' : 'Standar'}
            </span>
          </div>
          {comboStreak > 0 && comboStreak % 5 !== 0 && (
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#D1B06C] h-full transition-all duration-300"
                style={{ width: `${((comboStreak % 5) / 5) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Combo Alert */}
      {comboAlert && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all">
          <div
            className={`px-4 py-2 rounded-xl shadow-lg border text-center flex flex-col items-center gap-0.5 ${
              comboAlert.isRestore
                ? 'bg-emerald-950 text-white border-emerald-500'
                : 'bg-[#071E49] text-white border-[#D1B06C]'
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-[#D1B06C]">
              <Sparkles className="w-3.5 h-3.5 text-[#D1B06C]" />
              <span>{comboAlert.title}</span>
            </div>
            {comboAlert.subtitle && (
              <p className="text-[11px] text-slate-300 font-normal">
                {comboAlert.subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Start / Tap Hint (Before first interaction) */}
      {!hasStarted && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-20 text-center">
          <div className="bg-[#071E49] text-white px-5 py-2.5 rounded-full shadow-md border border-slate-700 text-xs font-medium flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5 text-[#D1B06C]" />
            <span>Klik atau Tekan Spasi untuk Menumpuk</span>
          </div>
        </div>
      )}
    </div>
  );
};
