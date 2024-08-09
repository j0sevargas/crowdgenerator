
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    // 1. Inicializar la escena, la camara y el renderizador
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

    // 2. Agregar iluminacion
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

      // 3. Crear la figura 3D (persona) y el plano
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      const planeGeometry = new THREE.PlaneGeometry(100, 100);
      const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -1;
      scene.add(plane);

      camera.position.z = 5;

      // 4. Agregar controles para navegar
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.maxPolarAngle = Math.PI / 2; // Limita la rotación vertical para que no se pueda mirar debajo del plano

      // 5. Crear la funcion de animacion
      function animate() {
          requestAnimationFrame(animate);
          controls.update(); // solo necesario si los controles.enableDamping o controls.autoRotate estan habilitados
          renderer.render(scene, camera);
      }

      // 6. Llamar a la funcion de animacion
      animate();