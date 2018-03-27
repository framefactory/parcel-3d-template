/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

import * as THREE from "three";
import ManipSource from "../helpers/ManipSource";

////////////////////////////////////////////////////////////////////////////////

export default class Scene
{
    protected scene: THREE.Scene;
    protected camera: THREE.Camera;
    protected renderer: THREE.WebGLRenderer;
    protected manip: ManipSource;

    protected loadingManager: THREE.LoadingManager;
    protected isInitialized: boolean;
    protected startTime: number;
    protected lastTime: number;

    constructor()
    {
        this.scene = new THREE.Scene();
        this.camera = null;

        this.startTime = Date.now() * 0.001;
        this.lastTime = 0;

        this.isInitialized = false;

        this.onLoadingStart = this.onLoadingStart.bind(this);
        this.onLoadingProgress = this.onLoadingProgress.bind(this);
        this.onLoadingCompleted = this.onLoadingCompleted.bind(this);
        this.onLoadingError = this.onLoadingError.bind(this);

        const manager = this.loadingManager = new THREE.LoadingManager();
        manager.onStart = this.onLoadingStart;
        manager.onProgress = this.onLoadingProgress;
        manager.onLoad = this.onLoadingCompleted;
        manager.onError = this.onLoadingError;
    }

    initialize(renderer: THREE.WebGLRenderer, manip?: ManipSource)
    {
        if (!this.isInitialized) {
            this.renderer = renderer;
            this.manip = manip;

            this.camera = this.setup(this.scene);
            this.isInitialized = true;
        }
    }

    render()
    {
        if (!this.isInitialized) {
            throw new Error("Scene.render - can't render, scene not initialized");
        }

        if (!this.camera) {
            throw new Error("Scene.render - can't render, camera not defined");
        }

        const time = Date.now() * 0.001 - this.startTime;
        this.update(time, time - this.lastTime);
        this.lastTime = time;

        this.renderer.render(this.scene, this.camera);
    }

    resize(width: number, height: number)
    {
        if (!this.camera) {
            return;
        }

        const aspect = width / height;

        if (this.camera.type === "PerspectiveCamera") {
            const camera = this.camera as THREE.PerspectiveCamera;
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
        }
        else if (this.camera.type = "OrthographicCamera") {
            const camera = this.camera as THREE.OrthographicCamera;
            camera.left = camera.bottom * aspect;
            camera.right = camera.top * aspect;
            camera.updateProjectionMatrix();
        }
    }

    protected setup(scene: THREE.Scene): THREE.Camera
    {
        return new THREE.PerspectiveCamera(55, 1, 0.01, 100);
    }

    protected update(time: number, delta: number)
    {
    }

    protected onLoadingStart()
    {
        console.log("Loading files...");
    }

    protected onLoadingProgress(url, itemsLoaded, itemsTotal)
    {
        console.log(`Loaded ${itemsLoaded} of ${itemsTotal} files: ${url}`);
    }

    protected onLoadingCompleted()
    {
        console.log("Loading completed");
    }

    protected onLoadingError()
    {
        console.error(`Loading error`);
    }
}