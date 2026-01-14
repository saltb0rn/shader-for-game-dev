import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                uResolution: { value: null },
                tDiffuse: { value: null }
            },
            vertexShader,
            fragmentShader
        })
    }

    setTexture(texture: THREE.Texture) {
        this.uniforms['tDiffuse'].value = texture
        this.uniforms['uResolution'].value = [ texture.width, texture.height ]
    }
}
