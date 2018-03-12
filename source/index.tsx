/**
 * 3D Graphics Template
 *
 * @author Ralph Wiedemeier <ralph@framefactory.io>
 * @copyright (c) 2018 Frame Factory GmbH
 */

import "./index.scss"

import * as React from "react";
import * as ReactDOM from "react-dom";

import Canvas3d from "./components/Canvas3d";
import SpinningCube from "./scenes/SpinningCube";

ReactDOM.render(
    <Canvas3d scene={SpinningCube} />,
    document.getElementById("main")
);
