/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

import * as React from "react";
import { CSSProperties } from "react";

import Canvas3d from "./Canvas3d";
import SpinningCube from "../scenes/SpinningCube";

////////////////////////////////////////////////////////////////////////////////

export interface ApplicationProps
{
    className?: string;
    style?: CSSProperties;
}

export default class Application extends React.Component<ApplicationProps, {}>
{
    static defaultProps: ApplicationProps = {
        className: "application"
    };

    constructor(props: ApplicationProps)
    {
        super(props);
    }

    render()
    {
        const {
            className,
            style,
            children
        } = this.props;

        return (<div
            className={className}
            style={style}>
        <Canvas3d
            scene={SpinningCube}/>
        </div>);
    }
}
