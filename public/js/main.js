
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { generateSquareRootVertices } from '/js/generate.js';

const displayShadow = false;
// 1. Inicializar la escena, la camara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
if (displayShadow) renderer.shadowMap.enabled = true; // Habilitar las sombras
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const people = [];


// 1. Establecer el fondo de la escena en color blanco
scene.background = new THREE.Color(0xffffff);


// 2. Agregar iluminacion
addIlumination(scene);
// 3.1. Agregar un plano para que la persona no flote
generateFloor(scene);

// 3. Crear la persona basado en la imagen svg Person_icon_BLACK-01.svg en el centro de la escena
addPeople(scene);

// 3.2. Agregar texto en 3D
addText(scene);



camera.position.z = 5;

// 4. Agregar controles para navegar
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2; // Limita la rotación vertical para que no se pueda mirar debajo del plano


// 6. Llamar a la funcion de animacion
animate(renderer, scene, camera, controls);


function addPeople(scene) {

  const loader = new SVGLoader();
  loader.load('/images/Person_icon_BLACK-01.svg', function (data) {

    const paths = data.paths;
    const group = new THREE.Group();

    for (let i = 0; i < paths.length; i++) {
      // console.log(0)
      const path = paths[i];
      const material = new THREE.MeshBasicMaterial({
        color: path.color,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const shapes = SVGLoader.createShapes(path);

      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        const geometry = new THREE.ShapeGeometry(shape);
        const mesh = new THREE.Mesh(geometry, material);
        if (displayShadow)  mesh.castShadow = true;
        group.add(mesh);
      }

    }

    //colocar la figura en el centro de la escena

    //definir el tamano de la figura a 1/10
    group.scale.set(0.01, -0.01, 0.01);


//    const box = new THREE.Box3().setFromObject(group);

    const groundLevel = 0.3;
    
    // group.position.set(0, groundLevel, 0);
    // people.push(group);

    // //duplicar la figura 3 veces
    // const group2 = group.clone();
    // group2.position.set(1, groundLevel, 0);
    // people.push(group2);

    // const group3 = group.clone();
    // group3.position.set(-1, groundLevel, 0);
    // people.push(group3);

    // const group4 = group.clone();
    // group4.position.set(0, groundLevel, 1);
    // people.push(group4);

    // scene.add(group2);
    // scene.add(group3);
    // scene.add(group4);
    // scene.add(group);

    const vertices = generateSquareRootVertices(10000, 1);

    //console.log(vertices);

    vertices.forEach(vertex => {
      const person = group.clone();
      person.position.set(vertex[0], groundLevel, vertex[1]);
      people.push(person);
      scene.add(person);
    });
  
  
    }

  );
}

function addIlumination(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 1, 1).normalize();

  if (displayShadow)  directionalLight.castShadow = true;

  scene.add(directionalLight);

  // const pointLight = new THREE.PointLight(0xffffff, 0.8);
  // pointLight.position.set(0, 3, 2);
  // pointLight.castShadow = true; 
  // scene.add(pointLight);
}

function generateFloor(scene) {
  // Cargar una textura
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('/images/stone_0104_c.jpg'); // Reemplaza con la ruta a tu imagen de textura

  // Crear la geometría del plano
  const planeGeometry = new THREE.PlaneGeometry(100, 100);

  // Crear el material del plano con la textura
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide
  });

  // Crear el mesh del plano
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1;
  plane.receiveShadow = true;

  scene.add(plane);
}

function addText(scene) {

  const text = '3 MILLONES';

  //Centrar el texto en la escena
  const x = 0;
  const y = 1;
  const z = 0;

  const loader = new FontLoader();
  loader.load('/fonts/helvetiker_bold.typeface.json', function (font) {


    const geometry = new TextGeometry(text, {
      font: font,
      size: 2,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: false 
    });


    //center text in the scene based on the text length
    geometry.computeBoundingBox();
    const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;


    const material = new THREE.MeshBasicMaterial({ color: 0xdedede });
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.position.set((textWidth / 2) * -1, y, z);

    scene.add(textMesh);





    // const smallfont = {
    //   font: font,
    //   size: 0.1,
    //   height: 0.1,
    //   curveSegments: 12,
    //   bevelEnabled: false
      
    // };

    // const personTextMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    
    

    // // Add text to each person
    // people.forEach(person => {
    
    //   const personTextGeometry = new TextGeometry(`x:${person.position.x} y:${person.position.y} z:${person.position.z}`, smallfont);
    //   const personTextMesh = new THREE.Mesh(personTextGeometry, personTextMaterial);

    //   personTextGeometry.computeBoundingBox();
    //   const textWidth = personTextGeometry.boundingBox.max.x - personTextGeometry.boundingBox.min.x;

    //   personTextMesh.position.set(person.position.x - (textWidth / 2) + 0.5, person.position.y + 0.2, person.position.z);
    //   scene.add(personTextMesh);
    // });


  });
}

// 5. Crear la funcion de animacion
function animate() {
  setTimeout(requestAnimationFrame(animate), 100);
  controls.update(); // solo necesario si los controles.enableDamping o controls.autoRotate estan habilitados
  renderer.render(scene, camera);
}