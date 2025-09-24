import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                uLightPos: { value: new THREE.Vector4(0.0, 0.0, 0.0, 1.0) }
            },
            vertexShader,
            fragmentShader
        })
    }
}
