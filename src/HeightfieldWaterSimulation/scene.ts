import * as THREE from 'three'

import Access from './access.ts'
import Mouse from './mouseEvent.ts'

import WaterHeightfield from './GPUComputation/WaterHeightfield'
import EnvMapShadowMapping from './GPUComputation/EnvMapShadowMapping'
import Caustics from './GPUComputation/Caustics'
import RefractedLight from  './GPUComputation/RefractedLight'
import WaterMaterial from './materials/WaterMaterial'
import UnderWaterMaterial from './materials/UnderWaterMaterial'

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { TextureHelper } from 'three/examples/jsm/helpers/TextureHelper.js'

import duskPx from './textures/dusk/px.png'
import duskPy from './textures/dusk/py.png'
import duskPz from './textures/dusk/pz.png'
import duskNx from './textures/dusk/nx.png'
import duskNy from './textures/dusk/ny.png'
import duskNz from './textures/dusk/nz.png'

import sharkUrl from './models/WhiteShark.obj?url'
import rockUrl from './models/rock.obj?url'
import plantUrl from './models/plant.obj?url'

export default class Scene {
    constructor() {
        Access.scene = new THREE.Scene()
        this.initScene()
    }

    initScene() {

        const cubetextureLoader = new THREE.CubeTextureLoader()
        const skybox = cubetextureLoader.load([
            duskPx, duskNx,
            duskPy, duskNy,
            duskPz, duskNz
        ])
        Access.scene!.background = skybox

        const waterWidth = 8.0, waterHalfWidth = waterWidth * 0.5
        const waterHeight = 8.0, waterHalfHeight = waterHeight * 0.5
        const heightfieldSizeX = 512
        const heightfieldSizeY = 512

        const underWaterEnvMapTarget = new THREE.WebGLRenderTarget(heightfieldSizeX * 3., heightfieldSizeY * 3.)

        const waterHeightfield = new WaterHeightfield()

        const water = new THREE.Mesh(
            new THREE.PlaneGeometry(waterWidth, waterHeight,
                                    heightfieldSizeX, heightfieldSizeY),
            new WaterMaterial())
        {
            water.material.setSkyBox(skybox)
            water.rotation.set(-Math.PI / 2.0, 0.0, 0.0)
            water.position.set(0, 0, 0)
        }

        const mouseCtl = new Mouse(water)
        mouseCtl.onIntersected = (intersects) => {
            for (let i of intersects) {
                waterHeightfield.addDrop(Access.renderer!, i.uv.x, i.uv.y, 0.03, 0.02)
            }
        }

        const light = new THREE.DirectionalLight()
        {
            const lightDir = new THREE.Vector3(0, -1, 0)
            const margin = 0.
            light.position.copy(lightDir)
            light.shadow.camera.up.set(0, 1, 0)
            light.shadow.camera.left = -waterHalfWidth - margin
            light.shadow.camera.right = waterHalfWidth + margin
            light.shadow.camera.top = waterHalfHeight + margin
            light.shadow.camera.bottom = -waterHalfHeight - margin
            light.shadow.camera.near = 0
            light.shadow.camera.far  = 2
            light.shadow.camera.lookAt(lightDir)
            light.shadow.camera.updateProjectionMatrix()
        }

        const envMapSM = new EnvMapShadowMapping(1024, 1024)
        const underWaterMaterial = new UnderWaterMaterial()
        const caustics = new Caustics(waterWidth, waterHeight)
        const refractedLightMap = new RefractedLight(waterWidth, waterHeight)

        const objLoader = new OBJLoader()

        const sharkLoaded = new Promise((resolve) => {
            objLoader.load(sharkUrl, (loaded) => {
                resolve(loaded.children[0])
            })
        })

        const rockLoaded = new Promise((resolve) => {
            objLoader.load(rockUrl, (loaded) => {
                resolve(loaded.children[0])
            })
        })

        const plantLoaded = new Promise((resolve) => {
            objLoader.load(plantUrl, (loaded) => {
                resolve(loaded.children[0])
            })
        })

        Access.camera!.lookAt(water.position)
        Access.scene!.add(water)
        Access.scene!.add(light)

        let isRendererReady = false

        Access.on('gpuCompute', () => {
            if (!isRendererReady) {
                // 处理加载的模型
                Promise.all([sharkLoaded, rockLoaded, plantLoaded
                            ])
                    .then((geometries) => {
                        // 摆放模型
                        const meshes = []
                        let y = -light.shadow.camera.far + 1.2
                        let scale = 0.1
                        const shark = geometries[0] as THREE.Mesh
                        shark.position.set(0, y, 0.175 * waterHalfHeight)
                        shark.scale.set(scale, scale, scale)
                        Access.scene!.add(shark)

                        meshes.push(shark)

                        scale = 0.03
                        const rock = geometries[1] as THREE.Mesh
                        const xOffset = -0.75
                        rock.position.set(xOffset * waterHalfWidth, y, 0.175 * waterHalfHeight)
                        rock.scale.set(scale, scale, scale)
                        Access.scene!.add(rock)
                        const rock2 = rock.clone()
                        rock2.position.set((xOffset + 0.175) * waterHalfWidth, y, 0.225 * waterHalfHeight)
                        Access.scene!.add(rock2)
                        const rock3 = rock2.clone()
                        rock3.position.set(xOffset * waterHalfWidth, y, 0.275 * waterHalfHeight)
                        rock3.rotation.set(0, Math.PI / 3, 0)
                        Access.scene!.add(rock3)

                        meshes.push(rock)
                        meshes.push(rock2)
                        meshes.push(rock3)

                        scale = 0.04
                        const plant = geometries[2] as THREE.Mesh
                        plant.position.set(-0.75 * waterHalfWidth, y, 0.175 * waterHalfHeight)
                        plant.rotation.set(-Math.PI / 2, 0, 0)
                        plant.scale.set(scale, scale, scale)
                        Access.scene!.add(plant)
                        const plant2 = plant.clone()
                        plant2.position.set(-0.4375 * waterHalfWidth, y, 0.175 * waterHalfHeight)
                        plant2.rotateZ(20)
                        Access.scene!.add(plant2)

                        meshes.push(plant2)
                        meshes.push(plant)

                        // Access.scene!.add(new THREE.CameraHelper(light.shadow.camera))

                        const floor = new THREE.Mesh(
                            new THREE.PlaneGeometry(waterWidth, waterHeight)
                        )

                        floor.rotation.set(-Math.PI / 2, 0, 0)
                        // 水底的高度不能和相机的 far 重合, 否则只会渲染一半
                        floor.position.y = -light.shadow.camera.far + 1
                        Access.scene!.add(floor)

                        meshes.push(floor)
                        // 摆放模型: end

                        // 为水中的模型设置材质
                        underWaterMaterial.setLight(light)

                        meshes.map(mesh => mesh.material = underWaterMaterial)

                        // shark.material = underWaterMaterial
                        // rock.material = underWaterMaterial
                        // plant.material = underWaterMaterial
                        // floor.material = underWaterMaterial

                        // 以光源相机为视觉生成水底的深度贴图
                        envMapSM.render(Access.renderer!, meshes, light)

                        // const textureHelper = new TextureHelper(
                        //     envMapSM.target.texture,
                        //     waterWidth, waterHeight)
                        // textureHelper.position.set(0, 2, 0)
                        // textureHelper.rotation.set(-Math.PI / 2.0, 0, 0)
                        // Access.scene!.add(textureHelper)

                        // caustics.addToScene(Access.scene!)

                })

                isRendererReady = true
            }

            if (Access.clock!.getElapsedTime() > 0.032) {
                const oldRenderTarget = Access.renderer!.getRenderTarget()
                Access.renderer!.setRenderTarget(underWaterEnvMapTarget)
                water.visible = false
                Access.renderer!.render(Access.scene!, Access.camera!)
                water.visible = true
                Access.renderer!.setRenderTarget(oldRenderTarget)

                // 更新高度场
                waterHeightfield.stepSimulation(Access.renderer!)
                //
                {
                    refractedLightMap.setHeightfield(waterHeightfield.target.texture)
                    refractedLightMap.setWaterModelMatrix(water.matrixWorld)
                    refractedLightMap.render(Access.renderer!, light)
                }
                // 更新焦散贴图
                {
                    caustics.setHeightfield(waterHeightfield.target.texture)
                    caustics.setEnvShadowMap(envMapSM.target.texture)
                    caustics.setWaterModelMatrix(water.matrixWorld)
                    caustics.render(Access.renderer!, light)
                }
                underWaterMaterial.setRefractedTexture(refractedLightMap.target.texture)
                underWaterMaterial.setCausticsTexture(caustics.target.texture)
                const waterMaterial = water.material as WaterMaterial
                waterMaterial.setEnvMap(underWaterEnvMapTarget.texture)
                waterMaterial.setHeightfield(waterHeightfield.target.texture)
            }
        })
    }

    dispose() {
        if (!Access.scene) return
        Access.off('gpuCompute')
        Access.clear(Access.scene)
        Access.scene = undefined
    }
}
