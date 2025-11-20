import * as THREE from 'three'
import vertexShader from './shader/vertex.glsl?raw'
import fragmentShader from './shader/fragment.glsl?raw'

export default class {
    public target: THREE.WebGLRenderTarget
    private _scene = new THREE.Scene()
    private _material: THREE.ShaderMaterial
    constructor(textureSizeX?: number, textureSizeY?: number) {
        const _textureSizeX = 512
        const _textureSizeY = 512
        if (!textureSizeX) textureSizeX = _textureSizeX
        if (!textureSizeY) textureSizeY = _textureSizeY
        this.target = new THREE.WebGLRenderTarget(
            textureSizeX, textureSizeY, { type: THREE.FloatType })
        this._material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })
    }

    render(renderer: THREE.WebGLRenderer,
           meshes: THREE.Mesh[],
           light: THREE.DirectionalLight) {

        const oldTarget = renderer.getRenderTarget()
        renderer.setRenderTarget(this.target)
        renderer.setClearColor(0x000000, 0)
        renderer.clear()

        const geometries = []
        for (let mesh of meshes) {
            const geo = mesh.geometry.clone()
            geometries.push(geo)
            const _mesh = new THREE.Mesh(geo, this._material)
            _mesh.position.copy(mesh.position)
            _mesh.rotation.copy(mesh.rotation)
            _mesh.scale.copy(mesh.scale)
            _mesh.geometry.computeVertexNormals()
            this._scene.add(_mesh)
        }
        renderer.render(this._scene, light.shadow.camera)
        this._scene.clear()
        for (let geo of geometries) {
            geo.dispose()
        }
        renderer.setRenderTarget(oldTarget)
    }

}
