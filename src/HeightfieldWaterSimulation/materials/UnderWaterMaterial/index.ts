import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class extends THREE.ShaderMaterial {
    constructor() {
        super({
            uniforms: {
                uLightProjectionMatrix: { value: new THREE.Matrix4() },
                uLightViewMatrix: { value: new THREE.Matrix4() },
                tCaustics: { value: null },
                uResolution: { value: null },
                tRefractedLight: { value: null },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })
    }

    setCausticsTexture(texture: THREE.Texture) {
        this.uniforms['tCaustics'].value = texture
        this.uniforms['uResolution'].value = [ texture.width, texture.height ]
    }

    setRefractedTexture(texture: THREE.Texture) {
        this.uniforms['tRefractedLight'].value = texture
    }

    setLight(light: THREE.DirectionalLight) {
        this.uniforms['uLightProjectionMatrix'].value = light.shadow.camera.projectionMatrix
        this.uniforms['uLightViewMatrix'].value = light.shadow.camera.matrixWorldInverse
    }

}
