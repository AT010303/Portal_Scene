import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import fireFliesVertexShader from './shaders/fireFlies/vertex.glsl'
import fireFliesFragmentShaders from './shaders/fireFlies/fragment.glsl'

import portalVertexShader from './shaders/Portal/vertex.glsl'
import portalFragmentShaders from './shaders/Portal/fragment.glsl'


/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    // width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Texture
 */

const bakedTexture = textureLoader.load('baked.jpg')

/**
 * Object
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )

// scene.add(cube)

/**
 * Materials
 */
//baked material
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding
const bakedMaterial = new THREE.MeshBasicMaterial({map : bakedTexture})

const poleLightMaterial  = new THREE.MeshBasicMaterial({color : 0xffffe5})
// const portalLightMaterial = new THREE.MeshBasicMaterial({color : 0xffffff , side : THREE.DoubleSide})


//debug gui for portal color
debugObject.portalColorStart = '#000000'
debugObject.portalColorEnd = '#ffffff'

gui
    .addColor(debugObject , 'portalColorStart')
    .onChange(()=>{
        portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
    })


gui
    .addColor(debugObject , 'portalColorEnd')
    .onChange(()=>{
        portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
    })


const portalLightMaterial = new THREE.ShaderMaterial({

    uniforms : {
        uTime : {value : 0},
        uColorStart : {value : new THREE.Color(debugObject.portalColorStart)},
        uColorEnd : {value : new THREE.Color(debugObject.portalColorEnd)}
    },
    vertexShader : portalVertexShader,
    fragmentShader : portalFragmentShaders,
    side : THREE.DoubleSide
})
// const portalLightMaterial = new THREE.MeshBasicMaterial({color : 0xffffff})



/**
 * Model
 */
gltfLoader.load(
    'portal.glb',
    (gltf)=>{

        // gltf.scene.traverse((child)=>{
        //     // console.log(child);
        //     child.material = bakedMaterial
        // })
        const bakedMesh =  gltf.scene.children.find((child)=> child.name === 'baked')

        const poleLightAMesh =   gltf.scene.children.find((child)=> child.name === 'PoleLightA')
        const poleLightBMesh =   gltf.scene.children.find((child)=> child.name === 'PoleLightB')
        const portalLightMesh =   gltf.scene.children.find((child)=> child.name === 'PortalLight')

        // console.log(poleLightAMesh);
        // console.log(poleLightBMesh);
        // console.log(portalLightMesh);
        bakedMesh.material = bakedMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial
        portalLightMesh.material = portalLightMaterial
        
        scene.add(gltf.scene)
        // console.log(gltf.scene);
    }
)



/**
 * FireFliies
 */

const firefliesGeometry = new THREE.BufferGeometry()
const fireFliescount = 30
const positionArray = new Float32Array(fireFliescount*3)
const scaleArray = new Float32Array(fireFliescount)

for(let i=0; i<fireFliescount ; i++){
    positionArray[i*3 +0] = (Math.random() - 0.5 )*4
    positionArray[i*3 +1] = Math.random()*1.5
    positionArray[i*3 +2] = (Math.random() - 0.5)*4

    scaleArray[i] = Math.random()
}

// console.log(scaleArray);
firefliesGeometry.setAttribute('position' , new THREE.BufferAttribute(positionArray ,3))
firefliesGeometry.setAttribute('aScale' , new THREE.BufferAttribute(scaleArray ,1))

//Material
const FireFliiesMateril = new THREE.ShaderMaterial({

    uniforms:{
        uTime : {value : 0},
        uPixelRatio : { value : Math.min(window.devicePixelRatio, 2)},
        uSize : {value : 100}
    },

    vertexShader : fireFliesVertexShader,
    fragmentShader : fireFliesFragmentShaders,
    transparent : true,
    blending : THREE.AdditiveBlending,
    depthWrite : false
})

gui.add(FireFliiesMateril.uniforms.uSize , 'value').min(0).max(500).step(1).name('fireFlirsSize')


//points
const fireFlies = new THREE.Points(firefliesGeometry , FireFliiesMateril)
scene.add(fireFlies)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //Update FireFlies
    FireFliiesMateril.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.minPolarAngle = 0
controls.maxPolarAngle = Math.PI * 0.45

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding


debugObject.clearColor = '#201919'
renderer.setClearColor(debugObject.clearColor)
gui
    .addColor(debugObject , 'clearColor')
    .onChange(()=>{
        renderer.setClearColor(debugObject.clearColor)
    })

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    FireFliiesMateril.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()