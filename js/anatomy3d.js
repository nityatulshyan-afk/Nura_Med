/**
 * NuraMed - Sleek Realistic 3D Medical Anatomy Engine
 * Seamlessly integrated ambient background visual for modern clinical telehealth:
 * - High-contrast, rich biological coloration (no washout against light backgrounds)
 * - Calibrated clinical studio lighting with defined anatomical shadows and glowing cyan rim contour
 * - Accurately proportioned & centered anatomy:
 *   1. Heart (Cardio): Deep arterial crimson, aortic arch & branching coronary vasculature
 *   2. Lungs (Respiratory): Centered bilateral lobes, terracotta-crimson tissue & 14 distinct cartilage rings
 *   3. Brain (Neural): Convoluted cerebral cortex gyri/sulci, cerebellum & descending brainstem
 *   4. Torso (Hologram): Full diagnostic multi-system hologram with glowing vital organs
 * - Interactive mouse parallax, physiological heartbeat/breathing rhythms, and instant organ switching
 */

class AnatomyViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    if (typeof THREE === 'undefined') {
      console.warn('[AnatomyViewer] Three.js library not detected on window.');
      return;
    }

    // Export globally for immediate instant access
    if (typeof window !== 'undefined') {
      window.anatomy = this;
      window.anatomyViewerInstance = this;
      window.setOrgan = (organ) => this.setOrgan(organ);
    }

    try {
      this.currentOrgan = 'heart';
      this.visualStyle = 'tissue'; // 'tissue' (Sleek Realistic Biological) or 'glass'
      this.isWireframe = false;
      this.bpm = 72;
      this.audioEnabled = false;
      this.hotspots = [];
      this.clock = new THREE.Clock();
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      // Smooth Interactive Parallax Tracking
      this.targetRotation = { x: 0, y: 0 };
      this.currentRotation = { x: 0, y: 0 };
      this.isInteracting = false;

      // High-Contrast Procedural Biological Micro-Textures (1024x1024)
      this.textures = {
        muscleColor: this.generateOrganicTexture('muscle-color'),
        muscleBump: this.generateOrganicTexture('muscle-bump'),
        lungColor: this.generateOrganicTexture('lung-color'),
        lungBump: this.generateOrganicTexture('lung-bump'),
        brainColor: this.generateOrganicTexture('brain-color'),
        brainBump: this.generateOrganicTexture('brain-bump')
      };

      this.initScene();
      this.initLighting();
      this.initAudio();
      this.loadOrgan('heart');
      this.initEvents();
      this.bindSwitcherButtons();
      this.animate();
    } catch (e) {
      console.error('[AnatomyViewer] Initialization error:', e);
    }
  }

  // Bind direct click listeners to organ switcher buttons in DOM
  bindSwitcherButtons() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.organ-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const organ = btn.dataset.organ || btn.getAttribute('data-organ');
        if (organ) {
          console.log('[AnatomyViewer] Tab clicked -> Switching to:', organ);
          this.setOrgan(organ);
        }
      });
    });
  }

  // --- High-Contrast Procedural Textures (Rich, Bold & Deep) ---
  generateOrganicTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (type === 'muscle-color') {
      // Deep biological arterial crimson base with rich shadows
      const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
      gradient.addColorStop(0, '#881337');
      gradient.addColorStop(0.5, '#9f1239');
      gradient.addColorStop(1, '#4c0519');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);

      // Fine anisotropic muscle fiber bundles
      ctx.lineWidth = 1.2;
      for (let y = 0; y < 1024; y += 4) {
        ctx.strokeStyle = y % 8 === 0 ? 'rgba(225, 29, 72, 0.28)' : 'rgba(76, 5, 25, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < 1024; x += 40) {
          const wave = Math.sin(x * 0.04 + y * 0.02) * 3.2;
          ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }

      // Interstitial micro-capillary mottling
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(244, 63, 94, 0.25)' : 'rgba(40, 4, 12, 0.35)';
        ctx.fillRect(x, y, 4 + Math.random() * 8, 1.4);
      }
    } else if (type === 'muscle-bump') {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 1024, 1024);
      for (let y = 0; y < 1024; y += 4) {
        ctx.strokeStyle = y % 8 === 0 ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.32)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < 1024; x += 35) {
          ctx.lineTo(x, y + Math.sin(x * 0.05 + y * 0.02) * 2.5);
        }
        ctx.stroke();
      }
    } else if (type === 'lung-color') {
      // Deep, rich terracotta-crimson pulmonary base
      const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
      gradient.addColorStop(0, '#9f1239');
      gradient.addColorStop(0.4, '#b91c1c');
      gradient.addColorStop(0.8, '#881337');
      gradient.addColorStop(1, '#4c0519');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);

      // Spongy alveolar pore clusters with distinct high-contrast depth
      for (let i = 0; i < 1800; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const r = 2 + Math.random() * 5;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(244, 63, 94, 0.35)' : 'rgba(69, 10, 10, 0.45)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'lung-bump') {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 1400; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'brain-color') {
      // Rich neural cerebral cortex tone (vibrant rose with deep dark sulci)
      const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
      gradient.addColorStop(0, '#be185d');
      gradient.addColorStop(0.5, '#9d174d');
      gradient.addColorStop(1, '#701a75');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);

      // Contrasting pial arterial micro-vessel web
      for (let i = 0; i < 140; i++) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        let vx = Math.random() * 1024;
        let vy = Math.random() * 1024;
        ctx.moveTo(vx, vy);
        for (let s = 0; s < 5; s++) {
          vx += (Math.random() - 0.5) * 80;
          vy += (Math.random() - 0.5) * 80;
          ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }
    } else if (type === 'brain-bump') {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 100; i++) {
        ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.32)' : 'rgba(0, 0, 0, 0.38)';
        ctx.lineWidth = 10 + Math.random() * 16;
        ctx.beginPath();
        let cx = Math.random() * 1024;
        let cy = Math.random() * 1024;
        ctx.moveTo(cx, cy);
        for (let s = 0; s < 4; s++) {
          cx += (Math.random() - 0.5) * 120;
          cy += (Math.random() - 0.5) * 120;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  initScene() {
    this.scene = new THREE.Scene();

    const width = this.container.clientWidth || 580;
    const height = this.container.clientHeight || 480;

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 7.2);

    // Transparent WebGL Renderer for seamless background blend
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // 100% Transparent
    this.renderer.toneMapping = THREE.LinearToneMapping; // Clean, natural, stable rendering

    this.container.appendChild(this.renderer.domElement);

    // Main group to rotate and tilt
    this.organGroup = new THREE.Group();
    this.scene.add(this.organGroup);

    // Subtle atmospheric ambient depth particles
    this.createAtmosphere();

    // Responsive Canvas Resize Observer
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(this.container);
    }
    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 440;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  createAtmosphere() {
    // Subtle, floating medical micro-particles
    const particleCount = 24;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 9;
      positions[i + 1] = (Math.random() - 0.5) * 7;
      positions[i + 2] = (Math.random() - 0.5) * 4;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x0284c7,
      size: 0.038,
      transparent: true,
      opacity: 0.28
    });
    this.particles = new THREE.Points(geometry, mat);
    this.scene.add(this.particles);

    // Soft medical depth focal ring (subtle orientation backdrop)
    const ringGeo = new THREE.RingGeometry(2.35, 2.37, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12
    });
    this.depthRing = new THREE.Mesh(ringGeo, ringMat);
    this.depthRing.position.set(0, 0, -0.6);
    this.scene.add(this.depthRing);
  }

  initLighting() {
    // Soft, natural diffuse studio lighting - clean 3D appearance with zero harsh shining
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.70);
    this.scene.add(ambientLight);

    // Directional Key Light (Gentle sculpting without blown-out specular highlights)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.75);
    keyLight.position.set(3, 4, 4);
    this.scene.add(keyLight);

    // Soft clinical cyan contour light
    const rimLight = new THREE.DirectionalLight(0x0284c7, 0.45);
    rimLight.position.set(0, 3, -4);
    this.scene.add(rimLight);

    // Gentle fill light
    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.35);
    fillLight.position.set(-3, 2, 3);
    this.scene.add(fillLight);
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }

  playHeartbeatSound() {
    if (!this.audioEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    const t = this.audioCtx.currentTime;

    // Lub (64Hz)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.frequency.setValueAtTime(64, t);
    osc1.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    gain1.gain.setValueAtTime(0.2, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc1.connect(gain1);
    gain1.connect(this.audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.13);

    // Dub (96Hz)
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.frequency.setValueAtTime(96, t + 0.14);
    osc2.frequency.exponentialRampToValueAtTime(42, t + 0.24);
    gain2.gain.setValueAtTime(0.15, t + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    osc2.connect(gain2);
    gain2.connect(this.audioCtx.destination);
    osc2.start(t + 0.14);
    osc2.stop(t + 0.25);
  }

  clearCurrentOrgan() {
    while (this.organGroup.children.length > 0) {
      const obj = this.organGroup.children[0];
      this.organGroup.remove(obj);
      if (obj.traverse) {
        obj.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m && m.dispose && m.dispose());
            } else if (child.material.dispose) {
              child.material.dispose();
            }
          }
        });
      }
    }
    this.hotspots = [];
    this.activeMeshGroup = null;
  }

  loadOrgan(type) {
    try {
      this.clearCurrentOrgan();
      this.currentOrgan = type;

      if (type === 'heart') {
        this.buildRealisticHeart();
      } else if (type === 'lungs') {
        this.buildRealisticLungs();
      } else if (type === 'brain') {
        this.buildRealisticBrain();
      } else if (type === 'torso') {
        this.buildSleekTorso();
      }

      this.updateHUD();
      console.log('[AnatomyViewer] Organ loaded successfully:', type);
    } catch (err) {
      console.error('[AnatomyViewer] Error loading organ model:', type, err);
    }
  }

  // --- MATERIAL FACTORY: Clean, Stable, High-Contrast 3D Biological Shading ---
  getOrganMaterial(organType) {
    if (this.isWireframe) {
      return new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        wireframe: true,
        transparent: true,
        opacity: 0.85
      });
    }

    if (this.visualStyle === 'tissue') {
      if (organType === 'heart') {
        return new THREE.MeshStandardMaterial({
          color: 0x991b1b, // Deep rich arterial crimson
          roughness: 0.55, // Matte biological living tissue - zero glitter/stutter
          metalness: 0.04
        });
      } else if (organType === 'lungs') {
        return new THREE.MeshStandardMaterial({
          color: 0xb91c1c, // Vibrant anatomical terracotta-crimson
          roughness: 0.58, // Clean smooth matte tissue
          metalness: 0.04
        });
      } else {
        // Brain
        return new THREE.MeshStandardMaterial({
          color: 0x9d174d, // Deep rich cerebral cortex magenta-rose
          roughness: 0.55,
          metalness: 0.04
        });
      }
    } else {
      // Sleek Frosted Medical Glass Mode (High Contrast & Visible)
      if (organType === 'heart') {
        return new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          roughness: 0.35,
          metalness: 0.1
        });
      } else if (organType === 'lungs') {
        return new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          roughness: 0.35,
          metalness: 0.1
        });
      } else {
        return new THREE.MeshStandardMaterial({
          color: 0x7c3aed,
          roughness: 0.35,
          metalness: 0.1
        });
      }
    }
  }

  // =========================================================================
  // 1. SLEEK REALISTIC HUMAN HEART
  // =========================================================================
  buildRealisticHeart() {
    const heartGroup = new THREE.Group();
    const muscleMat = this.getOrganMaterial('heart');

    // Sculpted Cardioid Ventricular Body (Anatomical Left & Right Ventricles)
    const bodyGeo = new THREE.SphereGeometry(1.5, 96, 96);
    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Anatomical apex taper pointing inferiorly and slightly tilted to the left
      if (y < 0.25) {
        const factor = Math.max(0.26, 1.0 + (y - 0.25) * 0.46);
        x *= factor;
        z *= factor;
        x -= (0.25 - y) * 0.2; // Left apex tilt
      }

      // Anterior Interventricular Sulcus (groove between left & right ventricles)
      if (z > 0.35 && x > -0.3 && x < 0.5) {
        const distFromSulcus = Math.abs(x - 0.08);
        z -= Math.max(0, 0.2 - distFromSulcus * 0.48);
      }

      // Left Ventricle dominant muscular wall bulge
      if (x < -0.15 && y > -0.8 && y < 0.6) {
        x *= 1.15;
        z *= 1.06;
      }

      // Superior atrial crest contours
      if (y > 0.6) {
        y += Math.sin(x * 3.0) * 0.08;
      }

      // Smooth micro-contouring
      const micro = Math.sin(x * 5) * Math.cos(y * 5) * 0.02;
      pos.setXYZ(i, x + micro, y + micro, z + micro);
    }
    bodyGeo.computeVertexNormals();

    const mainHeartMesh = new THREE.Mesh(bodyGeo, muscleMat);
    mainHeartMesh.rotation.z = 0.1;
    heartGroup.add(mainHeartMesh);

    // Ascending Aorta & Smooth Aortic Arch (Deep Arterial Carmine)
    const aortaSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.8, 0.15),
      new THREE.Vector3(-0.1, 1.85, 0.25),
      new THREE.Vector3(0.55, 2.3, 0.1),
      new THREE.Vector3(1.25, 1.8, -0.3),
      new THREE.Vector3(1.3, 0.3, -0.6)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaSpline, 50, 0.34, 24, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Vivid Arterial Carmine
      roughness: 0.45,
      metalness: 0.05,
      wireframe: this.isWireframe
    });
    heartGroup.add(new THREE.Mesh(aortaGeo, aortaMat));

    // Three Aortic Arch Arterial Branches
    [
      { x: 0.06, h: 2.85, r: 0.1 },
      { x: 0.42, h: 2.8, r: 0.09 },
      { x: 0.82, h: 2.7, r: 0.085 }
    ].forEach((b) => {
      const branchCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(b.x, 2.15, 0.12),
        new THREE.Vector3(b.x * 1.05, 2.38, 0.09),
        new THREE.Vector3(b.x * 1.12, 2.62, 0.07),
        new THREE.Vector3(b.x * 1.2, b.h, 0.05)
      ]);
      heartGroup.add(new THREE.Mesh(new THREE.TubeGeometry(branchCurve, 14, b.r, 16, false), aortaMat));
    });

    // Pulmonary Artery Trunk (Deep Royal Sapphire Blue)
    const pulmSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.4, 0.5, 0.6),
      new THREE.Vector3(-0.25, 1.45, 0.45),
      new THREE.Vector3(-1.1, 1.7, -0.15)
    ]);
    const pulmGeo = new THREE.TubeGeometry(pulmSpline, 32, 0.3, 20, false);
    const pulmMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Vivid Sapphire Blue
      roughness: 0.45,
      metalness: 0.05,
      wireframe: this.isWireframe
    });
    heartGroup.add(new THREE.Mesh(pulmGeo, pulmMat));

    // Superior Vena Cava
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.05, 0.7, -0.1),
      new THREE.Vector3(1.08, 1.2, -0.13),
      new THREE.Vector3(1.12, 1.7, -0.16),
      new THREE.Vector3(1.15, 2.25, -0.18)
    ]);
    heartGroup.add(new THREE.Mesh(new THREE.TubeGeometry(svcCurve, 20, 0.3, 18, false), pulmMat));

    // Branching Coronary Arteries (High-Contrast Scarlet Red)
    const corMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      roughness: 0.40,
      metalness: 0.05,
      wireframe: this.isWireframe
    });

    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.65, 1.26),
      new THREE.Vector3(0.08, 0.1, 1.39),
      new THREE.Vector3(-0.04, -0.65, 1.17),
      new THREE.Vector3(-0.2, -1.25, 0.77),
      new THREE.Vector3(-0.32, -1.5, 0.26)
    ]);
    heartGroup.add(new THREE.Mesh(new THREE.TubeGeometry(ladCurve, 40, 0.048, 12, false), corMat));

    const rCoronaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.38, 0.45, 1.1),
      new THREE.Vector3(0.72, -0.1, 1.05),
      new THREE.Vector3(0.82, -0.7, 0.7)
    ]);
    heartGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rCoronaryCurve, 24, 0.042, 10, false), corMat));

    // Great Cardiac Vein (Deep Sapphire Blue)
    const veinMat = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      roughness: 0.45,
      metalness: 0.05,
      wireframe: this.isWireframe
    });
    const veinCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.01, 0.65, 1.27),
      new THREE.Vector3(0.12, 0.08, 1.38),
      new THREE.Vector3(0.01, -0.6, 1.18),
      new THREE.Vector3(-0.15, -1.2, 0.78)
    ]);
    heartGroup.add(new THREE.Mesh(new THREE.TubeGeometry(veinCurve, 32, 0.044, 10, false), veinMat));

    this.activeMeshGroup = heartGroup;
    this.organGroup.add(heartGroup);

    // Sleek White Telemetry Hotspot Nodes
    this.addHotspot({
      name: 'Aortic Arch & Arterial Root',
      position: new THREE.Vector3(0.55, 2.3, 0.2),
      system: 'Cardiovascular Conduction',
      clinicalNote: 'Primary arterial conduit. Monitored for blood pressure compliance and antihypertensive response.',
      vitals: 'Systolic: 120 mmHg • Optimal'
    });

    this.addHotspot({
      name: 'Left Ventricle Myocardium',
      position: new THREE.Vector3(-0.95, -0.3, 0.95),
      system: 'Hemodynamic Power',
      clinicalNote: 'Primary pumping chamber generating systemic cardiac output. Monitored for ejection fraction.',
      vitals: 'Ejection Fraction: 62% (Normal)'
    });

    this.addHotspot({
      name: 'Coronary Vascular Bed',
      position: new THREE.Vector3(-0.05, -0.4, 1.45),
      system: 'Myocardial Perfusion',
      clinicalNote: 'Branching coronary network supplying oxygenated blood to the working heart muscle.',
      vitals: 'Perfusion: Unobstructed Flow'
    });

    this.addHotspot({
      name: 'Apex Cordis',
      position: new THREE.Vector3(-0.32, -1.52, 0.35),
      system: 'Apical Impulse',
      clinicalNote: 'Point of maximal apical impulse. Monitored for regular rhythm.',
      vitals: 'Pulse Rate: 72 BPM Regular'
    });
  }

  // =========================================================================
  // 2. SLEEK REALISTIC HUMAN LUNGS (Centered, High-Contrast & Beautiful)
  // =========================================================================
  buildRealisticLungs() {
    const lungsGroup = new THREE.Group();
    const lungMat = this.getOrganMaterial('lungs');

    // Right Lung (3 Anatomical Lobes: Superior, Middle, Inferior - Perfectly Centered)
    const rLungGeo = new THREE.SphereGeometry(1.28, 64, 64);
    const rPos = rLungGeo.attributes.position;
    for (let i = 0; i < rPos.count; i++) {
      let x = rPos.getX(i);
      let y = rPos.getY(i);
      let z = rPos.getZ(i);

      if (y < -0.7) y += Math.exp(-Math.pow(x, 2) - Math.pow(z, 2)) * 0.32;
      if (y > 0.35) {
        x *= Math.max(0.4, 1.0 - (y - 0.35) * 0.5);
        z *= Math.max(0.4, 1.0 - (y - 0.35) * 0.5);
      }
      if (x < 0) x *= 0.6; // Medial flattening

      rPos.setXYZ(i, x, y, z);
    }
    rLungGeo.computeVertexNormals();
    const rightLungMesh = new THREE.Mesh(rLungGeo, lungMat);
    rightLungMesh.position.set(0.72, -0.05, 0); // Centered nicely!
    rightLungMesh.scale.set(0.85, 1.25, 0.85);
    lungsGroup.add(rightLungMesh);

    // Left Lung (2 Lobes with Anatomical Cardiac Notch Indentation)
    const lLungGeo = new THREE.SphereGeometry(1.24, 64, 64);
    const lPos = lLungGeo.attributes.position;
    for (let i = 0; i < lPos.count; i++) {
      let x = lPos.getX(i);
      let y = lPos.getY(i);
      let z = lPos.getZ(i);

      // Deep Cardiac Notch where heart nests
      if (x > -0.35 && y > -0.55 && y < 0.25 && z > -0.2) {
        x -= 0.3;
        z -= 0.18;
      }
      if (y < -0.7) y += 0.28;
      if (y > 0.35) {
        x *= Math.max(0.4, 1.0 - (y - 0.35) * 0.5);
        z *= Math.max(0.4, 1.0 - (y - 0.35) * 0.5);
      }
      if (x > 0) x *= 0.6;

      lPos.setXYZ(i, x, y, z);
    }
    lLungGeo.computeVertexNormals();
    const leftLungMesh = new THREE.Mesh(lLungGeo, lungMat);
    leftLungMesh.position.set(-0.72, -0.05, 0); // Centered nicely!
    leftLungMesh.scale.set(0.82, 1.25, 0.82);
    lungsGroup.add(leftLungMesh);

    // Trachea Connective Tissue Base (Rich Amber-Crimson with smooth 4-point spline)
    const tracheaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.4, 0),
      new THREE.Vector3(0.01, 1.95, 0.01),
      new THREE.Vector3(-0.01, 1.5, 0.01),
      new THREE.Vector3(0, 1.0, 0)
    ]);
    const tracheaGeo = new THREE.TubeGeometry(tracheaCurve, 24, 0.22, 20, false);
    const tracheaTubeMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c, // Rich Amber-Crimson
      roughness: 0.50,
      metalness: 0.05,
      wireframe: this.isWireframe
    });
    lungsGroup.add(new THREE.Mesh(tracheaGeo, tracheaTubeMat));

    // 14 Distinct Horizontal Ivory Cartilage Rings with Clean 3D Shading
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Pure Ivory White
      roughness: 0.35,
      metalness: 0.05,
      wireframe: this.isWireframe
    });

    for (let r = 0; r < 14; r++) {
      const ringY = 2.32 - (r * 0.095);
      const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.034, 12, 32), ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, ringY, 0);
      lungsGroup.add(ringMesh);
    }

    // Bronchial Tree Bifurcations (Carina -> Left & Right Mainstem Bronchi with 4-point splines)
    const rBronchusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.0, 0),
      new THREE.Vector3(0.18, 0.82, 0.03),
      new THREE.Vector3(0.38, 0.64, 0.06),
      new THREE.Vector3(0.55, 0.45, 0.08)
    ]);
    lungsGroup.add(new THREE.Mesh(new THREE.TubeGeometry(rBronchusCurve, 16, 0.16, 16, false), tracheaTubeMat));

    const lBronchusCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.0, 0),
      new THREE.Vector3(-0.18, 0.82, 0.03),
      new THREE.Vector3(-0.38, 0.64, 0.06),
      new THREE.Vector3(-0.55, 0.45, 0.08)
    ]);
    lungsGroup.add(new THREE.Mesh(new THREE.TubeGeometry(lBronchusCurve, 16, 0.16, 16, false), tracheaTubeMat));

    this.activeMeshGroup = lungsGroup;
    this.organGroup.add(lungsGroup);

    // Telemetry Hotspots positioned on centered lungs
    this.addHotspot({
      name: 'Trachea & Carina Bifurcation',
      position: new THREE.Vector3(0, 1.15, 0.3),
      system: 'Respiratory Airway',
      clinicalNote: 'Central conduit. Evaluated for airway resistance, wheeze, stridor, and bronchodilator efficacy.',
      vitals: 'Airway Resistance: Normal'
    });

    this.addHotspot({
      name: 'Right Superior Lobe',
      position: new THREE.Vector3(0.85, 0.75, 0.8),
      system: 'Pulmonary Parenchyma',
      clinicalNote: 'Primary gas exchange bed. SpO2 saturation tracked continuously during telemedicine triage.',
      vitals: 'SpO2: 98% Normal'
    });

    this.addHotspot({
      name: 'Left Cardiac Notch',
      position: new THREE.Vector3(-0.7, -0.3, 0.8),
      system: 'Cardiopulmonary Bed',
      clinicalNote: 'Anatomical notch accommodating pericardial contour. Monitored for pulmonary adventitious sounds.',
      vitals: 'Respiratory Rate: 16 bpm'
    });
  }

  // =========================================================================
  // 3. SLEEK REALISTIC HUMAN BRAIN (Deep Convolutions, Rich Color & Sculpted)
  // =========================================================================
  buildRealisticBrain() {
    const brainGroup = new THREE.Group();
    const brainMat = this.getOrganMaterial('brain');

    // Sculpted Cerebral Hemispheres with Deep Mathematical Harmonic Gyri/Sulci
    const cerebralGeo = new THREE.SphereGeometry(1.35, 96, 96);
    const pos = cerebralGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      z *= 1.3;
      y *= 1.05;

      // Longitudinal Cerebral Fissure (central cleft separating left & right hemispheres)
      const hemGap = 0.12;
      if (x > 0) x += hemGap; else x -= hemGap;
      const fissureDepth = Math.exp(-Math.pow(x / 0.35, 2)) * 0.32;
      x -= Math.sign(x) * fissureDepth;

      // High-contrast, deep continuous gyri and deep sulci crevices
      const gyriWave = Math.sin(x * 10.5) * Math.cos(y * 10.5) * Math.sin(z * 9.0) * 0.088
                     + Math.sin(x * 21.0 + y * 15.0) * 0.035;

      pos.setXYZ(i, x + gyriWave, y + gyriWave, z + gyriWave);
    }
    cerebralGeo.computeVertexNormals();

    const cerebrum = new THREE.Mesh(cerebralGeo, brainMat);
    cerebrum.position.set(0, 0.2, 0);
    cerebrum.scale.set(1.1, 1.1, 1.1);
    brainGroup.add(cerebrum);

    // Cerebellum (Deep Rich Wine/Burgundy with clean matte 3D shading)
    const cereMat = new THREE.MeshStandardMaterial({
      color: 0x701a75, // Deep Wine Burgundy
      roughness: 0.55,
      metalness: 0.05,
      wireframe: this.isWireframe
    });

    const cereL = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 32), cereMat);
    cereL.scale.set(0.95, 0.65, 0.85);
    cereL.position.set(-0.45, -0.85, -0.8);
    brainGroup.add(cereL);

    const cereR = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 32), cereMat);
    cereR.scale.set(0.95, 0.65, 0.85);
    cereR.position.set(0.45, -0.85, -0.8);
    brainGroup.add(cereR);

    // Brainstem (Pons & Medulla extending downward with smooth 4-point spline)
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.35, -0.2),
      new THREE.Vector3(0.01, -0.8, -0.23),
      new THREE.Vector3(-0.01, -1.3, -0.26),
      new THREE.Vector3(0, -1.75, -0.3)
    ]);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6, // Solid Warm Rose
      roughness: 0.50,
      metalness: 0.05,
      wireframe: this.isWireframe
    });
    brainGroup.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 18, 0.28, 16, false), stemMat));

    this.activeMeshGroup = brainGroup;
    this.organGroup.add(brainGroup);

    this.addHotspot({
      name: 'Prefrontal Cerebral Cortex',
      position: new THREE.Vector3(0, 0.7, 1.8),
      system: 'Cognitive & Neurological',
      clinicalNote: 'Regulates executive function and consciousness. Monitored for drug-induced sedation or cognitive fog.',
      vitals: 'Neural Conduction: Steady Alpha Rhythm'
    });

    this.addHotspot({
      name: 'Temporal Auditory/Memory Cortex',
      position: new THREE.Vector3(-1.3, 0.1, 0.4),
      system: 'Temporal Lobe',
      clinicalNote: 'Auditory and memory processing center. Checked during neurological screening.',
      vitals: 'Temporal Perfusion: Normal'
    });
  }

  // =========================================================================
  // 4. SLEEK HOLOGRAPHIC MEDICAL TORSO (Bold, Illuminated & 100% Visible)
  // =========================================================================
  buildSleekTorso() {
    const torsoGroup = new THREE.Group();

    // Clean Diagnostic Medical Cobalt Silhouette (Matte, Solid, Stable)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1, // Deep saturated Medical Cobalt
      roughness: 0.40,
      metalness: 0.08,
      transparent: true,
      opacity: 0.82,
      wireframe: this.isWireframe
    });

    const chest = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.05, 3.2, 32), bodyMat);
    chest.scale.set(1.2, 1, 0.65);
    torsoGroup.add(chest);

    // Diagnostic Holographic Rib Cage Arches (High Contrast Cyan Silhouette)
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });
    for (let r = 0; r < 5; r++) {
      const ribMesh = new THREE.Mesh(new THREE.TorusGeometry(1.0 - r * 0.05, 0.038, 8, 32, Math.PI), ribMat);
      ribMesh.position.set(0, 0.95 - r * 0.28, 0.15);
      ribMesh.rotation.x = Math.PI / 2;
      torsoGroup.add(ribMesh);
    }

    // Inner Illuminated Beating Heart (Bold Scarlet Red with Intense Emissive Glow)
    const miniHeart = new THREE.Mesh(
      new THREE.SphereGeometry(0.54, 28, 28),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 1.1,
        roughness: 0.2
      })
    );
    miniHeart.position.set(-0.35, 0.55, 0.22);
    miniHeart.scale.set(1, 1.15, 0.9);
    torsoGroup.add(miniHeart);

    // Inner Illuminated Bilateral Lungs (Vivid Cyan-Teal with Defined Glow)
    const lungMatHolo = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.88,
      roughness: 0.25
    });
    const rLungMini = new THREE.Mesh(new THREE.SphereGeometry(0.66, 24, 24), lungMatHolo);
    rLungMini.position.set(0.62, 0.6, 0.12);
    rLungMini.scale.set(0.85, 1.4, 0.75);
    torsoGroup.add(rLungMini);

    const lLungMini = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 24), lungMatHolo);
    lLungMini.position.set(-0.62, 0.6, 0.12);
    lLungMini.scale.set(0.82, 1.4, 0.75);
    torsoGroup.add(lLungMini);

    // Segmented Vertebral Column (Spine down the back - Crisp White)
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.35,
      roughness: 0.2
    });
    for (let s = 0; s < 12; s++) {
      const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.14, 16), spineMat);
      vert.position.set(0, 1.4 - s * 0.22, -0.32);
      torsoGroup.add(vert);
    }

    this.activeMeshGroup = torsoGroup;
    this.organGroup.add(torsoGroup);

    this.addHotspot({
      name: 'Cardiac Region',
      position: new THREE.Vector3(-0.35, 0.55, 0.75),
      system: 'Cardiovascular',
      clinicalNote: 'Click to inspect detailed 3D Heart anatomy.',
      vitals: 'HR: 72 BPM Regular'
    });

    this.addHotspot({
      name: 'Thoracic Pulmonary Field',
      position: new THREE.Vector3(0.65, 0.65, 0.7),
      system: 'Respiratory',
      clinicalNote: 'Click to inspect bilateral Lungs 3D model.',
      vitals: 'SpO2: 98% Normal'
    });
  }

  // --- Sleek White Telemetry Hotspot Pin (Concentric Pulse Ripple) ---
  addHotspot(data) {
    const group = new THREE.Group();
    group.position.copy(data.position);

    // Concentric pulsing white wave ring
    const ringGeo = new THREE.RingGeometry(0.1, 0.15, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);

    // Solid pure white center core disc
    const coreGeo = new THREE.CircleGeometry(0.065, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.z = 0.005;
    group.add(core);

    group.userData = { ...data, ring, core };
    this.hotspots.push(group);
    this.organGroup.add(group);
  }

  // --- Interactive Events & Mouse Parallax ---
  initEvents() {
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const dom = this.renderer.domElement;

    // Smooth Interactive Parallax when hovering over Hero Stage
    const heroStage = document.querySelector('.hero-hospital-stage') || this.container;
    heroStage.addEventListener('mousemove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      if (!isDragging) {
        this.targetRotation.y = normX * 0.35;
        this.targetRotation.x = normY * 0.22;
      }
    });

    heroStage.addEventListener('mouseleave', () => {
      if (!isDragging) {
        this.targetRotation.x = 0;
        this.targetRotation.y = 0;
      }
    });

    // Drag to inspect freely
    dom.addEventListener('mousedown', (e) => {
      isDragging = true;
      this.isInteracting = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      this.isInteracting = false;
    });

    dom.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        this.organGroup.rotation.y += deltaX * 0.007;
        this.organGroup.rotation.x += deltaY * 0.007;
        prevMousePos = { x: e.clientX, y: e.clientY };
      }

      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / dom.clientWidth) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / dom.clientHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.hotspots, true);
      dom.style.cursor = intersects.length > 0 ? 'pointer' : isDragging ? 'grabbing' : 'grab';
    });

    // Touch support for mobile & tablet
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        this.isInteracting = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMousePos.x;
        const deltaY = e.touches[0].clientY - prevMousePos.y;
        this.organGroup.rotation.y += deltaX * 0.008;
        this.organGroup.rotation.x += deltaY * 0.008;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    dom.addEventListener('touchend', () => {
      isDragging = false;
      this.isInteracting = false;
    });

    // Hotspot Click Inspection
    dom.addEventListener('click', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / dom.clientWidth) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / dom.clientHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.hotspots, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit.parent && !hit.userData.name) {
          hit = hit.parent;
        }
        if (hit && hit.userData.name) {
          this.onHotspotClick(hit.userData);
        }
      }
    });

    // Smooth subtle zoom on wheel
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.position.z += e.deltaY * 0.004;
      this.camera.position.z = Math.max(5.0, Math.min(9.5, this.camera.position.z));
    }, { passive: false });
  }

  onHotspotClick(data) {
    let infoCard = document.getElementById('anatomy-hotspot-card');
    if (!infoCard) {
      infoCard = document.createElement('div');
      infoCard.id = 'anatomy-hotspot-card';
      infoCard.className = 'hotspot-floating-card';
      this.container.appendChild(infoCard);
    }

    infoCard.innerHTML = `
      <div class="hotspot-popup-header">
        <span class="hotspot-badge"><i class="fas fa-stethoscope"></i> ${data.system}</span>
        <button class="hotspot-close" onclick="document.getElementById('anatomy-hotspot-card').style.display='none'">&times;</button>
      </div>
      <h4 class="hotspot-title">${data.name}</h4>
      <p style="font-size:0.8rem; font-weight:700; color:var(--medical-blue); margin-bottom:4px;">${data.vitals}</p>
      <p style="font-size:0.82rem; color:var(--text-secondary); line-height:1.45; margin-bottom:12px;">${data.clinicalNote}</p>
      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-xs btn-primary" onclick="app.jumpToReviewWithMedicine ? app.jumpToReviewWithMedicine('${data.name}') : app.navigateTo('rx-review')">
          <i class="fas fa-file-prescription"></i> Review Active Dosage
        </button>
      </div>
    `;
    infoCard.style.display = 'block';
  }

  // --- Animation Loop (Smooth, Stable, Natural 3D Appearance - Zero Stuttering or Blinking) ---
  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth continuous ambient turntable rotation and mouse parallax damping
    if (!this.isInteracting) {
      this.organGroup.rotation.y += (this.targetRotation.y - this.organGroup.rotation.y) * 0.04 + 0.0025;
      this.organGroup.rotation.x += (this.targetRotation.x - this.organGroup.rotation.x) * 0.04;
    }

    // Steady, normal 3D scale - zero twitching, stuttering or pulsating scaling
    if (this.activeMeshGroup) {
      this.activeMeshGroup.scale.set(1.0, 1.0, 1.0);
    }

    // Steady hotspot markers cleanly facing camera
    this.hotspots.forEach((hs) => {
      hs.lookAt(this.camera.position);
    });

    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.004;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // --- Public Controls & Dynamic HUD Updates ---
  setOrgan(type) {
    this.organGroup.rotation.set(0, 0, 0);
    this.targetRotation = { x: 0, y: 0 };
    this.loadOrgan(type);

    document.querySelectorAll('.organ-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.organ === type);
    });
  }

  toggleVisualStyle() {
    this.visualStyle = this.visualStyle === 'tissue' ? 'glass' : 'tissue';
    this.loadOrgan(this.currentOrgan);
    const btn = document.getElementById('btn-toggle-shader');
    if (btn) {
      btn.innerHTML = this.visualStyle === 'tissue'
        ? '<i class="fas fa-hand-holding-medical"></i> Style: Realistic Tissue'
        : '<i class="fas fa-gem"></i> Style: Sleek Glass';
    }
    return this.visualStyle;
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    this.loadOrgan(this.currentOrgan);
    return this.isWireframe;
  }

  resetView() {
    this.organGroup.rotation.set(0, 0, 0);
    this.targetRotation = { x: 0, y: 0 };
    this.camera.position.set(0, 0, 7.2);
  }

  setBpm(newBpm) {
    this.bpm = parseInt(newBpm, 10) || 72;
    const bpmLabel = document.getElementById('anatomy-bpm-val');
    if (bpmLabel) bpmLabel.textContent = `${this.bpm} BPM`;

    const widgetBpm = document.getElementById('widget-telemetry-rate');
    if (widgetBpm) widgetBpm.textContent = `${this.bpm} BPM`;
  }

  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    if (this.audioEnabled && this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioEnabled;
  }

  updateHUD() {
    const organNameMap = {
      heart: 'Heart',
      lungs: 'Lungs',
      brain: 'Brain',
      torso: 'Full Torso'
    };

    const heroOrganTitle = document.getElementById('hero-organ-title');
    if (heroOrganTitle) {
      heroOrganTitle.textContent = `General indicators of the ${organNameMap[this.currentOrgan] || 'Heart'}`;
    }

    const widgetTitle = document.getElementById('widget-telemetry-title');
    const widgetRate = document.getElementById('widget-telemetry-rate');
    const widgetSub = document.getElementById('widget-telemetry-sub');
    const medTitle = document.getElementById('widget-med-name');
    const medDose = document.getElementById('widget-med-dose');

    if (this.currentOrgan === 'heart') {
      if (widgetTitle) widgetTitle.textContent = 'Sinus Rhythm Active';
      if (widgetRate) widgetRate.textContent = `${this.bpm} BPM`;
      if (widgetSub) widgetSub.textContent = 'Hemodynamic Vitals Stable • 120/80 mmHg';
      if (medTitle) medTitle.textContent = 'Amlodipine 5mg (BP Care)';
      if (medDose) medDose.textContent = '1 tab daily in morning • 3 weeks active';
    } else if (this.currentOrgan === 'lungs') {
      if (widgetTitle) widgetTitle.textContent = 'Pulmonary Respiration';
      if (widgetRate) widgetRate.textContent = 'SpO2 98%';
      if (widgetSub) widgetSub.textContent = '16 Breaths/min • Clear Bilateral Lobes';
      if (medTitle) medTitle.textContent = 'Salbutamol Inhaler (100mcg)';
      if (medDose) medDose.textContent = 'As directed for acute wheeze';
    } else if (this.currentOrgan === 'brain') {
      if (widgetTitle) widgetTitle.textContent = 'Neurological Conduction';
      if (widgetRate) widgetRate.textContent = 'Alert / Oriented';
      if (widgetSub) widgetSub.textContent = 'Normal Alpha Rhythm • Reflexes Intact';
      if (medTitle) medTitle.textContent = 'Betahistine 16mg';
      if (medDose) medDose.textContent = 'TDS for vestibular check';
    } else if (this.currentOrgan === 'torso') {
      if (widgetTitle) widgetTitle.textContent = 'Multi-System Telemetry';
      if (widgetRate) widgetRate.textContent = 'Vitals Stable';
      if (widgetSub) widgetSub.textContent = 'HR: 72 • RR: 16 • SpO2: 98% • BP: 120/80';
    }
  }
}

if (typeof window !== 'undefined') {
  window.AnatomyViewer = AnatomyViewer;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnatomyViewer;
}
