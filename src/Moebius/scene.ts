import * as THREE from 'three'

import Access from './access.ts'
import PerlinGroundMaterial from './materials/PerlinGroundMaterial'

export default class Scene {
    constructor() {
        Access.scene = new THREE.Scene()
        Access.scene.background = new THREE.Color('#1B43BA')
        this.initScene()
    }

    initScene() {

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100.0, 100.0, 100.0, 100.0),
            new PerlinGroundMaterial({ color: 'purple' })
        )
        ground.name = 'ground'
        ground.receiveShadow = true
        ground.position.set(0.0, 0.0, 0.0)
        ground.rotation.set(-Math.PI / 2.0, 0.0, 0.0)

        // const ground2 = new THREE.Mesh(
        //     new THREE.PlaneGeometry(10.0, 10.0, 100.0, 100.0),
        //     new THREE.MeshStandardMaterial({ color: 'white' })
        // )
        // ground2.receiveShadow = true
        // ground2.position.set(0.0, 0.0, 0.0)
        // ground2.rotation.set(-Math.PI / 2.0, 0.0, 0.0)
        // Access.scene!.add(ground2)

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

        const dirLight = new THREE.DirectionalLight('#fff', 4.5)
        dirLight.name = 'main-light'
        dirLight.castShadow = true
        dirLight.position.set(10.0, 10.0, 10.0)
        dirLight.target = ground

        Access.lights.push(dirLight)

        const ambient = new THREE.AmbientLight('#fff', 0.2)

        Access.camera!.lookAt(ground.position)
        Access.scene!.add(ground)
        Access.scene!.add(sphere)
        Access.scene!.add(box)
        Access.scene!.add(dirLight)
        Access.scene!.add(ambient)

        Access.on('animGround', () => {
            if (Access.clock) {
                ground.material.uniforms.uTime.value = Access.clock.elapsedTime
            }
        })
    }

    dispose() {
        if (!Access.scene) return
        Access.clear(Access.scene)
        Access.scene = undefined
    }
}
