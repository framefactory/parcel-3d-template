/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

import * as React from "react";
import { CSSProperties } from "react";

import * as THREE from "three";

import ManipSource from "../helpers/ManipSource";
import Scene from "../scenes/Scene";

////////////////////////////////////////////////////////////////////////////////

export interface Canvas3DProps
{
    className?: string;
    style?: CSSProperties;
    scene?: Scene;
    play?: boolean;
}

interface Canvas3DState
{
    isPlaying: boolean;
}

export default class Canvas3D extends React.Component<Canvas3DProps, Canvas3DState>
{
    static defaultProps: Canvas3DProps = {
        className: "canvas-3d",
        scene: null,
        play: true
    };

    private static style: CSSProperties = {
        display: "block",
        width: "100%",
        height: "100%"
    };

    protected canvas: HTMLCanvasElement;
    protected renderer: THREE.WebGLRenderer;
    protected animHandler: number;
    protected manip: ManipSource;
    protected scene: Scene;

    constructor(props: Canvas3DProps)
    {
        super(props);

        this.state = {
            isPlaying: props.play
        };

        this.onRef = this.onRef.bind(this);
        this.onAnimationFrame = this.onAnimationFrame.bind(this);
        this.onResize = this.onResize.bind(this);
    }

    componentWillReceiveProps(nextProps: Canvas3DProps)
    {
        this.setState({
            isPlaying: nextProps.play
        });
    }

    start()
    {
        this.setState({
            isPlaying: true
        });
    }

    stop()
    {
        cancelAnimationFrame(this.animHandler);

        this.setState({
            isPlaying: false
        });
    }

    advance()
    {
        if (this.animHandler === 0) {
            this.scene.render();
        }
    }

    setScene(scene: Scene)
    {
        if (scene !== this.scene && this.manip) {
            if (this.scene) {
                this.manip.setListener(null);
            }
            if (scene && this.renderer) {
                scene.initialize(this.renderer, this.manip);
            }

            this.scene = scene;
        }
    }

    render()
    {
        const {
            className,
            style,
            scene
        } = this.props;

        this.setScene(scene);

        if (this.animHandler === 0) {
            this.onAnimationFrame();
        }

        const styles = Object.assign({}, Canvas3D.style, style);

        return (<canvas
            className={className}
            style={styles}
            ref={this.onRef}
        />);
    }

    protected onRef(canvas: HTMLCanvasElement)
    {
        this.canvas = canvas;

        if (canvas) {
            this.manip = new ManipSource(canvas, { touchable: true, scrollable: true });
            this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            this.setScene(this.props.scene);

            window.addEventListener("resize", this.onResize);
            this.onResize();

            this.onAnimationFrame();
        }
        else {
            cancelAnimationFrame(this.animHandler);
            window.removeEventListener("resize", this.onResize);

            this.manip.detach();
            this.manip = null;
            this.renderer = null;
        }
    }

    protected onAnimationFrame()
    {
        if (!this.state.isPlaying || !this.scene) {
            return;
        }

        this.animHandler = requestAnimationFrame(this.onAnimationFrame);
        this.scene.render();
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