import * as THREE from 'three'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import OutlineMaterial from '../materials/OutlineMaterial'
import MeshNormalMaterial from '../materials/MeshNormalMaterial'

export default class OutlinePass extends Pass {
    material: OutlineMaterial
    fsQuad: FullScreenQuad
    private depthFBO: THREE.WebGLRenderTarget
    private normalFBO: THREE.WebGLRenderTarget
    private normalMaterial: MeshNormalMaterial

    constructor(private scene: THREE.Scene,
                private camera: THREE.PerspectiveCamera,
                width: number, height: number) {
        super()

        this.material = new OutlineMaterial()
        this.material.uniforms.uResolution.value = new THREE.Vector2(width, height)
        this.fsQuad = new FullScreenQuad(this.material)

        this.depthFBO = new THREE.WebGLRenderTarget(
            width, height,
            {
                depthBuffer: true
            }
        )
        this.depthFBO.depthTexture = new THREE.DepthTexture(width, height)

        this.normalMaterial = new MeshNormalMaterial()
        this.normalFBO = new THREE.WebGLRenderTarget(width, height)

    }

    dispose() {
        this.material.dispose()
        this.fsQuad.dispose()
        if (this.depthFBO) this.depthFBO.dispose()
        if (this.normalMaterial) this.normalMaterial.dispose()
        if (this.normalFBO) this.normalFBO.dispose()

    }

    render(renderer: THREE.WebGLRenderer,
           writeBuffer: THREE.WebGLRenderTarget,
           readBuffer: THREE.WebGLRenderTarget) {

        {
            renderer.setRenderTarget(this.depthFBO)
            renderer.render(this.scene, this.camera)
            renderer.setRenderTarget(null)
        }

        {
            let oldOverrideMaterial = this.scene.overrideMaterial
            this.scene.overrideMaterial = this.normalMaterial
            renderer.setRenderTarget(this.normalFBO)
            renderer.render(this.scene, this.camera)
            this.scene.overrideMaterial = oldOverrideMaterial
            renderer.setRenderTarget(null)
        }

        this.material.uniforms.tDiffuse.value = readBuffer.texture
        this.material.uniforms.tDepth.value = this.depthFBO.depthTexture
        this.material.uniforms.tNormal.value = this.normalFBO.texture
        this.material.uniforms.uCameraNear.value = this.camera.near
        this.material.uniforms.uCameraFar.value = this.camera.far

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
