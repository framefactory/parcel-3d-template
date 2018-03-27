/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

import * as THREE from "three";

import OrbitController from "../helpers/OrbitController";
import Scene from "./Scene";

////////////////////////////////////////////////////////////////////////////////

export default class OrbitControllerScene extends Scene
{
    controller: OrbitController;

    protected setup(scene: THREE.Scene, camPosition?: THREE.Vector3): THREE.Camera
    {
        const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 100);
        camPosition && camera.position.set(camPosition.x, camPosition.y, camPosition.z);

        const controller = this.controller = new OrbitController(camera);
        this.manip.setListener(this.controller);
        controller.init();

        return camera;
    }

    protected update(time: number, delta: number)
    {
        this.controller.update();
    }
}