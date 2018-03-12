/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

import * as THREE from "three";

export default class Scene
{
    protected camera: THREE.Camera;
    protected scene: THREE.Scene;
    protected isStarted: boolean;

    constructor(delayStart: boolean = false)
    {
        this.camera = null;
        this.scene = new THREE.Scene();

        this.isStarted = !delayStart;

        if (!delayStart) {
            this.camera = this.start(this.scene);
        }
    }

    protected start(scene: THREE.Scene): THREE.Camera
    {
        return new THREE.PerspectiveCamera(55, 1, 0.01, 100);
    }

    protected update(time: number)
    {

    }

    render(renderer: THREE.WebGLRenderer)
    {
        if (!this.isStarted) {
            this.camera = this.start(this.scene);
            this.isStarted = true;
        }

        if (!this.camera) {
            throw new Error("Scene.render - can't render, no camera initialized");
        }

        this.update(0);
        renderer.render(this.scene, this.camera);
    }

    resize(width: number, height: number)
    {
        if (!this.camera) {
            return;
        }

        if (this.camera.type === "PerspectiveCamera") {
            const camera = this.camera as THREE.PerspectiveCamera;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        else if (this.camera.type === "OrthographicCamera") {
            const camera = this.camera as THREE.OrthographicCamera;
            // TODO: update aspect
        }
    }
}
