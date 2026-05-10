/**
 * globe.js — Three.js Earth globe with scroll-driven cinematic animation
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initGlobe);

  function initGlobe() {
    var container = document.getElementById('globe-container');
    if (!container) return;

    var w = container.clientWidth;
    var h = container.clientHeight || 600;

    // Scene / Camera / Renderer
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
    camera.position.set(0, 0, 3);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lighting
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Earth
    var earthRadius = 1;
    var earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    var textureLoader = new THREE.TextureLoader();
    var earthTex = textureLoader.load(
      'https://unpkg.com/three-globe/example/img/earth-dark.jpg'
    );
    var earthMat = new THREE.MeshPhongMaterial({
      map: earthTex,
      specular: 0x222222,
      shininess: 15
    });
    var earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // Atmosphere glow
    var atmosGeo = new THREE.SphereGeometry(earthRadius * 1.15, 64, 64);
    var atmosMat = new THREE.MeshBasicMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    });
    var atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    // Starfield
    var STAR_COUNT = 2000;
    var starPositions = new Float32Array(STAR_COUNT * 3);
    for (var i = 0; i < STAR_COUNT; i++) {
      var r = 50 + Math.random() * 70;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 });
    var stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Helpers
    function latLngToVec3(lat, lng, r) {
      var phi = (90 - lat) * (Math.PI / 180);
      var theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
         r * Math.cos(phi),
         r * Math.sin(phi) * Math.sin(theta)
      );
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    // Markers
    var MARKER_RADIUS = earthRadius * 1.01;
    var markerGeo = new THREE.SphereGeometry(0.025, 16, 16);

    // Rome: 41.9° N, 12.5° E — gold
    var romePos = latLngToVec3(41.9, 12.5, MARKER_RADIUS);
    var romeMarker = new THREE.Mesh(
      markerGeo,
      new THREE.MeshBasicMaterial({ color: 0xc9a84c })
    );
    romeMarker.position.copy(romePos);
    scene.add(romeMarker);

    // Washington DC: 38.9° N, -77.0° W — blue-white
    var dcPos = latLngToVec3(38.9, -77.0, MARKER_RADIUS);
    var dcMarker = new THREE.Mesh(
      markerGeo,
      new THREE.MeshBasicMaterial({ color: 0xa8c8ff })
    );
    dcMarker.position.copy(dcPos);
    scene.add(dcMarker);

    // Camera animation state
    var cameraPullback = { x: 0,   y: 0,   z: 3.0 };
    var cameraRome     = { x: 0.5, y: 0.2, z: 1.4 };
    var cameraDC       = { x: -0.5, y: 0.2, z: 1.4 };

    var scrollProgress = 0;

    // Overlay text
    var overlay = document.createElement('div');
    overlay.id = 'globe-overlay';
    overlay.textContent = 'Two thousand years later...';
    Object.assign(overlay.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#c9a84c',
      fontFamily: "'Playfair Display', serif",
      fontSize: '2rem',
      fontWeight: '700',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 0.5s ease',
      textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
      zIndex: '10',
      textAlign: 'center'
    });
    container.style.position = 'relative';
    container.appendChild(overlay);

    // Camera update from scroll progress
    function updateCamera(progress) {
      var target = { x: 0, y: 0, z: 0 };
      var overlayOpacity = 0;

      if (progress < 0.4) {
        var t1 = progress / 0.4;
        target.x = lerp(cameraPullback.x, cameraRome.x, t1);
        target.y = lerp(cameraPullback.y, cameraRome.y, t1);
        target.z = lerp(cameraPullback.z, cameraRome.z, t1);
      } else if (progress < 0.6) {
        var t2 = (progress - 0.4) / 0.2;
        target.x = lerp(cameraRome.x, cameraPullback.x, t2);
        target.y = lerp(cameraRome.y, cameraPullback.y, t2);
        target.z = lerp(cameraRome.z, cameraPullback.z, t2);
        overlayOpacity = Math.sin(t2 * Math.PI);
      } else {
        var t3 = (progress - 0.6) / 0.4;
        target.x = lerp(cameraPullback.x, cameraDC.x, t3);
        target.y = lerp(cameraPullback.y, cameraDC.y, t3);
        target.z = lerp(cameraPullback.z, cameraDC.z, t3);
      }

      camera.position.set(target.x, target.y, target.z);
      camera.lookAt(0, 0, 0);
      overlay.style.opacity = overlayOpacity;
    }

    // Scroll handler
    function onScroll() {
      var containerTop = container.offsetTop;
      var containerH   = container.offsetHeight;
      var scrollTop    = window.pageYOffset || document.documentElement.scrollTop;
      var vh           = window.innerHeight;

      var zoneStart = containerTop - vh;
      var zoneEnd   = containerTop + containerH;

      if (scrollTop <= zoneStart) {
        scrollProgress = 0;
      } else if (scrollTop >= zoneEnd) {
        scrollProgress = 1;
      } else {
        scrollProgress = (scrollTop - zoneStart) / (zoneEnd - zoneStart);
      }

      updateCamera(scrollProgress);
    }

    // IntersectionObserver
    var scrollListenerAttached = false;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!scrollListenerAttached) {
              scrollListenerAttached = true;
              window.addEventListener('scroll', onScroll, { passive: true });
              onScroll();
            }
          }
        });
      },
      { threshold: 0.01 }
    );
    observer.observe(container);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      earth.rotation.y += 0.001;
      atmosphere.rotation.y += 0.001;
      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    var resizeObserver = new ResizeObserver(function () {
      var newW = container.clientWidth;
      var newH = container.clientHeight || 600;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(container);
  }
})();