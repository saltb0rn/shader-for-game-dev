import * as THREE from 'three'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import PositionMaterial from '../materials/PositionMaterial'
import NormalMaterial from '../materials/NormalMaterial'
import SSAOMaterial from '../materials/SSAOMaterial'
import SSAOPassMaterial from '../materials/SSAOPassMaterial'

export default class extends Pass {
    material: SSAOPassMaterial
    fsQuad: FullScreenQuad
    private fsQuadSSAO: FullScreenQuad
    private positionFBO: THREE.WebGLRenderTarget
    private positionMaterial: PositionMaterial
    private normalFBO: THREE.WebGLRenderTarget
    private normalMaterial: NormalMaterial
    private ssaoFBO: THREE.WebGLRenderTarget
    private ssaoMaterial: SSAOMaterial
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera
    private noiseTexture: THREE.DataTexture

    constructor(scene: THREE.Scene,
                camera: THREE.PerspectiveCamera,
                width: number, height: number) {
        super()

        this.scene = scene
        this.camera = camera
        this.ssaoMaterial = new SSAOMaterial()
        this.material = new SSAOPassMaterial()
        this.fsQuad = new FullScreenQuad(this.material)
        this.fsQuadSSAO = new FullScreenQuad(this.ssaoMaterial)

        this.positionFBO = new THREE.WebGLRenderTarget(
            width, height,
            {
                type: THREE.FloatType
            }
        )
        this.normalFBO = new THREE.WebGLRenderTarget(width, height)
        this.ssaoFBO = new THREE.WebGLRenderTarget(width, height)

        this.normalMaterial = new NormalMaterial()
        this.positionMaterial = new PositionMaterial()

        this.noiseTexture = this.generateRandomKernelRotations()
    }

    dispose() {
        this.material.dispose()
        this.fsQuad.dispose()
        this.fsQuadSSAO.dispose()

        if (this.positionMaterial) this.positionMaterial.dispose()
        if (this.positionFBO) this.positionFBO.dispose()
        if (this.normalMaterial) this.normalMaterial.dispose()
        if (this.normalFBO) this.normalFBO.dispose()
        if (this.ssaoMaterial) this.ssaoMaterial.dispose()
        if (this.ssaoFBO) this.ssaoFBO.dispose()
        if (this.noiseTexture) this.noiseTexture.dispose()
    }

    private generateRandomKernelRotations() {

        const width = 4, height = 4

        const size = width * height * 2
        const data = new Float32Array( size )

        for ( let i = 0; i < size; i ++ ) {

            const x = ( Math.random() * 2 ) - 1
            const y = ( Math.random() * 2 ) - 1

            data[ i ] = x
            data[ i + 1 ] = y

        }

        const noiseTexture = new THREE.DataTexture( data, width, height, THREE.RGFormat, THREE.FloatType)
        noiseTexture.wrapS = THREE.RepeatWrapping
        noiseTexture.wrapT = THREE.RepeatWrapping
        noiseTexture.needsUpdate = true

        return noiseTexture

    }

    render(renderer: THREE.WebGLRenderer,
           writeBuffer: THREE.WebGLRenderTarget,
           readBuffer: THREE.WebGLRenderTarget) {

        // 生成视点空间的顶点贴图
        {
            // 如果有场景背景, 请临时去掉背景, 否则 SSAO 的 shader 不好写
            const oldBackground = this.scene.background
            this.scene.background = null
            // 用透明度为 0 进行填充, 在 SSAO shader 中会根据透明度来判断片元是否存在位置信息
            const oldClearAlpha = renderer.getClearAlpha()
            renderer.setClearAlpha(0)
            let oldMaterial = this.scene.overrideMaterial
            this.scene.overrideMaterial = this.positionMaterial
            renderer.setRenderTarget(this.positionFBO)
            renderer.render(this.scene, this.camera)
            this.scene.overrideMaterial = oldMaterial
            renderer.setRenderTarget(null)
            this.scene.background = oldBackground
            renderer.setClearAlpha(oldClearAlpha)
        }

        // 生成视点空间的法线贴图
        {
            const oldBackground = this.scene.background
            this.scene.background = null
            const oldClearAlpha = renderer.getClearAlpha()
            renderer.setClearAlpha(0)
            let oldMaterial = this.scene.overrideMaterial
            this.scene.overrideMaterial = this.normalMaterial
            renderer.setRenderTarget(this.normalFBO)
            renderer.render(this.scene, this.camera)
            this.scene.overrideMaterial = oldMaterial
            renderer.setRenderTarget(null)
            this.scene.background = oldBackground
            renderer.setClearAlpha(oldClearAlpha)
        }

        // 生成 SSAO 贴图
        {
            this.ssaoMaterial.setPositionBuffer(this.positionFBO.texture)
            this.ssaoMaterial.setNormalBuffer(this.normalFBO.texture)
            this.ssaoMaterial.setProjectionMatrix(this.camera.projectionMatrix)
            this.ssaoMaterial.setCameraNearAndFar(this.camera.near, this.camera.far)
            this.ssaoMaterial.setNoiseTexture(this.noiseTexture)
            this.ssaoMaterial.setResolution(writeBuffer.width, writeBuffer.height)
            renderer.setRenderTarget(this.ssaoFBO)
            this.fsQuadSSAO.render(renderer)
            renderer.setRenderTarget(null)
        }

        this.material.setSSAOBuffer(this.ssaoFBO.texture)
        this.material.setSceneBuffer(readBuffer.texture)

        if (this.renderToScreen) {
            renderer.setRenderTarget(null)
            this.fsQuad.render(renderer)
        } else {
            renderer.setRenderTarget(writeBuffer)
            if (this.clear) renderer.clear()
            this.fsQuad.render(renderer)
        }

    }
}
