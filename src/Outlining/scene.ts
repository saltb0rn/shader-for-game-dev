import * as THREE from 'three'

import Access from './access.ts'

export default class Scene {
    constructor() {
        Access.scene = new THREE.Scene()
        Access.scene.background = new THREE.Color('#1B43BA')
        this.initScene()
    }

    initScene() {

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(10.0, 10.0, 100.0, 100.0),
            new THREE.MeshStandardMaterial({ color: 'white' }))
        ground.castShadow = true
        ground.receiveShadow = true
        ground.position.set(0.0, 0.0, 0.0)
        ground.rotation.set(-Math.PI / 2.0, 0.0, 0.0)

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.0, 32.0, 32.0),
            new THREE.MeshStandardMaterial({ color: 'orange' })
        )
        sphere.castShadow = true
        sphere.receiveShadow = true
        sphere.position.set(-1.0, 2.0, 1.0)

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
            new THREE.MeshStandardMaterial({ color: 'hotpink' })
        )
        box.castShadow = true
        box.receiveShadow = true
        box.position.set(2.0, 0.75, 2.0)
        box.rotation.set(0.0, Math.PI / 3.0, 0.0)

        const dirLight = new THREE.DirectionalLight('#ffffff', 4.5)
        dirLight.castShadow = true
        dirLight.position.set(10.0, 10.0, 10.0)
        dirLight.target = ground

        const ambient = new THREE.AmbientLight('#ffffff')

        Access.camera!.lookAt(ground.position)
        Access.scene!.add(ground)
        Access.scene!.add(sphere)
        Access.scene!.add(box)
        Access.scene!.add(dirLight)
        Access.scene!.add(ambient)
    }

    dispose() {
        if (!Access.scene) return
        Access.clear(Access.scene)
        Access.scene = undefined
    }
}
