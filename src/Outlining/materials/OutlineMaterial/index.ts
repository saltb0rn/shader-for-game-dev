import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class MoebiusMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                tDiffuse: { value: null },
                tNormal: { value: null },
                tDepth: { value: null },
                uCameraNear: { value: null },
                uCameraFar: { value: null },
                uResolution: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            vertexShader,
            fragmentShader
        })
    }
}
