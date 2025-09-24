// Modified from: https://github.com/maximeq/three-js-disposer/blob/r4.130/src/disposer.ts

import { Mesh, SkinnedMesh, type Object3D } from "three";

export default class Disposer {
    disposeOnCascade = (function () {
        function disposeNode(node: Object3D) {
            if (node instanceof Mesh) {
                if (node.geometry) {
                    node.geometry.dispose();
                }

                if (node.material) {
                    if (node.material && Array.isArray(node.material)) {
                        for (let i = 0; i < node.material.length; ++i) {
                            const mtrl = node.material[i];
                            for (const key in mtrl) {
                                if (mtrl[key] && mtrl[key].isTexture) {
                                    mtrl[key].dispose()
                                }
                            }
                            if (mtrl.map) mtrl.map.dispose();
                            if (mtrl.lightMap) mtrl.lightMap.dispose();
                            if (mtrl.bumpMap) mtrl.bumpMap.dispose();
                            if (mtrl.normalMap) mtrl.normalMap.dispose();
                            if (mtrl.specularMap) mtrl.specularMap.dispose();
                            if (mtrl.envMap) mtrl.envMap.dispose();

                            mtrl.dispose();    // disposes any programs associated with the material
                        }
                    }
                    else {
                        for (const key in node.material) {
                            if (node.material[key] && node.material[key].isTexture) {
                                node.material[key].dispose()
                            }
                        }
                        if (node.material.map) node.material.map.dispose();
                        if (node.material.lightMap) node.material.lightMap.dispose();
                        if (node.material.bumpMap) node.material.bumpMap.dispose();
                        if (node.material.normalMap) node.material.normalMap.dispose();
                        if (node.material.specularMap) node.material.specularMap.dispose();
                        if (node.material.envMap) node.material.envMap.dispose();

                        node.material.dispose();   // disposes any programs associated with the material
                    }
                }

                if (node instanceof SkinnedMesh) {
                    node.skeleton.dispose()
                }
            }
        }   // disposeNode

        function disposeHierarchy(node: Object3D, callback: (node: Object3D) => void) {
            for (var i = node.children.length - 1; i >= 0; i--) {
                var child = node.children[i];
                disposeHierarchy(child, callback);
                callback(child);
            }
        }

        return function (o: Object3D) {
            disposeHierarchy(o, disposeNode);
        };

    })();
}
