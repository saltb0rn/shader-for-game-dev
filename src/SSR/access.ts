import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EventEmitter } from './eventEmitter.ts'
import Disposer from './disposer.ts'

class Access extends EventEmitter {
    public clock?: THREE.Clock
    public camera?: THREE.PerspectiveCamera
    public renderer?: THREE.WebGLRenderer
    public scene?: THREE.Scene
    private disposer = new Disposer()
    public outputContainer?: HTMLElement
    public postProcesser?: EffectComposer
    public cssRenderer?: CSS2DRenderer
    public cameraCtl?: OrbitControls
    private events: string[] = []

    private static instance = new Access()

    private constructor() {
        super()
    }

    static Instance(): Access {
        return Access.instance
    }

    on(_names: string, callback: Function): any {
        const res = super.on(_names, callback)
        if (res) {
            this.events.push(_names)
        }
    }

    off(_names: string): any {
        const res = super.off(_names)
        if (res) {
            this.events = this.events.filter(v => _names !== v)
        }
    }

    getEvents() {
        return this.events
    }

    clear(obj: THREE.Object3D) {
        this.disposer.disposeOnCascade(obj)
    }
}

export default Access.Instance()
