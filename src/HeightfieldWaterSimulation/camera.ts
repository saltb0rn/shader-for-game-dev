import * as THREE from 'three'
import Access from './access.ts'


export default class {
    proxy: unknown
    constructor () {
        Access.camera = new THREE.PerspectiveCamera(75)
        this.initCamera()
    }

    initCamera() {
        Access.camera!.position.set(0, 5., 0.)
    }

    dispose() {
        if (Access.camera) {
            Access.camera = undefined
        }

    }
}
