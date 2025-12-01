// import { KeyDisplay } from './utils';
import { CharacterControls } from './characterControls';
import * as THREE from 'three'
import { CameraHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mode } from '../webpack.config';


// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);

const startTime: Date = new Date();



// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;

const downRaycaster = new THREE.Raycaster();
const downDirection = new THREE.Vector3(0, -1, 0);

const listener = new THREE.AudioListener();
camera.add(listener);
const clickSoundCorrect = new THREE.Audio(listener);
const clickSoundWrong = new THREE.Audio(listener);

window.addEventListener('click', () => {
  const audioContext = listener.context;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
    console.log('AudioContext resumed after click');
  }
});

window.addEventListener('keydown', () => {
  const audioContext = listener.context;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
});


const audioLoaderCorrect = new THREE.AudioLoader();
audioLoaderCorrect.load('./audio/correct.mp3', (buffer) => {
    clickSoundCorrect.setBuffer(buffer);
    clickSoundCorrect.setVolume(0.5);
});

const audioLoaderWrong = new THREE.AudioLoader();
audioLoaderWrong.load('./audio/wrong.mp3', (buffer) => {
    clickSoundWrong.setBuffer(buffer);
    clickSoundWrong.setVolume(0.5);
});

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();

// LIGHTS
light()

// FLOOR
generateFloor()

const playerBox = new THREE.Box3();
const qmBox = new THREE.Box3();
const treeBox = new THREE.Box3();

// MODEL WITH ANIMATIONS
var characterControls: CharacterControls
// new GLTFLoader().load('models/Soldier.glb', function (gltf) {
//     const model = gltf.scene;
//     model.traverse(function (object: any) {
//         if (object.isMesh) object.castShadow = true;
//     });
//     scene.add(model);

//     const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
//     const mixer = new THREE.AnimationMixer(model);
//     const animationsMap: Map<string, THREE.AnimationAction> = new Map()
//     gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
//         animationsMap.set(a.name, mixer.clipAction(a))
//     })

//     characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera,  'Idle')
// });

new GLTFLoader().load('models/boy3.glb', function (gltf) {
    const model = gltf.scene;
    // model.position.y = 0.075;
    model.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    scene.add(model);

    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap: Map<string, THREE.AnimationAction> = new Map()
    gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
        console.log("Animation exists");
        animationsMap.set(a.name, mixer.clipAction(a))
    })
    const audioLoader = new THREE.AudioLoader()
    characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera,  'Idle', audioLoader)
});

let terrain: THREE.Object3D | null = null;

new GLTFLoader().load('models/scene.gltf', function (gltf) {
    terrain = gltf.scene;
    terrain.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    terrain.position.y = -0.25;
    terrain.scale.set(50.0, 50.0, 50.0);
    terrain.position.set(-22, -0.42, 10);
    scene.add(terrain);
});


let questionMark: THREE.Object3D | null = null;
let questionMarks: THREE.Object3D[] = [];

new GLTFLoader().load('models/qm2.glb', function (gltf) {
  questionMark = gltf.scene;
  questionMark.scale.set(0.005, 0.005, 0.005);
  //hello
  // Create a pivot group
  questionMark.traverse(function (object: any) {
        if (object.isMesh) 
            {
                console.log("I am here ");
                object.castShadow = true;
                object.material = new THREE.MeshStandardMaterial({
                    map: object.material.map,   // preserves original texture
                    color: new THREE.Color(0xff0000), // tints green
                    flatShading: true
                });
            }
    });
  // Place the group where you want the object
  // scene.add(questionMark);
  const positions = [
    new THREE.Vector3(10, 1, -35),
    new THREE.Vector3(11, 1, -15),
    new THREE.Vector3(-1.5, 1, -20)
  ];
  positions.forEach(pos => {
    const qmClone = questionMark.clone(true);
    qmClone.position.copy(pos);
    scene.add(qmClone);
    questionMarks.push(qmClone);
  });
});


// https://douges.dev/static/tree.glb
// const trees = [];
const trees: THREE.Object3D[] = [];
// new GLTFLoader().load('models/giant_low_poly_tree.glb', function (gltf) {
    new GLTFLoader().load('https://douges.dev/static/tree.glb', function (gltf) {
  const model = gltf.scene;
  const minLightness = 10;
  model.scale.set(2, 2, 1);
  
  const warmthShift = 0.5;

  // Create shader material once
  const foliageMaterial = createFoliageMaterial();

  model.traverse(function (object: any) {
    if (object.isMesh) {
        console.log("Tree scene graph:");
        model.traverse((obj: any) => {
        if (obj.isMesh) {
            console.log("Mesh:", obj.name, obj.material?.type);
        }
        });
      object.castShadow = false;
      object.receiveShadow = false;

      // If this mesh is foliage/leaves, swap material
      if (object.name.startsWith("Icosphere") || object.name.startsWith("fol")) {
        // console.log("HELLO");
        object.material = foliageMaterial;
      } else {
        // Keep trunk/wood adjustments
        const color = object.material.color;
        object.material.flatshading = true;
        const hsl: { h: number; s: number; l: number } = { h: 0, s: 0, l: 0 };
        color.getHSL(hsl);
        hsl.l = Math.max(hsl.l, minLightness);
        hsl.h = (hsl.h + warmthShift) % 1;
        hsl.s = 0.5;
        color.setHSL(hsl.h, 3, hsl.l);
      }
    }
  });

  // Place multiple trees
  const positions = [
    new THREE.Vector3(15, 0, -20),
    new THREE.Vector3(8, 0, -45),
    new THREE.Vector3(-3, 0, -10)
  ];
  positions.forEach(pos => {
    const treeClone = model.clone(true);
    treeClone.position.copy(pos);
    scene.add(treeClone);
    trees.push(treeClone);
  });

  // Save foliageMaterial so animate() can drive wind
  (scene as any).foliageMaterial = foliageMaterial;
});


export function createFoliageMaterial() {
  const alphaMap = new THREE.TextureLoader().load(
    'https://douges.dev/static/foliage_alpha3.png'
  );

  const material = new THREE.MeshStandardMaterial({
    alphaMap,
    alphaTest: 0.1, // match GLSL discard behavior
    transparent: false, // discard instead of blending
    color: new THREE.Color('#3f6d21').convertLinearToSRGB(),
    side: THREE.FrontSide,
  });

  material.onBeforeCompile = (shader) => {
    // uniforms
    shader.uniforms.u_effectBlend = { value: 1.0 };
    shader.uniforms.u_inflate = { value: 0.0 };
    shader.uniforms.u_scale = { value: 1.0 };
    shader.uniforms.u_windSpeed = { value: 1.0 };
    shader.uniforms.u_windTime = { value: 0.0 };

    // inject original GLSL
    shader.vertexShader =
      `
      uniform float u_effectBlend;
      uniform float u_inflate;
      uniform float u_scale;
      uniform float u_windSpeed;
      uniform float u_windTime;

      float inverseLerp(float v, float minValue, float maxValue) {
        return (v - minValue) / (maxValue - minValue);
      }

      float remap(float v, float inMin, float inMax, float outMin, float outMax) {
        float t = inverseLerp(v, inMin, inMax);
        return mix(outMin, outMax, t);
      }

      mat4 rotateZ(float radians) {
        float c = cos(radians);
        float s = sin(radians);
        return mat4(
          c, -s, 0, 0,
          s,  c, 0, 0,
          0,  0, 1, 0,
          0,  0, 0, 1
        );
      }

      vec4 applyWind(vec4 v) {
        float boundedYNormal = remap(normal.y, -1.0, 1.0, 0.0, 1.0);
        float posXZ = position.x + position.z;
        float power = u_windSpeed / 5.0 * -0.5;

        float topFacing = remap(sin(u_windTime + posXZ), -1.0, 1.0, 0.0, power);
        float bottomFacing = remap(cos(u_windTime + posXZ), -1.0, 1.0, 0.0, 0.05);
        float radians = mix(bottomFacing, topFacing, boundedYNormal);

        return rotateZ(radians) * v;
      }

      vec2 calcInitialOffsetFromUVs() {
        vec2 offset = vec2(
          remap(uv.x, 0.0, 1.0, -1.0, 1.0),
          remap(uv.y, 0.0, 1.0, -1.0, 1.0)
        );
        offset *= vec2(-1.0, 1.0);
        offset = normalize(offset) * u_scale;
        return offset;
      }

      vec3 inflateOffset(vec3 offset) {
        return offset + normal.xyz * u_inflate;
      }
      ` +
      shader.vertexShader.replace(
        '#include <project_vertex>',
        `
        vec2 vertexOffset = calcInitialOffsetFromUVs();
        vec3 inflatedVertexOffset = inflateOffset(vec3(vertexOffset, 0.0));

        vec4 worldViewPosition = modelViewMatrix * vec4(transformed, 1.0);
        worldViewPosition += vec4(mix(vec3(0.0), inflatedVertexOffset, u_effectBlend), 0.0);

        worldViewPosition = applyWind(worldViewPosition);

        // restore mvPosition so rest of MeshStandardMaterial works
        vec4 mvPosition = worldViewPosition;

        gl_Position = projectionMatrix * mvPosition;
        `
      );

    material.userData.shader = shader; // save reference for animation loop
  };

  return material;
}


// CONTROL KEYS
const keysPressed = {  }
// const keyDisplayQueue = new KeyDisplay();
document.addEventListener('keydown', (event) => {
    // keyDisplayQueue.down(event.key)
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle()
    } else {
        (keysPressed as any)[event.key.toLowerCase()] = true
    }
}, false);
document.addEventListener('keyup', (event) => {
    // keyDisplayQueue.up(event.key);
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false);

const clock = new THREE.Clock();
// ANIMATE
var isTouchingTree = false;
let health = 120;
const healthBar = document.getElementById("healthbar");

function decreaseHealth(amount: number) {
  health = Math.max(0, health - amount);
  healthBar.style.width = `${health}%`;

  if (health > 60) healthBar.style.backgroundColor = "#00ff00";
  else if (health > 30) healthBar.style.backgroundColor = "yellow";
  else healthBar.style.backgroundColor = "red";

  if (health <= 0) {
    const gameOverScreen = document.getElementById("gameOverScreen");
    if (gameOverScreen) gameOverScreen.style.display = "flex";
  }
}

const restartBtn = document.getElementById("restartBtn");
if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    health = 100;
    healthBar.style.width = `${health}%`;
    healthBar.style.backgroundColor = "#00ff00";
    const gameOverScreen = document.getElementById("gameOverScreen");
    if (gameOverScreen) gameOverScreen.style.display = "none";
  });
}

let velocityY = 0;
const GRAVITY = -20;     // downward pull
const HEIGHT_OFFSET = 0.075;  // model's foot height


function animate() {
    let mixerUpdateDelta = clock.getDelta();
    const endTime: Date = new Date();

    const elapsedTimeMs: number = endTime.getTime() - startTime.getTime();
    const elapsedTimeSeconds: number = elapsedTimeMs / 1000;
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }

    // Drive wind time uniform
    const foliageMaterial = (scene as any).foliageMaterial;
    if (foliageMaterial && foliageMaterial.userData.shader) {
        foliageMaterial.userData.shader.uniforms.u_windTime.value += mixerUpdateDelta;
    }

    if (questionMarks.length > 0) {
      for (const qm of questionMarks) {
        qm.rotation.y += 0.01;
      }
    }

    if (characterControls && questionMarks.length > 0) {
    playerBox.setFromObject(characterControls.model); // Update player bounding box

      for (let i = 0; i < questionMarks.length; i++) {
        const qm = questionMarks[i];
        qmBox.setFromObject(qm);

        if (playerBox.intersectsBox(qmBox)) {
          console.log("Player touched a question mark!");
          qNum = i;
          const menu = document.getElementById(`menu${qNum}`);
          if (menu) menu.style.display = "block";
        }
      }
    }

    if (characterControls && terrain) {

      const player = characterControls.model;

      // 1. Apply gravity every frame
      velocityY += GRAVITY * mixerUpdateDelta;
      player.position.y += velocityY * mixerUpdateDelta;

      // 2. Raycast DOWN to detect ground

      downRaycaster.set(
        new THREE.Vector3(player.position.x, player.position.y + 1, player.position.z),
        new THREE.Vector3(0, -1, 0)
      );

      const hits = downRaycaster.intersectObject(terrain, true);

      if (hits.length > 0) {
          const groundY = hits[0].point.y + HEIGHT_OFFSET;

          if (player.position.y < groundY) {
              player.position.y = groundY;
              velocityY = 0;
          }
      } else {
        // if (elapsedTimeSeconds > 5.0) {
          let delta = 0.25;
          velocityY -= GRAVITY * delta;
          player.position.y = Math.min(player.position.y + velocityY * delta, 6);
        // }
      }
    }


    let isTouchingTreeNow = false;

    for (const tree of trees) {
      treeBox.setFromObject(tree);
      if (playerBox.intersectsBox(treeBox)) {
        console.log("Player touched a tree!");
        isTouchingTreeNow = true;
      }
    }

    if (!isTouchingTree && isTouchingTreeNow) {
      console.log("Player just started touching a tree!");
    } else if (isTouchingTree && !isTouchingTreeNow) {
      console.log("Player stopped touching the tree!");
      // decreaseHealth(10);
    }

    isTouchingTree = isTouchingTreeNow;
    
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}


var qNum = 0;
document.body.appendChild(renderer.domElement);
animate();

for (let i = 0; i < 3; i++) {
  const correctBtn = document.getElementById(`closeBtn${i}_2`);
  const wrongBtn1 = document.getElementById(`closeBtn${i}`);
  const wrongBtn2 = document.getElementById(`closeBtn${i}_3`);

  if (correctBtn)
    correctBtn.addEventListener("click", () => {
      if (clickSoundCorrect.isPlaying) clickSoundCorrect.stop();
      clickSoundCorrect.play();
      correctBtn.classList.add('flash');
      setTimeout(() => {
          correctBtn.classList.remove('flash');
          const menu = document.getElementById(`menu${i}`);
      if (menu) menu.style.display = "none";
      }, 300); 
      // document.getElementById(`menu${i}`).style.display = "none";
    });

  [wrongBtn1, wrongBtn2].forEach(btn => {
    if (btn)
      btn.addEventListener("click", () => {
        decreaseHealth(40);
        if (clickSoundWrong.isPlaying) clickSoundWrong.stop();
        clickSoundWrong.play();
        btn.classList.add('flash2');
        setTimeout(() => {
          btn.classList.remove('flash2');
              const menu = document.getElementById(`menu${i}`);
          if (menu) menu.style.display = "none";
          }, 300); 
        // document.getElementById(`menu${i}`).style.display = "none";
      });
  });
}

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // keyDisplayQueue.updatePosition()
}
window.addEventListener('resize', onWindowResize);

function generateFloor() {
    // TEXTURES
    const textureLoader = new THREE.TextureLoader();
    const placeholder = textureLoader.load("./textures/placeholder/placeholder.png");
    // const sandBaseColor = textureLoader.load("./textures/sand/Sand 002_COLOR.jpg");
    const sandBaseColor = textureLoader.load("./textures/grass/grass2.png");
    // const sandBaseColor = textureLoader.load("./textures/outdoors/Texture_11_Diffuse.png");
    // const sandNormalMap = textureLoader.load("./textures/sand/Sand 002_NRM.jpg");
    const sandNormalMap = textureLoader.load("./textures/outdoors/Texture_10_2_Normal.png");
    // const sandHeightMap = textureLoader.load("./textures/sand/Sand 002_DISP.jpg");
     const sandHeightMap = textureLoader.load("./textures/outdoors/Texture_10_2_Ambient.png");
    const sandAmbientOcclusion = textureLoader.load("./textures/outdoors/Texture_10_2_Ambient.png");
    const WIDTH = 80
    const LENGTH = 80

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    const material = new THREE.MeshStandardMaterial(
        {
            map: sandBaseColor, normalMap: sandNormalMap,
            displacementMap: sandHeightMap, displacementScale: 0.1,
            aoMap: sandAmbientOcclusion
        })
    wrapAndRepeatTexture(material.map)
    wrapAndRepeatTexture(material.normalMap)
    wrapAndRepeatTexture(material.displacementMap)
    wrapAndRepeatTexture(material.aoMap)
    // const material = new THREE.MeshPhongMaterial({ map: placeholder})

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2
    // scene.add(floor)
}

function wrapAndRepeatTexture (map: THREE.Texture) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.x = map.repeat.y = 10
}

function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(60, 50, 60); // opposite side
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemiLight.position.set(0, 100, 0);
    scene.add(hemiLight);
    // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}

