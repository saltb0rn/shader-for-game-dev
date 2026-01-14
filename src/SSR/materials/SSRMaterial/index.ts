import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                uResolution: { value: new THREE.Vector2() },
                tViewNormal: { value: null },
                tViewPosition: { value: null },
                tDiffuse: { value: null },
                uProjectionMatrix: { value: null },
                uInverseProjectionMatrix: { value: null },
                uNear: { value: null },
                uFar: { value: null },
                uMaxDistance: { value: 180. },
                uThickness: { value: 0.018 }
            },
            vertexShader,
            fragmentShader
        })
    }

    setPositionBuffer(texture: THREE.Texture) {
        this.uniforms['tViewPosition'].value = texture
        this.uniforms['uResolution'].value = [  texture.width, texture.height ]
    }

    setNormalBuffer(texture: THREE.Texture) {
        this.uniforms['tViewNormal'].value = texture
    }

    setCamera(camera: THREE.PerspectiveCamera) {
        this.uniforms['uProjectionMatrix'].value = camera.projectionMatrix
        this.uniforms['uInverseProjectionMatrix'].value = camera.projectionMatrixInverse
        this.uniforms['uNear'].value = camera.near
        this.uniforms['uFar'].value = camera.far
    }

    setSceneBuffer(texture: THREE.Texture) {
        this.uniforms['tDiffuse'].value = texture
    }

    setMaxDistance(maxDistance: number) {
        this.uniforms['uMaxDistance'].value = maxDistance
    }

    setThickness(thickness: number) {
        this.uniforms['uThickness'].value = thickness
    }
}
