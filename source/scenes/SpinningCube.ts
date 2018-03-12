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

/**
 * Example 3D scene with a dat.GUI controller, showing a spinning cube.
 */
export default class SpinningCube extends Scene
{
    box: THREE.Mesh;
    gui: dat.GUI;

    speed: number;
    color: string;

    /**
     * Called once before rendering starts. Set up your scene content here.
     * @param scene The internal Three.js scene. Attach all scene content to this object.
     */
    start(scene: THREE.Scene): THREE.Camera
    {
        // Create camera

        const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 100);
        camera.position.set(0, 0, 2);

        // Create lights

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

        // Create a spinning cube

        const boxGeo = new THREE.BoxBufferGeometry(1, 1, 1);
        const boxMat = new THREE.MeshStandardMaterial({
            color: "#ffffff",
            metalness: 0,
            roughness: 0.5,
        });
        this.box = new THREE.Mesh(boxGeo, boxMat);
        scene.add(this.box);

        // Add a GUI with a color picker and a speed slider

        this.gui = new dat.GUI();

        this.color = "#ffffff";
        this.gui.addColor(this, "color")

        this.speed = 0.5;
        this.gui.add(this, "speed", 0, 1, 0.01);

        // start method must return camera
        return camera;
    }

    /**
     * Called once per frame right before rendering. Update animations and parameters here.
     * @param time The time since rendering has started in secods.
     * @param delta The time between this frame and the previous frame.
     */
    update(time: number, delta: number)
    {
        this.box.rotateX(2 * this.speed * delta);
        this.box.rotateY(1.3 * this.speed * delta);

        const mat = this.box.material as THREE.MeshStandardMaterial;
        mat.color = new THREE.Color(this.color);
    }
}
