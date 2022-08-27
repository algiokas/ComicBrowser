import React, { Component } from "react";
import { GetPagePathMulti } from "../helpers";

class SlideShow extends Component {
    constructor(props) {
        super(props)

        console.log(props.slideShow)

        this.setSlideshowInterval = props.setSlideshowInterval.bind(this)
        this.onImgLoad = this.onImgLoad.bind(this);

        console.log('new slideshow')
        console.log(props.slideShow)

        this.state = {
            currentBook: {},
            currentPage: 0,
            showSidebar: false,
            playing: false,
            intervalId: 0,
            imageDimensions: {}
        }
    }

    onImgLoad = ({target:img}) => {
        this.setState({imageDimensions :
            { width:img.naturalWidth, height:img.naturalHeight }
        });
    }

    isWideImage = () => {
        if (this.state.imageDimensions) {
            return this.state.imageDimensions.width > this.state.imageDimensions.height
        }
        return false;
    }

    toggleSidebar = () => {
        this.setState((state) => {
            return { showSidebar: !state.showSidebar }
        })
    }

    previousPage = () => {
        if (this.state.currentPage > 0) {
            this.setState((state) => {
                return { currentPage: state.currentPage - 1 };
            });
        }
    }

    nextPage = () => {
        if (this.state.currentPage < this.props.slideShow.pageCount - 1) {
            this.setState((state) => {
                return { currentPage: state.currentPage + 1 };
            });
        }
    }

    handleIntervalChange = (e) => {
        console.log('handle Interval')
        this.setSlideshowInterval(e.target.value)
    }

    playPause = () => {
        if (!this.state.playing) {
            console.log('play')
            let currentInterval = setInterval(this.nextPage, this.props.interval * 1000)
            this.setState({ intervalId: currentInterval })
            this.setState((state) => {
                return { playing: !state.playing }
            })
        }
        else {
            console.log('pause')
            clearInterval(this.state.intervalId);
            this.setState({ intervalId: 0 })
            this.setState((state) => {
                return { playing: !state.playing }
            })
        }
    }

    pause = () => {
        this.setState({ playing: false })
    }

    resetPage = () => {
        this.setState({ currentPage: 0 })
    }

    render() {
        return (
            <div className={`slideshow-container ${this.state.showSidebar ? "show-sidebar" : ""}`}>
                <div className="slideshow">
                    <img className={`slideshow-image ${this.isWideImage() ? "wide" : ""}` }
                        src={GetPagePathMulti(this.props.slideShow.books, this.state.currentPage)}
                        style={{ left: this.state.showSidebar ? '300px' : '0' }}
                        alt={" page " + this.currentPage + 1}
                        onLoad={this.onImgLoad}>
                    </img>
                    <div className="slideshow-overlay">
                        <div className="overlay-left" onClick={this.previousPage}></div>
                        <div className="overlay-right" onClick={this.nextPage}></div>
                    </div>
                </div>
                <div className="sidebar-toggle stepper-arrow" onClick={this.toggleSidebar}>
                    <img src="http://localhost:9000/data/images/chevron-right.svg" className={`svg-icon ${this.state.showSidebar ? 'mirror' : ''}`} alt="stepper left"></img>
                </div>
                <div className="slideshow-sidebar">
                    <div className="sidebar-stack slideshow-controls">
                        <div className="stepper-arrow mirror" onClick={this.previousPage}>
                            <img className="svg-icon" src="http://localhost:9000/data/images/chevron-right.svg" alt="stepper left"></img>
                        </div>
                        <div className="page-number">
                            {this.state.currentPage + 1}/{this.props.slideShow.pageCount}
                        </div>
                        <div className="stepper-arrow" onClick={this.nextPage}>
                            <img className="svg-icon" src="http://localhost:9000/data/images/chevron-right.svg" alt="stepper right"></img>
                        </div>
                    </div>
                    <div className="sidebar-stack slideshow-controls">
                        <span className="control-label">Interval</span>
                        <div className="interval-input">
                            <input type="number"
                                value={this.props.interval}
                                onChange={this.handleIntervalChange}></input>
                        </div>
                    </div>
                    <div className="sidebar-stack slideshow-controls">
                        <button className="media-button play" onClick={this.playPause}>{this.state.playing ? "Pause" : "Play"}</button>
                        <button className="media-button reset" onClick={this.resetPage}>Reset</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default SlideShow