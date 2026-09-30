import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const DESTINATION_POINTS = [
  { name: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Goa', lat: 15.2993, lng: 74.124 },
  { name: 'Leh', lat: 34.1526, lng: 77.5771 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777 },
];

const latLngToVector = (latitude, longitude, radius) => {
  const phi = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(longitude + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const HeroGlobe = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 640px)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 0, 7.2);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isSmallScreen, powerPreference: 'low-power' });
    } catch {
      return undefined;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1 : 1.4));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    mount.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = -0.35;
    scene.add(globeGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 1.65));
    const keyLight = new THREE.DirectionalLight(0xfff7e8, 2.1);
    keyLight.position.set(-4, 3, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x6bb8ff, 0.75);
    fillLight.position.set(4, -2, -4);
    scene.add(fillLight);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/earth-atmos-2048.jpg');
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), isSmallScreen ? 2 : 4);

    const sphereSegments = isSmallScreen ? 48 : 80;
    const earthGeometry = new THREE.SphereGeometry(2, sphereSegments, Math.round(sphereSegments * 0.7));
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.92,
      metalness: 0.02,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.055, isSmallScreen ? 40 : 64, isSmallScreen ? 32 : 48),
      new THREE.MeshBasicMaterial({
        color: 0x83c8ff,
        transparent: true,
        opacity: 0.19,
        side: THREE.BackSide,
        depthWrite: false,
      })
    );
    globeGroup.add(atmosphere);

    const routeMaterial = new THREE.LineBasicMaterial({
      color: 0xffc97a,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const routeHub = DESTINATION_POINTS[0];
    const routeObjects = [];

    DESTINATION_POINTS.slice(1).forEach((point) => {
      const start = latLngToVector(routeHub.lat, routeHub.lng, 2.018);
      const end = latLngToVector(point.lat, point.lng, 2.018);
      const control = start.clone().add(end).normalize().multiplyScalar(2.36);
      const curve = new THREE.QuadraticBezierCurve3(start, control, end);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(isSmallScreen ? 28 : 40));
      const line = new THREE.Line(geometry, routeMaterial);
      globeGroup.add(line);
      routeObjects.push(line);
    });

    const pinGeometry = new THREE.SphereGeometry(0.043, 8, 6);
    const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xfff2d8 });
    const pins = new THREE.InstancedMesh(pinGeometry, pinMaterial, DESTINATION_POINTS.length);
    const pinDummy = new THREE.Object3D();
    DESTINATION_POINTS.forEach((point, index) => {
      pinDummy.position.copy(latLngToVector(point.lat, point.lng, 2.035));
      pinDummy.scale.setScalar(index === 0 ? 1.35 : 1);
      pinDummy.updateMatrix();
      pins.setMatrixAt(index, pinDummy.matrix);
    });
    pins.instanceMatrix.needsUpdate = true;
    globeGroup.add(pins);

    const markerGeometry = new THREE.BufferGeometry();
    const markerPositions = new Float32Array(DESTINATION_POINTS.length * 3);
    DESTINATION_POINTS.forEach((point, index) => {
      const position = latLngToVector(point.lat, point.lng, 2.052);
      markerPositions[index * 3] = position.x;
      markerPositions[index * 3 + 1] = position.y;
      markerPositions[index * 3 + 2] = position.z;
    });
    markerGeometry.setAttribute('position', new THREE.BufferAttribute(markerPositions, 3));
    const markers = new THREE.Points(markerGeometry, new THREE.PointsMaterial({
      color: 0x3e9ee8,
      size: isSmallScreen ? 0.105 : 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    }));
    globeGroup.add(markers);

    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });
    resizeObserver.observe(mount);

    let animationFrame = 0;
    let previousFrame = 0;
    const animate = (timestamp) => {
      animationFrame = window.requestAnimationFrame(animate);
      if (document.visibilityState === 'hidden' || timestamp - previousFrame < 32) return;
      const elapsed = Math.min((timestamp - (previousFrame || timestamp)) / 1000, 0.05);
      previousFrame = timestamp;
      if (!prefersReducedMotion) globeGroup.rotation.y += elapsed * 0.055;
      markers.material.opacity = 0.68 + (Math.sin(timestamp * 0.0013) + 1) * 0.12;
      renderer.render(scene, camera);
    };
    animationFrame = window.requestAnimationFrame(animate);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') previousFrame = 0;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      earthTexture.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphere.geometry.dispose();
      atmosphere.material.dispose();
      routeObjects.forEach((route) => route.geometry.dispose());
      routeMaterial.dispose();
      pinGeometry.dispose();
      pinMaterial.dispose();
      markerGeometry.dispose();
      markers.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="hero-globe-canvas" aria-hidden="true" />;
};

export default HeroGlobe;
