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
    protected startTime: number;
    protected lastTime: number;

    constructor(delayStart: boolean = false)
    {
        this.camera = null;
        this.scene = new THREE.Scene();
        this.startTime = Date.now() * 0.001;
        this.lastTime = 0;

        this.isStarted = !delayStart;

        if (!delayStart) {
            this.camera = this.start(this.scene);
        }
    }

    /**
     * Called once before rendering starts. Override and set up your scene content in this method.
     * @param scene The internal Three.js scene. Attach all scene content to this object.
     */
    protected start(scene: THREE.Scene): THREE.Camera
    {
        return new THREE.PerspectiveCamera(55, 1, 0.01, 100);
    }

    /**
     * Called once per frame right before rendering. Update animations and parameters here.
     * @param time The time since rendering has started in secods.
     * @param delta The time between this frame and the previous frame.
     */
    update(time: number, delta: number)
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

        const time = Date.now() * 0.001 - this.startTime;
        this.update(time, time - this.lastTime);
        this.lastTime = time;

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
