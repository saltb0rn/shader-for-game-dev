import * as THREE from 'three'
import Access from './access.ts'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import MoebiusPass from './postProcessing/MoebiusPass.ts'
import PerlinGroundNormalMaterial from './materials/PerlinGroundNormalMaterial'
import MeshNormalMaterial from './materials/MeshNormalMaterial'

export default class {

    private target?: THREE.WebGLRenderTarget
    perlinGroundNormalMaterial: PerlinGroundNormalMaterial
    meshNormalMaterial: MeshNormalMaterial
    constructor() {

        const width = Access.renderer!.domElement.width,
              height = Access.renderer!.domElement.height,
              samples = 8

        this.target = new THREE.WebGLRenderTarget(width, height, {
            samples
        })

        this.perlinGroundNormalMaterial = new PerlinGroundNormalMaterial()
        this.meshNormalMaterial = new MeshNormalMaterial()

        const moebiusPass = new MoebiusPass(Access.scene!, Access.camera!,
                                            width * samples, height * samples)

        let _this = this

        moebiusPass.customGenNormalTexture = function(normalFBO) {
            const materials: THREE.Material[] = []
            const light = Access.scene!.getObjectByName('main-light')
            const pos = new THREE.Vector4()
            if (light) {
                pos.x = light.position.x
                pos.y = light.position.y
                pos.z = light.position.z
                pos.w = light instanceof THREE.DirectionalLight ? 0.0: 1.0
            }

            Access.scene?.traverse((obj: THREE.Object3D | THREE.Mesh) => {
                if ('isMesh' in obj) {
                    materials.push(obj.material as THREE.Material)

                    if ('ground' === obj.name) {
                        obj.material = _this.perlinGroundNormalMaterial
                        if (Access.clock) {
                            (obj.material as PerlinGroundNormalMaterial).uniforms.uTime.value =
                                Access.clock.elapsedTime
                        }
                        (obj.material as PerlinGroundNormalMaterial).uniforms.uLightPos.value = pos

                    } else {
                        obj.material = _this.meshNormalMaterial;
                        (obj.material as MeshNormalMaterial).uniforms.uLightPos.value = pos
                    }
                }
            })

            if (Access.renderer) {
                Access.renderer.setRenderTarget(normalFBO)
                Access.renderer.render(Access.scene!, Access.camera!)
                Access.renderer.setRenderTarget(null)
            }

            Access.scene!.traverse((obj: THREE.Object3D | THREE.Mesh) => {
                if ('isMesh' in obj) {
                    const material = materials.shift()
                    if (material) obj.material = material
                }
            })
        }

        Access.postProcesser = new EffectComposer(Access.renderer!, this.target)
        Access.postProcesser.addPass(new RenderPass(Access.scene!, Access.camera!));
        Access.postProcesser.addPass(moebiusPass)
        Access.postProcesser.addPass(new OutputPass())

        Access.on('postProcessing', (_1: number, _2: number, isResized: boolean) => {
            const light = Access.scene!.getObjectByName('main-light')
            if (light) {
                const pos = new THREE.Vector4()
                pos.x = light.position.x
                pos.y = light.position.y
                pos.z = light.position.z
                pos.w = light instanceof THREE.DirectionalLight ? 0.0: 1.0
                moebiusPass.updateLightPosition(pos)
            }
            if (isResized) {
                Access.postProcesser!.setSize(
                    Access.renderer!.domElement.width,
                    Access.renderer!.domElement.height
                )
            }
        })
    }

    dispose() {
        if (!Access.postProcesser) return
        Access.off('postprocessing')
        for (let i = 0; i < Access.postProcesser!.passes.length; i++) {
            const pass = Access.postProcesser.passes[i]
            Access.postProcesser.removePass(pass)
            pass.dispose()
        }
        Access.postProcesser?.dispose()
        Access.postProcesser = undefined
        this.perlinGroundNormalMaterial.dispose()
        this.meshNormalMaterial.dispose()
        this.target!.dispose()
        this.target = undefined
    }
}
