import * as THREE from 'three'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import MeshDepthMaterial from '../materials/MeshDepthMaterial'

export default class OutlinePass extends Pass {
    material: THREE.ShaderMaterial
    fsQuad: FullScreenQuad
    private FBO: THREE.WebGLRenderTarget
    private depthMaterial: MeshDepthMaterial

    constructor(private scene: THREE.Scene,
                private camera: THREE.PerspectiveCamera,
                width: number, height: number) {
        super()

        this.depthMaterial = new MeshDepthMaterial()
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                tDepth: { value: null },
                uCameraNear: { value: null },
                uCameraFar: { value: null }
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
uniform sampler2D tDepth;
uniform float uCameraNear;
uniform float uCameraFar;

float getLinearDepth(sampler2D t, vec2 uv) {
  vec4 pixel = texture2D(t, uv);
  float ndcZ = 2.0 * pixel.r - 1.0;
  float viewZ = 2.0 * uCameraNear * uCameraFar /
    (ndcZ * (uCameraFar - uCameraNear) - (uCameraFar + uCameraNear));
  float modelZ = -viewZ;
  float linearDepth = (modelZ - uCameraNear) / (uCameraFar - uCameraNear);
  return linearDepth;
}

void main() {
  float linearDepth = getLinearDepth(tDepth, vUV);
  gl_FragColor = vec4(vec3(linearDepth), 1.0);
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
        this.depthMaterial.dispose()
    }

    render(renderer: THREE.WebGLRenderer,
           writeBuffer: THREE.WebGLRenderTarget,
           readBuffer: THREE.WebGLRenderTarget) {

        {
            renderer.setRenderTarget(this.FBO)
            renderer.render(this.scene, this.camera)
            renderer.setRenderTarget(null)
        }

        {
            let oldOverrideMaterial = this.scene.overrideMaterial
            this.scene.overrideMaterial = this.depthMaterial
            renderer.setRenderTarget(this.FBO)
            renderer.render(this.scene, this.camera)
            this.scene.overrideMaterial = oldOverrideMaterial
            renderer.setRenderTarget(null)
        }

        this.material.uniforms.tDepth.value = this.FBO.texture
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
