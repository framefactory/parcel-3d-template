/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

import * as THREE from "three";
import Scene from "./Scene";

import dat from "dat.gui/build/dat.gui.module";

////////////////////////////////////////////////////////////////////////////////

export default class SpinningCube extends Scene
{
    box: THREE.Mesh;
    gui: dat.GUI;

    speed: number;
    color: string;

    start(scene: THREE.Scene): THREE.Camera
    {
        // CAMERA

        const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 100);
        camera.position.set(0, 0, 2);

        // LIGHTS

        // Light 1: warm, front right up
        const dirLight1 = new THREE.DirectionalLight(0xffeedd, 1.0);
        dirLight1.position.set(2, 1.3, 2.5);
        scene.add(dirLight1);

        // Light 2: blueish, below, front left
        const dirLight2 = new THREE.DirectionalLight(0x88ccff, 0.3);
        dirLight2.position.set(-1.5, -2, 0.5);
        scene.add(dirLight2);

        // Light 3: warm, back left
        const dirLight3 = new THREE.DirectionalLight(0xffeedd, 1.0);
        dirLight3.position.set(-2.5, 2, -2);
        scene.add(dirLight3);

        // OBJECTS

        const boxGeo = new THREE.BoxBufferGeometry(1, 1, 1);
        const boxMat = new THREE.MeshStandardMaterial({
            color: "#ffffff",
            metalness: 0,
            roughness: 0.5,
        });
        this.box = new THREE.Mesh(boxGeo, boxMat);
        scene.add(this.box);

        // GUI

        this.gui = new dat.GUI();

        this.color = "#ffffff";
        this.gui.addColor(this, "color")

        this.speed = 0.5;
        this.gui.add(this, "speed", 0, 1, 0.01);

        return camera;
    }

    update(time: number)
    {
        this.box.rotateX(0.05 * this.speed);
        this.box.rotateY(0.03 * this.speed);

        const mat = this.box.material as THREE.MeshStandardMaterial;
        mat.color = new THREE.Color(this.color);
    }
}
