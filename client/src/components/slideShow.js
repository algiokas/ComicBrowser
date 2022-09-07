import React, { Component } from "react";
import { GetPagePathMulti } from "../util/helpers";
import Sidebar from "./slideshow-sidebar";

class Slideshow extends Component {
    constructor(props) {
        super(props)

        this.setSlideshowInterval = props.setSlideshowInterval.bind(this)
        this.setCurrentPage = props.setCurrentPage.bind(this)
        this.onImgLoad = this.onImgLoad.bind(this);

        this.state = {
            showSidebar: true,
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

    toggleSidebar = () => {
        this.setState((state) => {
            return { showSidebar: !state.showSidebar }
        })
    }

    previousPage = () => {
        if (this.props.currentPage > 0) {
            this.setCurrentPage(this.props.currentPage-1)
        }
    }

    nextPage = () => {
        if (this.props.currentPage < this.props.slideshow.pageCount - 1) {
            this.setCurrentPage(this.props.currentPage+1)
        }
    }

    firstPageOfBook = (book, bookIndex) => {
        let pageIndex = 0;
        for (let i=0; i<bookIndex; i++) {
            pageIndex += this.props.slideshow.books[i].pageCount
        }
        this.setCurrentPage(pageIndex)
    }

    resetPage = () => {
        this.props.setCurrentPage(0)
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

    render() {
        let sidebarProps = {
            toggleSidebar: this.toggleSidebar,
            previousPage: this.previousPage,
            nextPage: this.nextPage,         
            handleIntervalChange: this.handleIntervalChange,
            playPause: this.playPause,
            resetPage: this.resetPage,
            galleryItemClickHandler: this.firstPageOfBook,

            addButtonHandler: this.props.addButtonHandler,
            removeButtonHandler: this.props.removeButtonHandler,
            emptySlideShow: this.props.emptySlideShow,
            saveCurrentSlideshow: this.props.saveCurrentSlideshow,
            updateBook: this.props.updateBook,
            setPage: this.props.setCurrentPage,
            viewSearchResults: this.props.viewSearchResults,

            slideshow: this.props.slideshow,
            showSidebar: this.state.showSidebar,
            currentPage: this.props.currentPage,
            pageCount: this.props.slideshow.pageCount,
            interval: this.props.interval,
            viewMode: this.props.viewMode,
            playing: this.state.playing
        }

        return (
            <div className={`slideshow-container ${this.state.showSidebar ? "show-sidebar" : ""}`}>
                <div className="slideshow">
                    <img className={ `slideshow-image` }
                        src={GetPagePathMulti(this.props.slideshow.books, this.props.currentPage)}
                        alt={" page " + this.props.currentPage + 1}
                        onLoad={this.onImgLoad}>
                    </img>
                    <div className="slideshow-overlay">
                        <div className="overlay-left" onClick={this.previousPage}></div>
                        <div className="overlay-right" onClick={this.nextPage}></div>
                    </div>
                </div>
                <Sidebar {...sidebarProps}></Sidebar>
            </div>
        )
    }
}

export default Slideshow