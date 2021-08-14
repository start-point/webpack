import * as React from "react";
import './style.less'
type Props = {
    compiler:String,
    framework:String,
}

export const Home: React.FC<Props> = (props) => {
    return (
        <div className="home-wrap">
            <h1>Hello from {props.compiler} and {props.framework}!</h1>;
        </div>
    )
}