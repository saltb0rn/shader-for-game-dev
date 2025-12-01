import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                tDiffuse: { value: null },
                tSSAO: { value: null },                
                uResolution: { value: null }
            },
            vertexShader,
            fragmentShader
        })
    }

    setSceneBuffer(texture: THREE.Texture) {
        this.uniforms['tDiffuse'].value = texture
    }

    setSSAOBuffer(texture: THREE.Texture) {
        this.uniforms['tSSAO'].value = texture
        this.uniforms['uResolution'].value = [ texture.width, texture.height ]
    }
    
}
