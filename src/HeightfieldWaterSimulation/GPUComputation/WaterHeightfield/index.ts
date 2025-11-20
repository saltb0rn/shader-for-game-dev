import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import dropFragShader from './shader/drop_frag.glsl?raw'
import updateFragShader from './shader/update_frag.glsl?raw'

export default class {
    private _camera: THREE.OrthographicCamera
    private _quadDrop: THREE.Mesh
    private _quadUpdate: THREE.Mesh
    private _targetA: THREE.WebGLRenderTarget
    private _targetB: THREE.WebGLRenderTarget
    public target: THREE.WebGLRenderTarget
    constructor(textureSizeX?: number, textureSizeY?: number) {
        const _textureSizeX = 512
        const _textureSizeY = 512
        if (!textureSizeX) textureSizeX = _textureSizeX
        if (!textureSizeY) textureSizeY = _textureSizeY
        this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        const quadGeo = new THREE.PlaneGeometry(2, 2)
        this._quadDrop = new THREE.Mesh(
            quadGeo,
            new THREE.RawShaderMaterial({
                uniforms: {
                    uDropUV: { value: [0, 0] },
                    uDropRadius: { value: 1 },
                    uDropStrength: { value: 0 },
                    tLastFrame: { value: null }
                },
                vertexShader: vertexShader,
                fragmentShader: dropFragShader

            })
        )
        this._quadUpdate = new THREE.Mesh(
            quadGeo,
            new THREE.RawShaderMaterial({
                uniforms: {
                    uDelta: { value: [ 1 / textureSizeX, 1 / textureSizeY ] },
                    tLastFrame: { value: null }
                },
                vertexShader: vertexShader,
                fragmentShader: updateFragShader
            })
        )

        this._targetA = new THREE.WebGLRenderTarget(
            textureSizeX, textureSizeY, { type: THREE.FloatType })
        this._targetB = new THREE.WebGLRenderTarget(
            textureSizeX, textureSizeY, { type: THREE.FloatType })
        this.target = this._targetA
    }

    _render(renderer: THREE.WebGLRenderer, mesh: THREE.Mesh) {
        const _newTarget = this.target === this._targetA ? this._targetB: this._targetA

        renderer.setRenderTarget(_newTarget)
        const material = mesh.material as THREE.RawShaderMaterial
        material.uniforms['tLastFrame'].value = this.target.texture
        renderer.render(mesh, this._camera)

        this.target = _newTarget
    }

    addDrop(renderer: THREE.WebGLRenderer, u: number, v: number,
            dropRadius: number, dropStrength: number) {
        const material = this._quadDrop.material as THREE.RawShaderMaterial
        material.uniforms['uDropUV'].value = [u, v]
        material.uniforms['uDropRadius'].value = dropRadius
        material.uniforms['uDropStrength'].value = dropStrength
        this._render(renderer, this._quadDrop)
    }

    stepSimulation(renderer: THREE.WebGLRenderer) {
        this._render(renderer, this._quadUpdate)
    }

}
