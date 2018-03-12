/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

import * as React from "react";
import { CSSProperties } from "react";

import * as THREE from "three";

import Scene from "../scenes/Scene";

////////////////////////////////////////////////////////////////////////////////

export interface Canvas3dProps
{
    className?: string;
    style?: CSSProperties;
    scene: Scene | typeof Scene;
}

export default class Canvas3d extends React.Component<Canvas3dProps, {}>
{
    static defaultProps: Canvas3dProps = {
        className: "canvas-3d",
        scene: Scene
    };

    private static style: CSSProperties = {
        display: "block",
        width: "100%",
        height: "100%"
    };

    protected canvas: HTMLCanvasElement;
    protected renderer: THREE.WebGLRenderer;
    protected animHandler: number;
    protected scene: Scene;

    constructor(props: Canvas3dProps)
    {
        super(props);

        this.onAnimationFrame = this.onAnimationFrame.bind(this);
        this.onRef = this.onRef.bind(this);
        this.onResize = this.onResize.bind(this);

        if (typeof this.props.scene === "function") {
            this.scene = new this.props.scene();
        }
        else {
            this.scene = this.props.scene;
        }
    }

    render()
    {
        const {
            className,
            style,
            children
        } = this.props;

        const stylesCombined = Object.assign({}, Canvas3d.style, style);

        return (<canvas
            className={className}
            style={stylesCombined}
            ref={this.onRef}
        />);
    }

    protected onAnimationFrame()
    {
        this.animHandler = requestAnimationFrame(this.onAnimationFrame);
        this.scene.render(this.renderer);
    }

    protected onRef(canvas: HTMLCanvasElement)
    {
        this.canvas = canvas;

        if (canvas) {
            this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            window.addEventListener("resize", this.onResize);
            this.onResize();
            this.onAnimationFrame();
        }
        else {
            cancelAnimationFrame(this.animHandler);
            window.removeEventListener("resize", this.onResize);
            this.renderer = null;
        }
    }

    protected onResize()
    {
        if (!this.canvas) {
            return;
        }

        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.renderer.setSize(width, height, false);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.scene.resize(width, height);
    }
}
