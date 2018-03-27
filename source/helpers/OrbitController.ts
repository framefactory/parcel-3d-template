/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

import * as THREE from "three";
import { ManipEvent, ManipListener } from "./ManipSource";

////////////////////////////////////////////////////////////////////////////////

const _PI = 3.141592653589793238462643383279;
const _DOUBLE_PI = _PI * 2;
const _DEG2RAD = 0.0174532925199432957692369076848;
const _limit = (v, min, max) => v < min ? min : (v > max ? max : v);

type Mode = "off" | "pan" | "orbit" | "dolly" | "zoom" | "pan-dolly" | "roll";
type Phase = "off" | "active" | "runout";

const _vec = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _spherical = new THREE.Spherical();

export interface OrbitPosition
{
    x: number;
    y: number;
    z: number;
    head: number;
    pitch: number;
    dist: number;
}

export default class OrbitController implements ManipListener
{
    target: THREE.Vector3;
    private camera: THREE.PerspectiveCamera;

    private mode: Mode;
    private phase: Phase;
    private lastEvent: ManipEvent;
    private viewportWidth: number;
    private viewportHeight: number;

    private deltaX;
    private deltaY;
    private deltaPinch;
    private deltaWheel;

    private rotToYUp: THREE.Quaternion;
    private rotFromYUp: THREE.Quaternion;
    private lastPosition: THREE.Vector3;
    private lastQuaternion: THREE.Quaternion;

    constructor(camera: THREE.PerspectiveCamera)
    {
        this.target = new THREE.Vector3();
        this.camera = camera;

        this.mode = "off";
        this.phase = "off";
        this.lastEvent = null;
        this.viewportWidth = 1;
        this.viewportHeight = 1;

        this.deltaX = 0;
        this.deltaY = 0;
        this.deltaPinch = 1;
        this.deltaWheel = 0;

        this.rotToYUp = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
        this.rotFromYUp = this.rotToYUp.clone().inverse();
        this.lastPosition = new THREE.Vector3();
        this.lastQuaternion = new THREE.Quaternion();
    }

    init()
    {
        this.updateCamera(0, 0, 0, 0, 1);
    }

    update(): boolean
    {
        let updated = false;

        if (this.deltaWheel !== 0) {
            this.updateCamera(0, 0, 0, 0, this.deltaWheel * -0.07 + 1);
            this.deltaWheel = 0;
            updated = true;
        }

        if (this.phase === "off") {
            return updated;
        }

        if (this.phase === "active") {
            this.updateManip();
            this.deltaX = 0;
            this.deltaY = 0;
            this.deltaPinch = 1;
        }
        else {
            this.deltaX *= 0.85;
            this.deltaY *= 0.85;
            this.deltaPinch = 1;
            this.updateManip();

            const delta = Math.abs(this.deltaX) + Math.abs(this.deltaY);
            if (delta < 0.1) {
                this.mode = "off";
                this.phase = "off";
            }
        }

        //console.log(this.getCamera());
        return true;
    }

    updateManip()
    {
        switch(this.mode) {
            case "orbit":
                this.updateCamera(0, 0, this.deltaX, this.deltaY, 1);
                break;
            case "pan":
                this.updateCamera(this.deltaX, this.deltaY, 0, 0, 1);
                break;
            case "dolly":
                this.updateCamera(0, 0, 0, 0, this.deltaY * 0.0075 + 1);
                break;
            case "pan-dolly":
                const pinchScale = (this.deltaPinch - 1) * 0.5 + 1;
                this.updateCamera(this.deltaX, this.deltaY, 0, 0, 1 / pinchScale);
                break;
        }
    }

    setCamera(position: OrbitPosition)
    {
        const camera = this.camera;

        _offset.copy(camera.position).sub(this.target);

        _offset.applyQuaternion(this.rotToYUp);
        _spherical.setFromVector3(_offset);

        _spherical.theta = position.head;
        _spherical.phi = position.pitch;
        _spherical.radius = position.dist;
        _spherical.makeSafe();

        _offset.setFromSpherical(_spherical);
        _offset.applyQuaternion(this.rotFromYUp);

        this.target.set(position.x, position.y, position.z);

        camera.position.copy(this.target).add(_offset);
        camera.lookAt(this.target);
    }

    getCamera(): OrbitPosition
    {
        const camera = this.camera;
        const target = this.target;

        _offset.copy(camera.position).sub(this.target);

        _offset.applyQuaternion(this.rotToYUp);
        _spherical.setFromVector3(_offset);

        return {
            x: target.x,
            y: target.y,
            z: target.z,
            head: _spherical.theta,
            pitch: _spherical.phi,
            dist: _spherical.radius
        };
    }

    updateCamera(dX, dY, dHead, dPitch, dScale)
    {
        //console.log("updateCamera", dX, dY, dHead, dPitch, dScale);
        if (this.lastEvent) {
            this.viewportWidth = (this.lastEvent.target as any).clientWidth;
            this.viewportHeight = (this.lastEvent.target as any).clientHeight;
        }

        const viewportHeight = this.viewportHeight;
        const viewportWidth = this.viewportWidth;

        const camera = this.camera;
        const target = this.target;

        _offset.copy(camera.position).sub(this.target);

        _offset.applyQuaternion(this.rotToYUp);
        _spherical.setFromVector3(_offset);

        _spherical.theta -= dHead * _DOUBLE_PI / viewportWidth;
        _spherical.phi -= dPitch * _DOUBLE_PI / viewportWidth;
        _spherical.phi = _limit(_spherical.phi, 0, _PI);
        _spherical.makeSafe();

        _spherical.radius = _limit(_spherical.radius * dScale, 0.05, 5);

        const distance = _offset.length() * Math.tan((camera.fov / 2) * _DEG2RAD);

        _vec.setFromMatrixColumn(camera.matrix, 0);
        _vec.multiplyScalar(-2 * dX * distance / viewportHeight);
        target.add(_vec);

        _vec.setFromMatrixColumn(camera.matrix, 1);
        _vec.multiplyScalar(2 * dY * distance / viewportHeight);
        target.add(_vec);

        _offset.setFromSpherical(_spherical);
        _offset.applyQuaternion(this.rotFromYUp);

        camera.position.copy(target).add(_offset);
        camera.lookAt(this.target);
    }

    onManipBegin(event: ManipEvent)
    {
        this.mode = this.getModeFromEvent(event);
        this.phase = "active";

        this.lastEvent = event;
        return true;
    }

    onManipUpdate(event: ManipEvent)
    {
        if (!event.isActive) {
            return;
        }

        let lastEvent = this.lastEvent;

        if (event.type === "up" || event.type === "down") {
            const mode = this.getModeFromEvent(event);
            if (mode !== this.mode) {
                lastEvent = event;

                if (event.type === "down") {
                    this.mode = mode;
                }
            }
        }

        this.deltaX += (event.centerX - lastEvent.centerX);
        this.deltaY += (event.centerY - lastEvent.centerY);

        const lastDistance = lastEvent.pinchDistance || event.pinchDistance;
        this.deltaPinch = lastEvent.pinchDistance > 0 ? (event.pinchDistance / lastDistance) : 1;

        this.lastEvent = event;
    }

    onManipEnd(event: ManipEvent)
    {
        this.phase = "runout";
    }

    onManipEvent(event: ManipEvent)
    {
        if (event.type === "wheel") {
            this.deltaWheel += _limit(event.wheel, -1, 1);
            this.lastEvent = event;
        }
    }

    private getModeFromEvent(event: ManipEvent): Mode
    {
        if (event.source === "mouse") {
            const button = event.button;

            // left button
            if (button === 0) {
                if (event.ctrlKey) {
                    return "pan";
                }
                if (event.altKey) {
                    return "dolly";
                }

                return "orbit";
            }

            // right button
            if (button === 2) {
                return "pan";
            }

            // middle button
            if (button === 1) {
                return "dolly";
            }
        }
        else if (event.source === "touch") {

            const count = event.touches.length;

            if (count === 1) {
                return "orbit";
            }

            if (count === 2) {
                return "pan-dolly";
            }

            return "pan";
        }
    }
}