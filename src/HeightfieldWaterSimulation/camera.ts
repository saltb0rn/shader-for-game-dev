import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Access from './access.ts'


export default class {
    proxy: unknown
    constructor () {
        Access.camera = new THREE.PerspectiveCamera(75)
        this.initCamera()
    }

    initCamera() {
        // Access.cameraCtl = new OrbitControls(Access.camera!, Access.outputContainer!)
        Access.camera!.position.set(0, 1.5, 0.)
        // Access.camera!.up.set(.0, 0., 1.)
        // Access.gui.add( Access.camera!.rotation, 'x', 0, Math.PI * 2 )
        // Access.gui.add( Access.camera!.rotation, 'y', 0, Math.PI * 2 )
        // Access.gui.add( Access.camera!.rotation, 'z', 0, Math.PI * 2 )
    }

    dispose() {
        if (Access.camera) {
            Access.camera = undefined
        }

    }
}
