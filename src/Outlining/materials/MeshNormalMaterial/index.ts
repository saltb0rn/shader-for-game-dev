import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class NormalMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {},
            vertexShader,
            fragmentShader
        })
    }
}
