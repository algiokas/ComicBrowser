import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import PageSelect from "./pageSelect";
import { ViewMode } from "../App";

class Sidebar extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          containerRect: { left: 0, width: 0 },
          listingHeight: 0
        };

        this.sidebarRef = React.createRef()
        this.coversRef = React.createRef()
    }

    updateListingHeight() {
        const sidebarRect = this.sidebarRef.current.getBoundingClientRect();
        const listingRect = this.coversRef.current.getBoundingClientRect();

        const sidebarBottom = sidebarRect.top + sidebarRect.height
        const targetHeight = sidebarBottom - 10 - listingRect.top

        this.setState({
            listingHeight: targetHeight
        })
    }

    componentDidMount() {
        this.updateListingHeight()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.viewMode !== this.props.viewMode) {
            this.updateListingHeight()
        }
    }

    render() {
        return (
            <div className="sidebar-container">
                <div className="sidebar-toggle stepper-arrow" onClick={this.props.toggleSidebar}>
                    <img src="http://localhost:9000/data/images/chevron-right.svg" className={`svg-icon ${this.props.showSidebar ? 'mirror' : ''}`} alt="stepper left"></img>
                </div>
                <div className="slideshow-sidebar" ref={this.sidebarRef}>
                    <PageSelect
                        previousPage={this.props.previousPage}
                        nextPage={this.props.nextPage}
                        currentPage={this.props.currentPage}
                        totalPages={this.props.pageCount}>
                    </PageSelect>
                    <div className="sidebar-stack slideshow-controls">
                        <span className="control-label">Interval</span>
                        <div className="interval-input">
                            <input type="number"
                                value={this.props.interval}
                                onChange={this.props.handleIntervalChange}></input>
                        </div>
                    </div>
                    <div className="sidebar-stack slideshow-controls">
                        <button className="media-button play" onClick={this.props.playPause}>{this.props.playing ? "Pause" : "Play"}</button>
                        <button className="media-button reset" onClick={this.props.resetPage}>Reset</button>
                    </div>
                    {
                        this.props.viewMode === ViewMode.Slideshow ?
                            <div className="sidebar-stack slideshow-controls">
                                <button className="media-button play" onClick={this.props.emptySlideShow}>Clear</button>
                                <button className="media-button reset" onClick={this.props.saveCurrentSlideshow}>Save</button>
                            </div>
                            : null
                    }
                    <div className="slideshow-covers"  ref={this.coversRef} style={this.state.listingHeight > 0 ? { height: this.state.listingHeight } : null}>
                        {
                            this.props.slideshow.books.map((book, index) => {
                                return <GalleryItem
                                    book={book}
                                    index={index}
                                    addButtonHandler={this.props.addButtonHandler}
                                    removeButtonHandler={this.props.removeButtonHandler}
                                    bodyClickHandler={this.props.galleryItemClickHandler}>
                                </GalleryItem>
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Sidebar