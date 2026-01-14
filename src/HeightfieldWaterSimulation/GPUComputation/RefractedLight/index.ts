import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class {
    public target: THREE.WebGLRenderTarget
    private _quad: THREE.Mesh
    constructor(planeSizeX?: number, planeSizeY?: number,
                textureSizeX?: number, textureSizeY?: number) {
        if (!planeSizeX) planeSizeX = 2
        if (!planeSizeY) planeSizeY = 2
        if (!textureSizeX) textureSizeX = 512
        if (!textureSizeY) textureSizeY = 512
        this.target = new THREE.WebGLRenderTarget(textureSizeX, textureSizeY, {
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter
        })
        this._quad = new THREE.Mesh(
            new THREE.PlaneGeometry(planeSizeX, planeSizeY, textureSizeX, textureSizeY),
            new THREE.ShaderMaterial({
                uniforms: {
                    tHeightfield: { value: null },
                    uLightDir: { value: [0, -1, 0] },
                    uWaterModelMatrix: { value: null },
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader
            })
        )
    }

    _setUniform(varname: string, value: any) {
        const material = this._quad.material as THREE.ShaderMaterial
        material.uniforms[varname].value = value
    }

    setHeightfield(texture: THREE.Texture) {
        this._setUniform('tHeightfield', texture)
    }

    setWaterModelMatrix(matrix: THREE.Matrix4) {
        this._setUniform('uWaterModelMatrix', matrix)
    }

    render(renderer: THREE.WebGLRenderer, light: THREE.DirectionalLight) {
        this._setUniform('uLightDir', light.position)
        const oldTarget = renderer.getRenderTarget()
        renderer.setRenderTarget(this.target)
        renderer.render(this._quad, light.shadow.camera)
        renderer.setRenderTarget(oldTarget)
    }
}
