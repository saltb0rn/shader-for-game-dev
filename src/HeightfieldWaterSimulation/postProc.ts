import * as THREE from 'three'
import Access from './access.ts'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export default class {

    private target?: THREE.WebGLRenderTarget
    constructor() {

        const width = Access.renderer!.domElement.width,
              height = Access.renderer!.domElement.height,
              samples = 8

        this.target = new THREE.WebGLRenderTarget(width, height, { samples })

        Access.postProcesser = new EffectComposer(Access.renderer!, this.target)

        Access.postProcesser.addPass(new RenderPass(Access.scene!, Access.camera!));
        Access.postProcesser.addPass(new OutputPass())

        Access.on('postProcessing', (_1: number, _2: number, isResized: boolean) => {
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
        this.target!.dispose()
        this.target = undefined
    }
}
