import * as THREE from 'three'
import Access from './access.ts'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
// import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass.js'
import SSRPass from './postProcessing/SSRPass.ts'

export default class {

    private target?: THREE.WebGLRenderTarget
    constructor() {

        const pixelRatio = Math.min(window.devicePixelRatio, 1)
        const width = Math.floor(Access.outputContainer!.clientWidth * pixelRatio)
        const height = Math.floor(Access.outputContainer!.clientHeight * pixelRatio)
        const samples = 8

        this.target = new THREE.WebGLRenderTarget(width, height, { samples })

        Access.postProcesser = new EffectComposer(Access.renderer!, this.target)

        // const ssrPass = new SSRPass({
        //     renderer: Access.renderer!,
        //     scene: Access.scene!,
        //     camera: Access.camera!,
        //     width: width,
        //     height: height
        // } as any)
        // ssrPass.output = SSRPass.OUTPUT.SSR
        
        const ssrPass = new SSRPass(
            Access.scene!,
            Access.camera!,
            width,
            height
        )

        Access.postProcesser.addPass(new RenderPass(Access.scene!, Access.camera!));
        Access.postProcesser.addPass(ssrPass)
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
