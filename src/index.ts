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

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;

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
    model.position.y = 0.075;
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

    characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera,  'Idle')
});

let questionMark: THREE.Object3D | null = null;

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
  scene.add(questionMark);
});

// https://douges.dev/static/tree.glb'
// new GLTFLoader().load('models/giant_low_poly_tree.glb', function (gltf) {
//     new GLTFLoader().load('models/giant_low_poly_tree.glb', function (gltf) {
// // new GLTFLoader().load('models/low-poly_tree.glb', function (gltf) {
//     const model = gltf.scene;
//     const minLightness = 0.075;
//     model.scale.set(1,1,.5);
//      const warmthShift = -0.1;
//     model.traverse(function (object: any) {
//         if (object.isMesh) {
            
//             object.castShadow = false;
//             object.receiveShadow = false;
//             const color = object.material.color;

//             // Get current HSL values
//             const hsl: { h: number; s: number; l: number } = { h: 0, s: 0, l: 0 };
//             // Get current HSL values
//             color.getHSL(hsl);
//             // Adjust saturation
//             hsl.l = Math.max(hsl.l, minLightness);
//             hsl.h = (hsl.h + warmthShift) % 1;
//             hsl.s = 0.5; // 50% saturation
//             // Apply the new HSL values to the color
//             color.setHSL(hsl.h, 0.4, hsl.l);
//         }
//     });
//     const positions = [
//         new THREE.Vector3(0, 0, 0),
//         new THREE.Vector3(5, 0, 2),
//         new THREE.Vector3(-3, 0, -4)
//     ];

//     positions.forEach(pos => {
//         const treeClone = model.clone(true); // true = deep clone (including children)
//         treeClone.position.copy(pos);
//         scene.add(treeClone);
//     });
// });

// https://douges.dev/static/tree.glb
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
    new THREE.Vector3(0, 0, 8),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(-3, 0, -7)
  ];
  positions.forEach(pos => {
    const treeClone = model.clone(true);
    treeClone.position.copy(pos);
    scene.add(treeClone);
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
function animate() {
    let mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }

    // Drive wind time uniform
    const foliageMaterial = (scene as any).foliageMaterial;
    if (foliageMaterial && foliageMaterial.userData.shader) {
        foliageMaterial.userData.shader.uniforms.u_windTime.value += mixerUpdateDelta;
    }

    if (questionMark) {
        // console.log("QMMM");
    questionMark.rotation.y += 0.01; // spins in place
    questionMark.position.set(2, 1.5, 3);
    }

    if (characterControls && questionMark) {
        // Update player bounding box
        playerBox.setFromObject(characterControls.model); // assuming CharacterControls exposes model

        // Update question mark bounding box
        qmBox.setFromObject(questionMark);

        // Check for intersection
        if (playerBox.intersectsBox(qmBox)) {
            console.log("Player touched the question mark!");
            // e.g., remove it from scene or trigger reward
            // scene.remove(questionMark);
            // questionMark = null;
            const menu = document.getElementById("menu");
            if (menu) menu.style.display = "block";

            
        }
    }
    
  orbitControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}



document.body.appendChild(renderer.domElement);
animate();
const closeBtn = document.getElementById("closeBtn");
    closeBtn?.addEventListener("click", () => {
        if (!closeBtn) return; // TypeScript now knows closeBtn exists

        closeBtn.classList.add('flash');

        // Remove the 'flash' class after the animation completes
        setTimeout(() => {
            closeBtn.classList.remove('flash');
            const menu = document.getElementById("menu");
        if (menu) menu.style.display = "none";
        }, 300); 

        
    }
);

const closeBtn2 = document.getElementById("closeBtn2");
    closeBtn2?.addEventListener("click", () => {
        if (!closeBtn2) return; // TypeScript now knows closeBtn exists

        closeBtn2.classList.add('flash2');

        // Remove the 'flash' class after the animation completes
        setTimeout(() => {
            closeBtn2.classList.remove('flash2');
            const menu = document.getElementById("menu");
        if (menu) menu.style.display = "none";
        }, 300);         
    }
);

const closeBtn3 = document.getElementById("closeBtn3");
    closeBtn3?.addEventListener("click", () => {
        if (!closeBtn3) return; // TypeScript now knows closeBtn exists

        closeBtn3.classList.add('flash2');

        // Remove the 'flash' class after the animation completes
        setTimeout(() => {
            closeBtn3.classList.remove('flash2');
            const menu = document.getElementById("menu");
        if (menu) menu.style.display = "none";
        }, 300);         
    }
);

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
    scene.add(floor)
}

function wrapAndRepeatTexture (map: THREE.Texture) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.x = map.repeat.y = 10
}

function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    // dirLight.castShadow = true;
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

