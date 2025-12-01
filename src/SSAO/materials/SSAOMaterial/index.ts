import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                uResolution: { value: null },
                tViewNormal: { value: null },
                tViewPosition: { value: null },
                tNoise: { value: null },
                uProjectionMatrix: { value: null },
                uNear: { value: null },
                uFar: { value: null },
            },
            vertexShader,
            fragmentShader
        })
    }

    setPositionBuffer(texture: THREE.Texture) {
        this.uniforms['tViewPosition'].value = texture
    }

    setNormalBuffer(texture: THREE.Texture) {
        this.uniforms['tViewNormal'].value = texture
    }

    setResolution(width: number, height: number) {
        this.uniforms['uResolution'].value = [ width, height ]
    }

    setProjectionMatrix(matrix: THREE.Matrix4) {
        this.uniforms['uProjectionMatrix'].value = matrix
    }

    setCameraNearAndFar(near: number, far: number) {
        this.uniforms['uNear'].value = near
        this.uniforms['uFar'].value = far
    }

    setNoiseTexture(texture: THREE.Texture) {
        this.uniforms['tNoise'].value = texture
    }
}
