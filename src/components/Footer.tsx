import { Component } from "react";
import "stylesheets/Footer.scss";

interface Contributor {
	avatar_url: string;
	contributions: number;
	events_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	gravatar_id: string;
	html_url: string;
	id: number;
	login: string;
	node_id: string;
	organizations_url: string;
	received_events_url: string;
	repos_url: string;
	site_admin: boolean;
	starred_url: string;
	subscriptions_url: string;
	type: string;
	url: string;
}

interface Props {
	changeSelected(x: number): void;
	selectedIdx: number;
	resetTest(): void;
}

type Options = {
	modes: string[];
};

const messages: any = [
	"a",
	"Can you survive the turtles?",
	"No turtles, just a timed test",
];

const options: Options = {
	modes: ["Turtle", "Boring"],
};

interface State {
	contributors: [Contributor] | [];
	showList: boolean;
}
export default class Footer extends Component<Props> {
	state: State = {
		contributors: [],
		showList: false,
	};

	componentDidMount() {}

	render() {
		return (
			<div className="bottom-area">
				<div className="bottomButtons">
					{Object.entries(options.modes).map(([idx, choices]) => (
						<button
							className={
								"" + this.props.selectedIdx === idx
									? "selected"
									: "deselected"
							}
							onClick={() => {
								this.props.resetTest();
								this.props.changeSelected(parseInt(idx));
							}}>
							{choices}
						</button>
					))}

					{/* <button onClick={() => {}}>Clunky</button>
					<button onClick={() => {}}>Turtle</button> */}
				</div>
				<a href="." className="desc">
					{messages[this.props.selectedIdx + 1]}
				</a>
				<footer>
					<span>
						created by{" "}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://twitter.com/theJohnHerrick">
							@theJohnHerrick
						</a>
					</span>
				</footer>
			</div>
		);
	}
}
