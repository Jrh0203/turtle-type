import { Component } from "react";
import Result from "components/Result";
import Test from "components/Test";
import { words } from "helpers/words.json";
import "stylesheets/themes.scss";
import Header from "components/Header";
import Footer from "components/Footer";
import Turtle from "components/Turtle";
import { isMobile } from "react-device-detect";

interface State {
	currWord: string;
	typedWord: string;
	timer: number;
	setTimer: NodeJS.Timeout | null;
	timeLimit: number;
	typedHistory: string[];
	wpm: number;
	startTime: number;
	pair: string;
	started: boolean;
	changeSelected(x: number): void;
	selectedIdx: number;
	wpmGraph: any[];
	turtleTime: number;
	turtles: any[];
	turtlesBorn: number;
	turtlesKilled: number;
}
export default class App extends Component<{}, State> {
	letterSpot: any = {
		q: 0,
		a: 0,
		z: 0,
		w: 1,
		s: 1,
		x: 1,
		e: 2,
		d: 2,
		c: 2,
		r: 3,
		f: 3,
		v: 3,
		t: 3,
		g: 3,
		b: 3,
		y: 4,
		h: 4,
		n: 4,
		u: 4,
		j: 4,
		m: 4,
		i: 5,
		k: 5,
		o: 6,
		l: 6,
		p: 7,
	};
	letterDist: any = {
		q: 0,
		a: 1,
		z: 2,
		w: 0,
		s: 1,
		x: 2,
		e: 0,
		d: 1,
		c: 2,
		r: 0,
		f: 1,
		v: 2,
		t: 1,
		g: 2,
		b: 2,
		y: 0,
		h: 1,
		n: 2,
		u: 1,
		j: 2,
		m: 2,
		i: 0,
		k: 1,
		o: 0,
		l: 1,
		p: 0,
	};
	wordsConst = [...words];
	wordsOriginal = [...words];
	words: any = [
		"the",
		"turtles",
		"are",
		"coming",
		...this.wordsOriginal.sort(() => Math.random() - 0.5).slice(0, 4),
	];

	letterMapSum: any = {};
	letterMapCount: any = {};
	singletonSum: any = {};
	singletonCount: any = {};
	lastLetter = "";
	lastLetterTime = 0;
	timeAgo: any = {};

	state: State = {
		currWord: this.words[0],
		typedWord: "",
		timer: 80,
		wpm: 0,
		setTimer: null,
		timeLimit: 2,
		typedHistory: [],
		startTime: 0,
		pair: "",
		started: false,
		changeSelected: (x: number) => {
			if (x === 1) {
				this.words = [
					...this.wordsOriginal
						.sort(() => Math.random() - 0.5)
						.slice(0, 8),
				];
			} else {
				this.words = [
					"the",
					"turtles",
					"are",
					"coming",
					...this.wordsOriginal
						.sort(() => Math.random() - 0.5)
						.slice(0, 4),
				];
			}
			this.setState({
				selectedIdx: x,
				timeLimit: x === 1 ? 40 : 400,
				timer: x === 1 ? 40 : 400,
				currWord: this.words[0],
			});
		},
		selectedIdx: 0,
		wpmGraph: [],
		turtleTime: 0,
		turtles: [],
		turtlesBorn: 0,
		turtlesKilled: 0,
	};

	startTimer = () => {
		const intervalId = setInterval(() => {
			this.setState({ timer: this.state.timer - 1 }, () => {
				if (this.state.timer === 0 && this.state.setTimer) {
					clearInterval(this.state.setTimer);
					this.setState({ setTimer: null });
				}
			});
		}, 1000);

		this.setState({
			setTimer: intervalId,
			startTime: Date.now(),
			started: true,
		});
		this.timeAgo[-1] = Date.now();
	};
	startTurtles = () => {
		let newTurtles = [];
		const addCount = this.state.wpm > 0 ? 10 : 20;
		for (let i = 0; i < addCount; i += 1) {
			newTurtles.push({
				spawnTime: Date.now() + Math.random() * 10000,
				angle: Math.random() * 360,
			});
		}
		this.setState({
			turtleTime: Date.now(),
			turtles: newTurtles,
			turtlesBorn: this.state.turtlesBorn + addCount,
		});
		const moveit = (startTime: number, innerThis: any) => {
			if (this.state.startTime !== 0) {
				//if browser doesn't support requestAnimationFrame, generate our own timestamp using Date:
				const oldest =
					(Date.now() - innerThis.state?.turtles[0]?.spawnTime) /
					1000.0;
				if (
					(Date.now() - startTime < 1000000 && oldest < 13.7) ||
					innerThis.state?.turtles?.length === 0
				) {
					// if duration not met yet
					requestAnimationFrame(function (timestamp) {
						// call requestAnimationFrame again with parameters
						let additionalTurtles = [];
						const elapsed = Date.now() - startTime;
						const totalChars = innerThis.state.typedHistory.reduce(
							function (sum: number, ele: string) {
								return ele.length + sum;
							},
							0
						);
						console.log(totalChars);
						const turtleCap = Math.max(
							(elapsed / 1000.0) ** 1.45,
							Math.min(
								(innerThis.state.turtlesKilled * 4.5) / 5.0,
								((((innerThis.state.wpm * 5.0) / 60) *
									elapsed) /
									1000.0) *
									(4.0 / 5)
							)
						);
						const turtlesToBirth = Math.floor(
							turtleCap - innerThis.state.turtlesBorn
						);
						for (let i = 0; i < turtlesToBirth; i += 1) {
							additionalTurtles.push({
								spawnTime: Date.now(),
								angle: Math.random() * 360,
							});
						}
						innerThis.setState({
							turtleTime: Date.now(),
							turtles: [
								...innerThis.state.turtles,
								...additionalTurtles,
							],
							turtlesBorn:
								innerThis.state.turtlesBorn + turtlesToBirth,
						});
						moveit(startTime, innerThis);
					});
				} else {
					innerThis.setState({
						timer: 1,
						turtles: [],
					});
				}
			} else {
				innerThis.setState({
					turtles: [],
				});
			}
		};
		moveit(Date.now(), this);
	};
	computeWordScore = (word: String) => {
		let score = 0;
		let totalLets = 0;
		word = " " + word + "";
		for (let i = 0; i < word.length; i += 1) {
			const key = word.substring(i, i + 2);
			if (key in this.letterMapSum) {
				totalLets += 1;
				score += this.letterMapSum[key] / this.letterMapCount[key];
			} else if (word[i] in this.singletonSum) {
				totalLets += 1;
				score +=
					this.singletonSum[word[i]] / this.singletonCount[word[i]];
			}
		}
		if (totalLets <= 0) return 0;
		return score / totalLets;
	};

	computeNiceness = (word: String) => {
		let niceness = 0;
		for (let i = 1; i < word.length; i += 1) {
			let num1 = this.letterSpot[word[i - 1]];
			let num2 = this.letterSpot[word[i]];
			let spot1 = this.letterDist[word[i - 1]];
			let spot2 = this.letterDist[word[i]];
			if (num1 === num2) {
				niceness -= Math.abs(spot1 - spot2) ** 2;
				niceness += Math.random() / 2;
			}
			if (this.state.wpm > 85) {
				if (word[i] === word[i - 1]) {
					niceness -= 100;
				}
			}
			// if (i + 1 < word.length) {
			// 	let num3 = this.letterSpot[word[i + 1]];
			// 	if (num1 === num2 && num2 === num3) {
			// 		niceness -= 100;
			// 	}
			// }
			// if (Math.abs(num1 - num2) === 0.5) {
			// 	niceness += 5;
			// }

			// if (num1 === num2) {
			// 	niceness += 5;
			// }
			// // if ((num1 <= 3 && num2 >= 4) || (num2 <= 3 && num1 >= 4)) {
			// // 	niceness += 20;
			// // }
			// // if (num1 === 0 || num1 === 7 || num2 === 0 || num2 === 7) {
			// // 	niceness -= 5;
			// // }
			// // if (word[i - 1] === word[i]) {
			// // 	niceness -= 10;
			// // }
		}
		return niceness / words.length;
	};

	recordTest = (e: KeyboardEvent) => {
		const {
			typedWord,
			currWord,
			timer,
			timeLimit,
			setTimer,
			typedHistory,
		} = this.state;
		if (timer === 0) {
			if (e.key === "Tab") {
				this.resetTest();
				e.preventDefault();
			}
			return;
		}
		if (setTimer === null && e.key !== "Tab") this.startTimer();
		const currIdx = this.words.indexOf(currWord);
		const currWordEl = document.getElementById("active")!;
		currWordEl.scrollIntoView({ behavior: "smooth", block: "center" });
		const caret = document.getElementById("caret")!;
		caret.classList.remove("blink");
		setTimeout(() => caret?.classList.add("blink"), 500);
		const now = Date.now();
		if (e.key !== "Backspace") {
			if (this.lastLetter.length > 0) {
				const elapsed = now - this.lastLetterTime;
				const key = "" + this.lastLetter + e.key;
				if (!(key in this.letterMapSum)) {
					this.letterMapSum[key] = 0;
					this.letterMapCount[key] = 0;
				}
				if (!(e.key in this.singletonSum)) {
					this.singletonSum[e.key] = 0;
					this.singletonCount[e.key] = 0;
				}
				this.letterMapSum[key] += elapsed;
				this.letterMapCount[key] += 1;
				this.singletonSum[e.key] += elapsed;
				this.singletonCount[e.key] += 1;
			}
			this.lastLetter = e.key;
			this.lastLetterTime = now;
		}
		switch (e.key) {
			case "Tab":
				if (timer !== timeLimit || setTimer) {
					this.resetTest();
					document.getElementsByClassName("word")[0].scrollIntoView();
				}
				e.preventDefault();
				break;
			case " ":
				if (typedWord === "") return;

				let index = this.wordsOriginal.indexOf(typedWord);
				if (index !== -1) {
					this.wordsOriginal.splice(index, 1);
				}
				// console.log(this.letterMapSum);
				// console.log(this.wordsOriginal.length);
				// const heuristic =
				// 	this.state.selectedIdx <= 1
				// 		? this.computeNiceness
				// 		: this.computeWordScore;
				const heuristic = this.computeWordScore;
				let scores: any = [];
				for (let idx = 0; idx < this.wordsOriginal.length; idx += 1) {
					const wordScore = heuristic(this.wordsOriginal[idx]);
					if (wordScore > -10000)
						scores.push([wordScore, this.wordsOriginal[idx]]);
				}
				let sortFunction = (a: any, b: any) => {
					if (a[0] === b[0]) {
						return 0;
					} else {
						return a[0] < b[0] ? 1 : -1;
					}
				};
				scores = scores.sort(sortFunction);
				// let evil = this.state.selectedIdx === 1 ? false : true;
				let evil = true;

				let rand = Math.random();
				let mostCommon: string = "";
				// let num = this.state.selectedIdx === 0 ? 0.0 : 1.0;
				let num = 1.0;
				// console.log(num);

				if (rand < num) {
					if (evil) {
						mostCommon = scores[Math.floor(0)][1];
						let maxPair = Object.keys(this.letterMapSum)
							.filter((z: string) => z.indexOf(" ") === -1)
							.reduce((a, b) =>
								this.letterMapSum[a] / this.letterMapCount[a] >
								this.letterMapSum[b] / this.letterMapCount[b]
									? a
									: b
							);
						this.setState({ pair: maxPair });
					} else {
						mostCommon = scores[Math.floor(scores.length - 1)][1];
						let maxPair = Object.keys(this.letterMapSum)
							.filter((z: string) => z.indexOf(" ") === -1)
							.reduce((a, b) =>
								this.letterMapSum[a] / this.letterMapCount[a] <
								this.letterMapSum[b] / this.letterMapCount[b]
									? a
									: b
							);
						this.setState({ pair: maxPair });
					}
				} else {
					let index = Math.floor(Math.random() * scores.length);
					mostCommon = scores[index][1];
				}

				index = this.wordsOriginal.indexOf(mostCommon);
				if (index !== -1) {
					this.wordsOriginal.splice(index, 1);
				}
				currWordEl.classList.add(
					typedWord !== currWord ? "wrong" : "right"
				);
				this.setState({
					typedWord: "",
					currWord: this.words[currIdx + 1],
					typedHistory: [...typedHistory, typedWord],
				});
				const elapsed = (Date.now() - this.state.startTime) / 1000.0;
				//starts at word 0, time to finish typing the word at that index
				this.timeAgo[currIdx] = Date.now();
				const rollingWindow = 10;
				if (currIdx === 3 && this.state.selectedIdx === 0) {
					this.startTurtles();
				}
				if (currIdx >= 3) {
					const spaces = Math.min(
						this.words.indexOf(this.state.currWord),
						rollingWindow
					);
					let correctChars = 0;
					const result = [...typedHistory, typedWord].map(
						(typedWord, idx) =>
							typedWord === this.words[idx] &&
							currIdx - idx < rollingWindow
					);
					result.forEach((r, idx) => {
						if (r) correctChars += words[idx].length;
						// console.log(r, words[idx]);
					});
					// console.log(result);
					let rollingElapsed =
						(this.timeAgo[currIdx] -
							this.timeAgo[
								Math.max(currIdx - rollingWindow, -1)
							]) /
						1000.0;
					// console.log(rollingElapsed);
					// console.log(correctChars);
					// console.log(spaces);
					const wpm = Math.floor(
						((correctChars + spaces) * 60.0) / rollingElapsed / 5.0
					);
					this.setState({
						wpmGraph: [
							...this.state.wpmGraph,
							{ x: elapsed, y: wpm },
						],
					});
					// console.log(wpm);
					this.setState({ wpm: wpm });
				}
				if (currIdx > 4) this.words.push(mostCommon);
				break;
			case "Backspace":
				if (
					typedWord.length === 0 &&
					typedHistory[currIdx - 1] !== this.words[currIdx - 1]
				) {
					this.setState({
						currWord: this.words[currIdx - 1],
						typedWord: !e.ctrlKey ? typedHistory[currIdx - 1] : "",
						typedHistory: typedHistory.splice(
							0,
							typedHistory.length - 1
						),
					});
					currWordEl.previousElementSibling!.classList.remove(
						"right",
						"wrong"
					);
					if (e.ctrlKey) {
						currWordEl.previousElementSibling!.childNodes.forEach(
							(char) => {
								if (char instanceof HTMLSpanElement)
									char.classList.remove("wrong", "right");
							}
						);
					}
				} else {
					if (e.ctrlKey) {
						this.setState({ typedWord: "" });
						currWordEl.childNodes.forEach((char) => {
							if (char instanceof HTMLSpanElement)
								char.classList.remove("wrong", "right");
						});
					} else {
						this.setState(
							{
								typedWord: typedWord.slice(
									0,
									typedWord.length - 1
								),
							},
							() => {
								let idx = this.state.typedWord.length;
								if (idx < currWord.length)
									currWordEl.children[
										idx + 1
									].classList.remove("wrong", "right");
							}
						);
					}
				}
				break;
			default:
				this.setState({ typedWord: typedWord + e.key }, () => {
					const { typedWord } = this.state;
					let idx = typedWord.length - 1;
					currWordEl.children[idx + 1].classList.add(
						currWord[idx] !== typedWord[idx] ? "wrong" : "right"
					);
					if (currWord[idx] === typedWord[idx]) {
						this.setState({
							turtles: this.state.turtles.slice(1),
							turtlesKilled: this.state.turtlesKilled + 1,
						});
					}
				});
				break;
		}
	};

	resetTest = () => {
		document
			.querySelectorAll(".wrong, .right")
			.forEach((el) => el.classList.remove("wrong", "right"));
		if (this.state.setTimer) {
			clearInterval(this.state.setTimer);
		}
		// this.words = [...this.wordsConst];
		// this.words = this.words.sort(() => Math.random() - 0.5);
		this.words = [
			"the",
			"turtles",
			"are",
			"coming",
			...this.wordsOriginal.sort(() => Math.random() - 0.5).slice(0, 4),
		];
		this.wordsOriginal = [...this.wordsConst];
		this.setState({
			timer: this.state.timeLimit,
			currWord: this.words[0],
			typedWord: "",
			setTimer: null,
			typedHistory: [],
			wpm: 0,
			startTime: 0,
			pair: "",
			started: false,
			wpmGraph: [],
			selectedIdx: 0,
			turtleTime: 0,
			turtles: [],
			turtlesBorn: 0,
			turtlesKilled: 0,
		});

		this.letterMapSum = {};
		this.letterMapCount = {};
		this.singletonSum = {};
		this.singletonCount = {};
		this.lastLetter = "";
		this.lastLetterTime = 0;
		this.timeAgo = {};
		for (let i = 0; i < 26; i++) {
			let letter = (i + 10).toString(36);
			this.letterMapSum[letter] = 25;
			this.letterMapCount[letter] = 1;
		}
	};

	componentDidMount() {
		let theme = "azure";
		document.body.children[1].classList.add(theme);
		const selectedElements = document.querySelectorAll(
			`button[value="${theme}"], button[value="${1000}"]`
		);
		selectedElements.forEach((el) => {
			el.classList.add("selected");
		});
		const time = 400;
		this.setState({
			timer: time,
			timeLimit: time,
		});
		window.onkeydown = (e) => {
			if (
				e.key.length === 1 ||
				e.key === "Backspace" ||
				e.key === "Tab"
			) {
				this.recordTest(e);
			}
		};
		this.words = this.words.slice(0, 8);
		console.log(this.words);
		for (let i = 0; i < this.words.length; i += 1) {
			let index = this.wordsOriginal.indexOf(this.words[i]);
			if (index !== -1) {
				this.wordsOriginal.splice(index, 1);
			}
		}
		for (let i = 0; i < 26; i++) {
			let letter = (i + 10).toString(36);
			this.letterMapSum[letter] = 25;
			this.letterMapCount[letter] = 1;
		}
	}

	componentWillUnmount() {
		window.onkeydown = null;
	}

	changeTimeLimit(newLimit: number) {
		this.setState(
			{
				timeLimit: newLimit,
			},
			() => this.resetTest()
		);
	}
	angle = 290;
	dist = 500;
	killTime = 20;

	render() {
		const { setTimer, timer } = this.state;
		if (window.outerWidth >= 600)
			return (
				<>
					{this.state.turtles.map((turtle) => (
						<Turtle
							turtleTransform={{
								height: "40px",
								width: "40px",
								position: "fixed",
								"z-index": "10",
								top: "44%",
								left: "48.5%",
								transform: `translate(${
									(Math.cos((turtle.angle * Math.PI) / 180) *
										this.dist *
										1 *
										((this.state.turtleTime -
											turtle.spawnTime) /
											1000.0 -
											this.killTime)) /
									this.killTime
								}px, ${
									(Math.sin((turtle.angle * Math.PI) / 180) *
										this.dist *
										1 *
										((this.state.turtleTime -
											turtle.spawnTime) /
											1000.0 -
											this.killTime)) /
									this.killTime
								}px) rotate(${
									turtle.angle / 360.0
								}turn) scale(-1,${
									turtle.angle > 90 && turtle.angle < 270
										? -1
										: 1
								})`,
							}}
						/>
					))}

					{!setTimer ? (
						<Header
							changeTimeLimit={(newLimit: number) =>
								this.changeTimeLimit(newLimit)
							}
							selectedIdx={this.state.selectedIdx}
						/>
					) : null}
					{timer !== 0 ? (
						<Test
							words={this.words}
							currWord={this.state.currWord}
							typedWord={this.state.typedWord}
							typedHistory={this.state.typedHistory}
							timer={this.state.timer}
							wpm={this.state.wpm}
							pair={this.state.pair}
							started={this.state.started}
							selectedIdx={this.state.selectedIdx}
							turtlesKilled={this.state.turtlesKilled}
						/>
					) : (
						<Result
							words={this.words}
							typedHistory={this.state.typedHistory}
							timeLimit={this.state.timeLimit}
							spaces={this.words.indexOf(this.state.currWord)}
							resetTest={() => this.resetTest()}
							wpmGraph={this.state.wpmGraph}
							selectedIdx={this.state.selectedIdx}
							turtlesKilled={this.state.turtlesKilled}
						/>
					)}
					{!setTimer ? (
						<Footer
							changeSelected={this.state.changeSelected}
							selectedIdx={this.state.selectedIdx}
							resetTest={() => this.resetTest()}
							timer={this.state.timer}
							typedHistory={this.state.typedHistory}
						/>
					) : null}
				</>
			);
		else
			return (
				<>
					<p className="computer">
						{
							"hi sorry you need a computer\nto play turtle type\n</3\n\ndon't worry it's worth it"
						}
					</p>
				</>
			);
	}
}
