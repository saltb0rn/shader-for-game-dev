import * as THREE from 'three'

import Access from './access.ts'
// import Mouse from './mouseEvent.ts'

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
        ground.name = 'floor'

        // const mouseCtl = new Mouse(ground)
        // mouseCtl.onClick = (event: MouseEvent, target: any) => {
        //     console.log(getObjectDepth(ground, Access.camera!))
        // }

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

        Access.on('sceneUpdate', () => {
            // console.log(getObjectDepth(ground, Access.camera!))
            
        })
    }

    dispose() {
        if (!Access.scene) return
        Access.clear(Access.scene)
        Access.scene = undefined
    }
}


// function getObjectDepth(obj: THREE.Mesh, camera: THREE.Camera) {
//     const MV = obj.modelViewMatrix.clone()
//     const P = camera.projectionMatrix.clone()
//     const MVP = P.multiply(MV)
//     const pos4 = new THREE.Vector4(obj.position.x, obj.position.y, obj.position.z, 1.)
//     const clip = pos4.applyMatrix4(MVP)
//     return clip.z / clip.w * 0.5 + 0.5
// }
