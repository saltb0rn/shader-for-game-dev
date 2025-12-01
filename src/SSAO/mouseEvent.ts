import * as THREE from 'three'
import Access from './access'

const FAR_DISTANCE = -100000

export default class {

    private raycaster = new THREE.Raycaster()
    private pickPosition = new THREE.Vector2(FAR_DISTANCE, FAR_DISTANCE)
    private intersected?: any
    private targetMesh: THREE.Mesh

    constructor(targetMesh: THREE.Mesh) {
        this.targetMesh = targetMesh
        this.initMouseSetup()
    }

    initMouseSetup() {
        const mouseEventPrefix = 'MOUSE'
        Access.on(`${this.targetMesh.uuid}.${mouseEventPrefix}`, () => {
            this.raycaster.setFromCamera(this.pickPosition, Access.camera!)
            const intersects = this.raycaster.intersectObject(this.targetMesh)
            if (intersects.length) {
                this.intersected = intersects
                if (Access.clock!.getElapsedTime() > 0.5) {
                    this.onIntersected(intersects)
                }
            } else {
                this.intersected = null
            }

        })

        document.addEventListener('mousemove', this.setPickPosition.bind(this))
        document.addEventListener('mouseout', this.clearPickPosition.bind(this))
        document.addEventListener('mouseleave', this.clearPickPosition.bind(this))
        document.addEventListener('mousedown', this._onClick.bind(this))
    }

    private getRelativeCoords(event: MouseEvent) {
        const canvas = Access.renderer!.domElement
        const rect = canvas.getBoundingClientRect()
        return {
            x: (event.clientX - rect.left) * canvas.width / rect.width,
            y: (event.clientY - rect.top) * canvas.height / rect.height
        }
    }

    private setPickPosition(event: MouseEvent) {
        if (!Access.renderer) return
        const canvas = Access.renderer!.domElement
        const pos = this.getRelativeCoords(event)
        this.pickPosition!.x = (pos.x / canvas.width) * 2 - 1
        this.pickPosition!.y = (pos.y / canvas.height) * -2 + 1
    }

    private clearPickPosition() {
        this.pickPosition!.x = FAR_DISTANCE
        this.pickPosition!.y = FAR_DISTANCE
    }

    onClick(event: MouseEvent, target = this.intersected) {
        // if (0 === event.button) {
        //     if (this.intersected) {
        //     }
        // } else if (2 === event.button) {
        // }
    }

    private _onClick(event: MouseEvent) {
        if (this.intersected) {
            this.onClick(event, this.intersected)            
        }
    }

    
    onIntersected(target = this.intersected) {
    }

    dispose() {
        document.removeEventListener('mousemove', this.setPickPosition.bind(this))
        document.removeEventListener('mouseout', this.clearPickPosition.bind(this))
        document.removeEventListener('mouseleave', this.clearPickPosition.bind(this))
        document.removeEventListener('mousedown', this._onClick.bind(this))
    }
}
