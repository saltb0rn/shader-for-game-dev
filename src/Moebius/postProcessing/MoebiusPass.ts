import * as THREE from 'three'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import MoebiusMaterial from '../materials/MoebiusMaterial'
import MeshNormalMaterial from '../materials/MeshNormalMaterial'

export default class MoebiusPass extends Pass {
    material: MoebiusMaterial
    fsQuad: FullScreenQuad
    customGenNormalTexture?: (normalFBO: THREE.WebGLRenderTarget) => void
    private normalFBO: THREE.WebGLRenderTarget
    private normalMaterial: MeshNormalMaterial
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera

    constructor(scene: THREE.Scene,
                camera: THREE.PerspectiveCamera,
                width: number, height: number) {
        super()

        this.scene = scene
        this.camera = camera
        this.material = new MoebiusMaterial()
        this.material.uniforms.uResolution.value = new THREE.Vector2(width, height)
        this.fsQuad = new FullScreenQuad(this.material)

        this.normalMaterial = new MeshNormalMaterial()
        // this.normalMaterial.uniforms.uLightPos.value = new THREE.Vector4(10.0, 10.0, 10.0, .0);
        this.normalFBO = new THREE.WebGLRenderTarget(width, height, {
            depthBuffer: true,
            colorSpace: THREE.LinearSRGBColorSpace
        })
        this.normalFBO.depthTexture = new THREE.DepthTexture(width, height)
    }

    dispose() {
        this.material.dispose()
        this.fsQuad.dispose()
        if (this.normalMaterial) this.normalMaterial.dispose()
        if (this.normalFBO) this.normalFBO.dispose()
    }

    updateLightPosition(pos: THREE.Vector4) {
        // pos.w > 0.0 表示光源为位置光, pos.w === 0.0 表示光源为定向光源
        this.normalMaterial.uniforms.uLightPos.value = pos
    }

    render(renderer: THREE.WebGLRenderer,
           writeBuffer: THREE.WebGLRenderTarget,
           readBuffer: THREE.WebGLRenderTarget) {

        if (this.customGenNormalTexture) {
            this.customGenNormalTexture(this.normalFBO)
        } else {
            let oldOverrideMaterial = this.scene.overrideMaterial
            this.scene.overrideMaterial = this.normalMaterial
            renderer.setRenderTarget(this.normalFBO)
            renderer.render(this.scene, this.camera)
            this.scene.overrideMaterial = oldOverrideMaterial
            renderer.setRenderTarget(null)
        }

        this.material.uniforms.tDiffuse.value = readBuffer.texture
        this.material.uniforms.tDepth.value = this.normalFBO.depthTexture
        this.material.uniforms.tNormal.value = this.normalFBO.texture
        this.material.uniforms.uCameraNear.value = this.camera.near
        this.material.uniforms.uCameraFar.value = this.camera.far
        this.material.uniforms.uGammaCorrection.value = this.renderToScreen

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
