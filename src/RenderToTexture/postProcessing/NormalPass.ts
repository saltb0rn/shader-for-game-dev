import * as THREE from 'three'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import MeshNormalMaterial from '../materials/MeshNormalMaterial'

export default class OutlinePass extends Pass {
    material: THREE.ShaderMaterial
    fsQuad: FullScreenQuad
    private FBO: THREE.WebGLRenderTarget
    private normalMaterial: MeshNormalMaterial
    private scene: THREE.Scene
    private camera: THREE.PerspectiveCamera

    constructor(scene: THREE.Scene,
                camera: THREE.PerspectiveCamera,
                width: number, height: number) {
        super()

        this.scene = scene
        this.camera = camera
        this.normalMaterial = new MeshNormalMaterial()
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                tNormal: { value: null }
            },
            vertexShader: /*glsl*/`
varying vec2 vUV;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUV = uv;
}
`,
            fragmentShader: /*glsl*/`
varying vec2 vUV;
uniform sampler2D tNormal;
void main() {
  gl_FragColor = vec4(texture2D(tNormal, vUV).xyz * 2.0 - 1.0, 1.0);
}
`
        })
        this.fsQuad = new FullScreenQuad(this.material)
        this.FBO = new THREE.WebGLRenderTarget(width, height)
    }

    dispose() {
        this.material.dispose()
        this.fsQuad.dispose()
        this.FBO.dispose()
        this.normalMaterial.dispose()
    }

    render(renderer: THREE.WebGLRenderer,
           writeBuffer: THREE.WebGLRenderTarget) {

        {
            renderer.setRenderTarget(this.FBO)
            renderer.render(this.scene, this.camera)
            renderer.setRenderTarget(null)
        }

        {
            let oldOverrideMaterial = this.scene.overrideMaterial
            this.scene.overrideMaterial = this.normalMaterial
            renderer.setRenderTarget(this.FBO)
            renderer.render(this.scene, this.camera)
            this.scene.overrideMaterial = oldOverrideMaterial
            renderer.setRenderTarget(null)
        }

        this.material.uniforms.tNormal.value = this.FBO.texture

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
