import { Component } from "react";
import "stylesheets/Result.scss";
import { FaTwitter } from "react-icons/fa";
import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Line, Scatter } from "react-chartjs-2";
import ReactGA from "react-ga";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface Props {
	words: string[];
	typedHistory: string[];
	timeLimit: number;
	spaces: number;
	resetTest: React.MouseEventHandler;
	wpmGraph: any[];
	selectedIdx: number;
}

export default class Result extends Component<Props> {
	speed = this.props.selectedIdx === 0 ? "faster" : "slower";
	shareString =
		'"' +
		"test" +
		'"\n\nhttps://twitter.com/theJohnHerrick/status/1418260277217296387?s=20';
	tempShareString = `.@theJohnHerrick made me type ${this.speed}. I typed ${
		this.props.wpmGraph[this.props.wpmGraph.length - 1].y
	} wpm. What about you?\n\nhttp://localhost:3000/`;
	share = () => {
		console.log("sharing");
		const urlencode = require("urlencode");
		// ReactGA.event({
		// 	category: "User",
		// 	action: "share",
		// });
		let url =
			"https://twitter.com/intent/tweet?text=" +
			urlencode(this.tempShareString);
		window.open(url, "_blank");
	};
	options = {
		responsive: true,
		showLine: true,
		plugins: {
			legend: {
				position: "top" as const,
				display: false,
			},
			title: {
				display: true,
				font: {
					size: 50,
				},
				text:
					this.props.wpmGraph[this.props.wpmGraph.length - 1].y +
					" wpm",
				color: "rgba(238, 218, 209, 1.0)",
			},
		},
		scales: {
			y: {
				ticks: {
					color: "rgba(238, 218, 209, 1.0)",
				},
			},
			x: {
				ticks: {
					color: "rgba(238, 218, 209, 1.0)",
				},
			},
		},
		maintainAspectRatio: false,
	};

	labels = ["January", "February", "March", "April", "May", "June", "July"];
	// --bg-color: #383e56 !important;
	// --font-color: #eedad1 !important;
	// --hl-color: #f69e7b !important;
	// --fg-color: #d4b5b0 !important;
	data = {
		datasets: [
			{
				label: "Dataset 1",
				data: this.props.wpmGraph,
				borderColor: "rgba(246, 158, 123, 1.0)",
				backgroundColor: "rgba(246, 158, 123, 1.0)",
			},
		],
	};
	render() {
		const { words, typedHistory, spaces, timeLimit } = this.props;
		let correctChars = 0;
		const result = typedHistory.map(
			(typedWord, idx) => typedWord === words[idx]
		);
		result.forEach((r, idx) => {
			if (r) correctChars += words[idx].length;
		});
		const wpm = ((correctChars + spaces) * 60) / timeLimit / 5;
		return (
			<div className="result">
				{/* <table>
					<tbody>
						<tr>
							<td colSpan={2} align="center">
								<h1>{Math.round(wpm) + " wpm"}</h1>
							</td>
						</tr>
						<tr>
							<th>Correct Words:</th>
							<td>{result.filter((x) => x).length}</td>
						</tr>
						<tr className="wrong">
							<th>Incorrect Words:</th>
							<td>{result.filter((x) => !x).length}</td>
						</tr>
						<tr>
							<td colSpan={2} align="center"></td>
						</tr>
					</tbody>
				</table> */}
				<div>
					<Scatter
						width={500}
						height={400}
						options={this.options}
						data={this.data}
					/>
				</div>
				<div className="center">
					<button
						className="share"
						onClick={() => {
							this.share();
						}}>
						<FaTwitter className="twitter" /> Share
					</button>
				</div>
			</div>
		);
	}
}
