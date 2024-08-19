
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

//const displayShadow = false;
// 1. Inicializar la escena, la camara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();



//if (displayShadow) renderer.shadowMap.enabled = true; // Habilitar las sombras

let monsterVertex = null;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// solo renderizar lo visible
renderer.autoClear = false;

//  Establecer el fondo de la escena en color blanco
scene.background = new THREE.Color(0xffffff);

// Obtener la cantidad de personas de localStorage
let population = localStorage.getItem('population') || 1000;

// 2. Agregar iluminacion
addIlumination(scene);

// 3. Agregar un plano para que la persona no flote
//generateFloor(scene);
generateTiledFloor(scene, population);

// 4. Crear las personas
//addSmallPeople(scene);
addSmall3dPeople(scene, population, 2);

// 5. Agregar texto en 3D
addText(scene, `${population} PERSONAS`, 2);

// 6. Colocar la posicion de la camara
//camera.position.z = 3;
// 6.1 zoom out
camera.position.z = 20;
camera.position.y = 5;

// 7. Agregar controles para navegar
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2; // Limita la rotación vertical para que no se pueda mirar debajo del plano

// 8. Agregar un listener para el evento de resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});


// 9. Agregar listener al boton de actualizar
document.getElementById('changePopulation').addEventListener('click', () => {

  const newPopulation = document.getElementById('population').value;
  localStorage.setItem('population', newPopulation);
  window.location = window.location;

});



// 10. Llamar a la funcion de animacion
animate(renderer, scene, camera, controls);






function addSmall3dPeople(scene, population = 100, multiplier = 1) {

  const vertices = generateSquareRootVertices(population, 1);
  const numberOfPeople = 23;
  const monsters = 4;
  const loader = new THREE.TextureLoader();

  // load all person textures and monsters
  const textures = [];
  const promises = [];

  for (let i = 1; i <= numberOfPeople + monsters; i++) {

    promises.push(new Promise((resolve, reject) => {
      textures.push(loader.load(`images/person${i}.png`, resolve));
    }));

  }

  Promise.all(promises).then(() => {


    // Crear materiales y sprites para cada textura
    const planes = textures.map(texture => {

      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.NearestFilter;

      // Transparencia de la textura
      texture.format = THREE.RGBAFormat;
      texture.alphaTest = 0.5;
      const planeGeometry = new THREE.PlaneGeometry(1, 2, 1, 1);
      // Crear el material del plano con la textura que tenga transparencia
      const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);

      // if (displayShadow) plane.castShadow = true;

      return plane;
    });


    let monsterAppeared = false;


    vertices.filter(x => !x.occupied).forEach(vertex => {

      let currentPerson = 0;
      // set monsterVertex to a random number between 24 and 27 only if a random number between 1 and 100 is prime and if there are no other monsters
      if (isPrime(Math.floor(Math.random() * 100)) && !monsterAppeared) {
        currentPerson = Math.floor(Math.random() * monsters) + numberOfPeople; // Uno de los monstruos 24, 25, 26, 27
      } else {
        // set currentPerson to a random number between 1 and 23
        currentPerson = Math.floor(Math.random() * numberOfPeople);
      }

      const plane = planes[currentPerson].clone();
      plane.position.set(vertex.x * multiplier, 0, vertex.y * multiplier);
      vertex.occupied = true;
      scene.add(plane);



      //add listener to the monster
      if (currentPerson >= numberOfPeople) {

        monsterAppeared = true;
        vertex.monster = true;
        plane.userData = { monster: true };

        // make the person glow when the mouse is over it
        // plane.addEventListener('mouseover', () => {
        //   plane.material.color.setHex(0xff0000);
        //   console.log("mouseover",plane);
        // });

        document.getElementById('monsterAlert').style.display = 'block';

      }

    });

  });




}


function addSmallPeople(scene) {
  const vertices = generateSquareRootVertices(100000, 1);
  const numberOfPeople = 20;
  const loader = new THREE.TextureLoader();

  // Cargar todas las texturas de personas
  const textures = [];
  for (let i = 1; i <= numberOfPeople; i++) {
    textures.push(loader.load(`images/person${i}.png`));
  }

  // Crear materiales y sprites para cada textura
  const sprites = textures.map(texture => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.NearestFilter;
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    // sprite.scale.set(0.3, 1, 1);
    return sprite;
  });

  // Asignar personas a los vértices
  let currentPerson = 0;
  vertices.filter(x => !x.occupied).forEach(vertex => {
    const person = sprites[currentPerson].clone();
    person.position.set(vertex.x, 0, vertex.y);
    vertex.occupied = true;
    scene.add(person);

    // set currentPerson to a random number between 1 and 23
    currentPerson = Math.floor(Math.random() * 23);
  });
}


function addPeople(scene) {



  const loader = new SVGLoader();
  loader.load('images/Person_icon_BLACK-01.svg', function (data) {

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
        //if (displayShadow) mesh.castShadow = true;
        group.add(mesh);
      }

    }

    //definir el tamano de la figura a 1/10
    group.scale.set(0.01, -0.01, 0.01);

    const groundLevel = 0.3;

    const vertices = generateSquareRootVertices(1000, 1);

    vertices.forEach(vertex => {
      const person = group.clone();
      person.position.set(vertex.x, groundLevel, vertex.y);
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

  //if (displayShadow) directionalLight.castShadow = true;

  scene.add(directionalLight);

}

function generateFloor(scene, population = 100) {
  // Cargar una textura
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load('images/stone_0104_c.jpg'); // Reemplaza con la ruta a tu imagen de textura

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

function generateTiledFloor(scene, population = 100, multiplier = 2) {

  // load a texture, set wrap mode to repeat
  const texture = new THREE.TextureLoader().load('images/floortile.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);

  // calculate the square root of the population
  const sqrt = Math.floor(Math.sqrt(population));

  const sidewalkSize = 2;
  // create the ground plane
  const planeGeometry = new THREE.PlaneGeometry(sqrt * multiplier + sidewalkSize, sqrt * multiplier + sidewalkSize, 1, 1);
  const planeMaterial = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;

  // set ground level
  plane.position.y = -1;
  plane.receiveShadow = true;
  scene.add(plane);
}

function addText(scene, text = '3 MILLONES') {


  //Centrar el texto en la escena
  const x = 0;
  const y = 4;
  const z = 0;

  const loader = new FontLoader();
  loader.load('fonts/helvetiker_bold.typeface.json', function (font) {


    const geometry = new TextGeometry(text, {
      font: font,
      size: 5,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: false
    });


    //center text in the scene based on the text length
    geometry.computeBoundingBox();
    const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;


    const material = new THREE.MeshBasicMaterial({ color: 0x2e2e2e });
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.position.set((textWidth / 2) * -1, y, z);

    scene.add(textMesh);


  });
}

function generateSquareRootVertices(population) {
  var vertices = [];

  const sqrt = Math.floor(Math.sqrt(population));
  const lowerlimit = sqrt / 2;

  for (var n = (-1 * lowerlimit); n < lowerlimit; n++) {
    for (var i = (-1 * lowerlimit); i < lowerlimit; i++) {
      vertices.push({ "x": i, "y": n, "occupied": false, "monster": false });
    }
  }

  const remaining = population - vertices.length;

  // place the remaining vertices randomly
  for (var i = 0; i < remaining; i++) {
    vertices.push({ "x": Math.floor(Math.random() * lowerlimit) + 1, "y": Math.floor(Math.random() * lowerlimit) + 1, "occupied": false, "monster": false });
    //vertices.push({ "x": lowerlimit, "y": (-1 * lowerlimit) + i, "occupied": false });
  }

  return vertices;
}

// 5. Crear la funcion de animacion
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // solo necesario si los controles.enableDamping o controls.autoRotate estan habilitados
  renderer.render(scene, camera);
}

function isPrime(num = 1) {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
  return primes.includes(num);

}