import { Component } from "react";
import Result from "components/Result";
import Test from "components/Test";
import { words } from "helpers/words.json";
import "stylesheets/themes.scss";
import Header from "components/Header";
import Footer from "components/Footer";

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
	words: any = words.sort(() => Math.random() - 0.5);

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
				let scores: any = [];
				for (let idx = 0; idx < this.wordsOriginal.length; idx += 1) {
					const wordScore = this.computeWordScore(
						this.wordsOriginal[idx]
					);
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
				let evil = true;

				let rand = Math.random();
				let mostCommon: string = "";

				if (rand < 1.0) {
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
				if (elapsed >= 3) {
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
					console.log(result);
					let rollingElapsed =
						(this.timeAgo[currIdx] -
							this.timeAgo[
								Math.max(currIdx - rollingWindow, -1)
							]) /
						1000.0;
					console.log(rollingElapsed);
					console.log(correctChars);
					console.log(spaces);
					const wpm = Math.floor(
						((correctChars + spaces) * 60.0) / rollingElapsed / 5.0
					);
					console.log(wpm);
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
		this.words = [...this.wordsConst];
		this.words = this.words.sort(() => Math.random() - 0.5);
		this.words = this.words.slice(0, 8);
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
		const time = 40;
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

	render() {
		const { setTimer, timer } = this.state;
		return (
			<>
				{!setTimer ? (
					<Header
						changeTimeLimit={(newLimit: number) =>
							this.changeTimeLimit(newLimit)
						}
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
					/>
				) : (
					<Result
						words={this.words}
						typedHistory={this.state.typedHistory}
						timeLimit={this.state.timeLimit}
						spaces={this.words.indexOf(this.state.currWord)}
						resetTest={() => this.resetTest()}
					/>
				)}
				{!setTimer ? <Footer /> : null}
			</>
		);
	}
}
