import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class extends THREE.ShaderMaterial {

    constructor() {
        super({
            uniforms: {
                tHeightfield: { value: null },
                tSkyBox: { value: null },
                tEnvMap: { value: null }
            },
            vertexShader,
            fragmentShader
        })
        // this.side = THREE.DoubleSide
    }

    setHeightfield(texture: THREE.Texture) {
        this.uniforms['tHeightfield'].value = texture
    }

    setSkyBox(texture: THREE.CubeTexture) {
        this.uniforms['tSkyBox'].value = texture
    }

    setEnvMap(texture: THREE.Texture) {
        this.uniforms['tEnvMap'].value = texture
    }

}
