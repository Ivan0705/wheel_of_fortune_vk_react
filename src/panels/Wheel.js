import * as React from "react";
import Header from "./Header";
import wheel from "./Wheel.module.css"
import Axios from 'axios';
import coins from '../img/persik.png'


class Wheel extends React.Component {
    state = {
        list: [
            "10",
            "100",
            "150",
            "200",
            "250",
            "400",
            "700",
            "1000"
        ],
        prizes: [],
        radius: 75, // PIXELS
        rotate: 0, // DEGREES
        easeOut: 0, // SECONDS
        angle: 0, // RADIANS
        top: null, // INDEX
        offset: null, // RADIANS
        net: null, // RADIANS
        result: null, // INDEX
        spinning: false,
        balance: 100,
        openModal: false
    };

    componentDidMount() {
        this.renderWheel();
        Axios.get(`http://localhost:3001/allWinners`).then(res => {
            const prizes = res.data;
            this.setState({prizes});
            console.log(prizes)
        });
    }

    renderWheel() {
        let numOptions = this.state.list.length;
        let arcSize = (2 * Math.PI) / numOptions;
        this.setState({
            angle: arcSize
        });

        this.topPosition(numOptions, arcSize);

        let angle = 0;
        for (let i = 0; i < numOptions; i++) {
            let text = this.state.list[i] === "1000" ? "JACKPOT" : this.state.list[i]
            ;
            this.renderSector(i + 1, text, angle, arcSize, Wheel.getColor(i));
            angle += arcSize;
        }
    }

    topPosition = (num, angle) => {
        let topSpot = null;
        let degreesOff = null;
        if (num === 9) {
            topSpot = 7;
            degreesOff = Math.PI / 2 - angle * 2;
        } else if (num === 8) {
            topSpot = 6;
            degreesOff = 0;
        } else if (num <= 7 && num > 4) {
            topSpot = num - 1;
            degreesOff = Math.PI / 2 - angle;
        } else if (num === 4) {
            topSpot = num - 1;
            degreesOff = 0;
        } else if (num <= 3) {
            topSpot = num;
            degreesOff = Math.PI / 2;
        }

        this.setState({
            top: topSpot - 1,
            offset: degreesOff
        });
    };

    renderSector(index, text, start, arc, color) {
        let canvas = document.getElementById("wheel");
        let ctx = canvas.getContext("2d");
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        let radius = this.state.radius;
        let startAngle = start;
        let endAngle = start + arc;
        let angle = index * arc;
        let baseSize = radius * 2.23;
        let textRadius = baseSize / 1.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle, false);
        ctx.lineWidth = radius * 2;
        ctx.strokeStyle = color;

        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.stroke();

        ctx.save();
        ctx.translate(
            baseSize + Math.cos(angle - arc / 2) * textRadius,
            baseSize + Math.sin(angle - arc / 2) * textRadius
        );
        ctx.rotate(angle - arc / 2 + Math.PI / 2);
        ctx.fillText(text, (-ctx.measureText(text).width / 2) * 0.12, 0);
        ctx.restore();
    }

    static getColor(number) {
        if (number % 2 === 0) {
            return `rgba(255, 215,0)`;//жёлтый цвет
        } else {
            return `rgba(0,0,0)`;// чёрный цвет
        }
    }

    spin = () => {
        let randomSpin = Math.floor(Math.random() * 900) + 500;
        const paying = 5;
        this.setState({
            rotate: randomSpin,
            easeOut: 2,
            spinning: true,
            balance: this.state.balance - paying
        });

        setTimeout(() => {
            this.getResult(randomSpin);
        }, 2000);

        const balance = this.state.list[this.getIndexResult(randomSpin)];
        const winner = this.props.name;
        Axios.post('http://localhost:3001/play',
            {winner: winner, balance: balance}).then(() => {
            this.state.prizes.unshift({winner: winner, balance: balance})
        });
        setTimeout(() => {
            const openModal = this.setState({openModal: true});
            console.log(openModal)
        }, 1800)
    };

    getResult = spin => {
        const {angle, top, offset, list} = this.state;
        let netRotation = ((spin % 360) * Math.PI) / 180; // RADIANS
        let travel = netRotation + offset;
        let count = top + 1;
        while (travel > 0) {
            travel = travel - angle;
            count--;
        }
        let result;
        if (count >= 0) {
            result = count;
        } else {
            result = list.length + count;
        }

        this.setState({
            net: netRotation,
            result: result
        });
    };
    getIndexResult = spin => {
        let netRotation = ((spin % 360) * Math.PI) / 180;
        let travel = netRotation + this.state.offset;
        let count = this.state.top + 1;
        while (travel > 0) {
            travel = travel - this.state.angle;
            count--;
        }
        let result;
        if (count >= 0) {
            result = count;
        } else {
            result = this.state.list.length + count;
        }
        return result;
    };
    reset = () => {
        this.setState({
            rotate: 0,
            easeOut: 0,
            result: null,
            spinning: false,
            balance: this.state.list[this.state.result]
        });
    };

    render() {
        return (
            <div className={wheel.mainBlock}>
                <Header/>
                <div className={wheel.blockWheel}>
                    <div id="selector" className={wheel.arrow}>&#9660;</div>
                    <div className={wheel.display}>
                        <div>
                            <canvas
                                id="wheel"
                                width="320"
                                height="314"
                                style={{
                                    WebkitTransform: `rotate(${this.state.rotate}deg)`,
                                    WebkitTransition: `-webkit-transform ${
                                        this.state.easeOut
                                        }s ease-out`
                                }}
                            />
                        </div>
                        <div>
                            <div>
                                <div className={wheel.forPrize}>
                                    <div className={wheel.playForButton}>{}</div>
                                    <div
                                        className={wheel.playForButton}>{this.state.list[this.state.result] === "1000" ? "JACKPOT" : this.state.list[this.state.result]}</div>
                                </div>
                                <div className={wheel.forBalance}>
                                    <div className={wheel.twoPlayForButton}>BALANCE</div>
                                    <div
                                        className={wheel.twoPlayForButton}>{this.state.balance}</div>
                                </div>
                                {this.state.spinning ? (
                                    <div className={wheel.play} type="button" id="reset" onClick={this.reset}>
                                        <div className={wheel.resetForButton}> RESET</div>
                                    </div>
                                ) : (<div className={wheel.play} type="button" id="spin" onClick={this.spin}>
                                        <div className={wheel.playForButton}> SPIN</div>
                                        <div className={wheel.playForButton}> WHEEL</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={wheel.winnerList}>
                    <h2 className={wheel.winners}>WINNERS</h2>
                    <div>
                        {this.state.prizes.map((el, ind) => {
                            return <div className={wheel.winner} key={ind}>
                                <div className={wheel.wrapPhoto}>
                                    <img src={this.props.photo} alt={''}
                                         className={wheel.photo}/></div>
                                <div className={wheel.wrapInfo}>{el.winner}</div>
                                <div
                                    className={wheel.wrapInfo}> {el.balance === 1000 ?
                                    <div className={wheel.jackpot}>Jackpot</div> : el.balance}</div>
                            </div>
                        })}
                    </div>
                    {this.state.openModal && <div className={wheel.modalWrapper}>
                        <div className={wheel.prize}>
                            <div className={wheel.winners}>
                                <h3>
                                    YOU
                                    WIN!
                                    <br/>
                                    {this.state.list[this.state.result] === "1000" ? "JACKPOT" : this.state.list[this.state.result]}
                                    <img src={coins} alt={''} width={"25px"}/>
                                </h3>
                            </div>
                            <br/>
                            <div>
                                <div className={wheel.great} onClick={() => {
                                    this.setState({openModal: false});
                                }}>
                                    <div className={wheel.playForButton}>GREAT</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    }
                </div>
            </div>
        );
    }
}

export default Wheel;
