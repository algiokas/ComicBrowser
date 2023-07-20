import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import PageSelect from "./pageSelect";
import BookInfo from "./slideshow-sidebar-bookInfo";
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
        if (this.sidebarRef && this.sidebarRect) {
            const sidebarRect = this.sidebarRef.current.getBoundingClientRect();
            const listingRect = this.coversRef.current.getBoundingClientRect();
    
            const sidebarBottom = sidebarRect.top + sidebarRect.height
            const targetHeight = sidebarBottom - 10 - listingRect.top
    
            this.setState({
                listingHeight: targetHeight
            })
        }
    }

    hideCurrentPage = () => {
        console.log(`hide page ${this.props.currentPage}`)
        if (this.props.updateBook) {
            let req = this.props.slideshow.books[0]
            if (!req.hiddenPages) {
                req.hiddenPages = [ this.props.currentPage ]
            }
            else {
                if (!req.hiddenPages.includes(this.props.currentPage)) {
                    req.hiddenPages.push(this.props.currentPage)
                }
            }
            this.props.updateBook(req)
            if (this.props.currentPage < this.props.pageCount-1) {
                this.props.setPage(this.props.currentPage+1)
            } else {
                this.props.setPage(this.props.currentPage-1)
            }
        }
    }

    unhidePage = (pageNum) => {
        console.log(`un-hide page ${pageNum}`)
        if (this.props.updateBook) {
            let req = this.props.slideshow.books[0]
            if (req.hiddenPages && req.hiddenPages.includes(pageNum)) {
                req.hiddenPages = req.hiddenPages.filter((p) => {
                    return p !== pageNum
                })
                this.props.updateBook(req)
                this.props.setPage(pageNum)
            }
        }
    }

    addTagToBook = (tag) => {
        console.log(`add tag "${tag}" to book`)
        if (this.props.updateBook) {
            let req = this.props.slideshow.books[0]
            if (req.tags) {
                req.tags.push(tag)
            } else {
                req.tags = [tag]
            }
            this.props.updateBook(req)
        }
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
                        currentPage={this.props.currentPage} 
                        totalPages={this.props.pageCount}
                        setPage={this.props.setPage}>
                    </PageSelect>
                    <div className="sidebar-stack slideshow-controls">
                        <span className="control-label">Interval</span>
                        <div className="interval-input">
                            <input type="number"
                                value={this.props.intervalLength}
                                onChange={this.props.handleIntervalChange}></input>
                        </div>
                        <div className="interval-counter">
                            <input type="number" disabled
                                value={this.props.intervalCount}></input>
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
                            : 
                            <div className="sidebar-stack slideshow-controls">
                            <button className="media-button" onClick={this.hideCurrentPage}>Hide Page</button>
                            <button className="media-button">TEST</button>
                        </div>
                    }
                    {
                        this.props.viewMode === ViewMode.Slideshow ?
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
                            :
                            <BookInfo
                                book={this.props.slideshow.books[0]}
                                addButtonHandler={this.props.addButtonHandler}
                                viewSearchResults={this.props.viewSearchResults}
                                unhidePage={this.unhidePage}
                                addTagToBook={this.addTagToBook}>
                            </BookInfo>

                    }

                </div>
            </div>
        )
    }
}

export default Sidebar