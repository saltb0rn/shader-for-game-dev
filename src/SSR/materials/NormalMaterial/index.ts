import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class extends THREE.ShaderMaterial {
    constructor(isMirror: boolean = false) {
        super({
            uniforms: {
                uIsMirror: { value: isMirror }
            },
            vertexShader,
            fragmentShader
        })
    }
}
