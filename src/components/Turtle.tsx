import { Component } from "react";
import "stylesheets/Turtle.scss";
import mainLogo from "../turtle.png";

interface Props {
	turtleTransform: any;
}

export default class Turtle extends Component<Props> {
	// ratio = (this.props.currTime - this.props.spawnTime) / (1000.0 * 2);
	//ratio = 1;

	componentDidMount() {}

	render() {
		return (
			<div className="turtleBox">
				<img
					src={mainLogo}
					alt="fireSpot"
					style={this.props.turtleTransform}
				/>
			</div>
		);
	}
}
