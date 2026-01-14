import * as THREE from 'three'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import PositionMaterial from '../materials/PositionMaterial'
import NormalMaterial from '../materials/NormalMaterial'
import SSRMaterial from '../materials/SSRMaterial'
import BlurMaterial from '../materials/BlurMaterial'
import SSRPassMaterial from '../materials/SSRPassMaterial'

export default class extends Pass {
    material: SSRPassMaterial
    fsQuad: FullScreenQuad
    private positionFBO: THREE.WebGLRenderTarget
    private positionMaterial: PositionMaterial
    private normalFBO: THREE.WebGLRenderTarget
    private normalMaterialNonMirror: NormalMaterial
    private normalMaterialMirror: NormalMaterial
    private ssrMaterial: SSRMaterial
    private ssrFBO: THREE.WebGLRenderTarget
    private blurMaterial: BlurMaterial
    private ssrBlurFBO: THREE.WebGLRenderTarget
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera
    private clearAlpha = 0
    private clearColor = new THREE.Color(0., 0., 0.)

    constructor(scene: THREE.Scene,
                camera: THREE.PerspectiveCamera,
                width: number, height: number) {
        super()

        this.scene = scene
        this.camera = camera
        this.material = new SSRPassMaterial()
        this.fsQuad = new FullScreenQuad()

        this.positionFBO = new THREE.WebGLRenderTarget(
            width, height,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                type: THREE.FloatType
            }
        )
        this.positionMaterial = new PositionMaterial()

        this.normalFBO = new THREE.WebGLRenderTarget(width, height,  {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter
        })
        this.normalMaterialMirror = new NormalMaterial(true)
        this.normalMaterialNonMirror = new NormalMaterial(false)
        this.ssrMaterial = new SSRMaterial()
        this.ssrFBO = new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter
        })
        this.blurMaterial = new BlurMaterial()
        this.ssrBlurFBO = new THREE.WebGLRenderTarget(width, height)
    }

    dispose() {
        this.material.dispose()
        this.fsQuad.dispose()

        if (this.positionMaterial) this.positionMaterial.dispose()
        if (this.positionFBO) this.positionFBO.dispose()
        if (this.normalFBO) this.normalFBO.dispose()
        if (this.normalMaterialMirror) this.normalMaterialMirror.dispose()
        if (this.normalMaterialNonMirror) this.normalMaterialNonMirror.dispose()
        if (this.ssrMaterial) this.ssrMaterial.dispose()
        if (this.blurMaterial) this.blurMaterial.dispose()
        if (this.ssrFBO) this.ssrFBO.dispose()
        if (this.ssrBlurFBO) this.ssrBlurFBO.dispose()
    }

    _renderPass(renderer: THREE.WebGLRenderer, passMaterial: THREE.Material,
                renderTarget: THREE.WebGLRenderTarget | null,
                clear = false,
                clearColor = this.clearColor,
                clearAlpha = this.clearAlpha) {
        // 保留原本状态
        const originalRenderTarget = renderer.getRenderTarget()
        const originalClearColor = renderer.getClearColor(new THREE.Color())
        const originalClearAlpha = renderer.getClearAlpha()

        // 设置状态
        renderer.setClearColor(clearColor)
        renderer.setClearAlpha(clearAlpha)
        renderer.setRenderTarget(renderTarget)

        // 开始渲染
        this.fsQuad.material = passMaterial
        if (clear) renderer.clear()
        this.fsQuad.render(renderer)

        // 还原状态
        renderer.setClearColor(originalClearColor)
        renderer.setClearAlpha(originalClearAlpha)
        renderer.setRenderTarget(originalRenderTarget)
    }

    render(renderer: THREE.WebGLRenderer,
           writeBuffer: THREE.WebGLRenderTarget,
           readBuffer: THREE.WebGLRenderTarget) {

        // 生成视点空间的顶点贴图
        {
            const originBackground = this.scene.background
            this.scene.background = null
            const originFog = this.scene.fog
            this.scene.fog = null            
            const oldClearAlpha = renderer.getClearAlpha()
            renderer.setClearAlpha(0)
            let oldMaterial = this.scene.overrideMaterial
            this.scene.overrideMaterial = this.positionMaterial
            renderer.setRenderTarget(this.positionFBO)
            renderer.render(this.scene, this.camera)
            this.scene.overrideMaterial = oldMaterial
            renderer.setRenderTarget(null)
            this.scene.background = originBackground
            this.scene.fog = originFog            
            renderer.setClearAlpha(oldClearAlpha)
        }

        /* 生成视点空间的法线贴图, 顺便标识片元是否反射,
           因此不能直接通过 THREE.Scene.overrideMaterial 来做全体材质覆盖 */
        {
            const originBackground = this.scene.background
            this.scene.background = null
            const originFog = this.scene.fog
            this.scene.fog = null
            const oldClearAlpha = renderer.getClearAlpha()
            renderer.setClearAlpha(0)
            const materials: THREE.Material[] = []
            this.scene.traverseVisible((obj: THREE.Object3D | THREE.Mesh) => {
                if ('isMesh' in obj) {
                    materials.push(obj.material as THREE.Material)

                    if ('floor' === obj.name) {
                        obj.material = this.normalMaterialMirror
                    } else {
                        obj.material = this.normalMaterialNonMirror
                    }
                }

            })

            renderer.setRenderTarget(this.normalFBO)
            renderer.render(this.scene, this.camera)

            this.scene.traverse((obj: THREE.Object3D | THREE.Mesh) => {
                if ('isMesh' in obj) {
                    const material = materials.shift()
                    if (material) obj.material = material
                }
            })

            renderer.setRenderTarget(null)
            this.scene.background = originBackground
            this.scene.fog = originFog
            renderer.setClearAlpha(oldClearAlpha)
        }

        // 生成 SSR 贴图

        {
            this.ssrMaterial.setPositionBuffer(this.positionFBO.texture)
            this.ssrMaterial.setNormalBuffer(this.normalFBO.texture)
            this.ssrMaterial.setCamera(this.camera)
            this.ssrMaterial.setSceneBuffer(readBuffer.texture)
            // this.ssrMaterial.setThickness(0.5)
            this._renderPass(renderer, this.ssrMaterial, this.ssrFBO)
            // return this._renderPass(renderer, this.ssrMaterial, writeBuffer, this.clear)
        }

        // 对 SSR 贴图降噪
        {
            this.blurMaterial.setTexture(this.ssrFBO.texture)
            this._renderPass(renderer, this.blurMaterial, this.ssrBlurFBO)
            // return this._renderPass(renderer, this.blurMaterial, writeBuffer, this.clear)
        }

        this.material.setSSR(this.ssrBlurFBO.texture)
        this.material.setTexture(readBuffer.texture)

        if (this.renderToScreen) {
            this._renderPass(renderer, this.material, null)
        } else {
            this._renderPass(renderer, this.material, writeBuffer, this.clear)
        }

    }
}
