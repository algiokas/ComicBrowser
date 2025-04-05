import React, { Component } from "react";
import GalleryItem from "../coverGallery/galleryItem";
import PageSelect from "../../shared/pageSelect";
import BookInfo from "./slideshow-sidebar-bookInfo";
import { BooksViewMode } from "../../../util/enums";
import ISlideshow from "../../../interfaces/slideshow";
import IBook from "../../../interfaces/book";
import { IBookSearchQuery }from "../../../interfaces/searchQuery";
import { GetCoverPath } from "../../../util/helpers";
import Modal from "../../shared/modal";
import SavePanel from "./slideshow-save-panel";
import ChevronRightImg from "../../../img/chevron-right.svg";

interface SidebarProps {
    showSidebar: boolean,
    slideshow: ISlideshow,
    currentPage: number,
    pageCount: number,
    intervalLength: number,
    intervalCount: number,
    viewMode: BooksViewMode,
    gridView: boolean,
    playing: boolean,

    toggleSidebar(): void,
    toggleGrid(): void,
    previousPage(): void,
    nextPage(): void,
    handleIntervalChange(e: React.ChangeEvent<HTMLInputElement>): void,
    playPause(): void,
    setPage(n: number): void,
    resetPage(): void,

    galleryItemClickHandler(book: IBook, bookIndex: number): void,
    addButtonHandler(book: IBook): void,
    removeButtonHandler(index: number): void,
    emptySlideshow(): void,
    updateBook(book: IBook): void,
    deleteBook(bookId: number): void,
    viewSearchResults(query?: IBookSearchQuery): void,
    createCollection(collectionName: string, coverBookId: number): void
}

interface SidebarState {
    sidebarRef: React.RefObject<HTMLDivElement>,
    coversRef: React.RefObject<HTMLDivElement>,
    listingHeight: number,
    showSaveModal: boolean
}

class Sidebar extends Component<SidebarProps, SidebarState> {
    constructor(props: SidebarProps) {
        super(props);

        this.state = {
            sidebarRef: React.createRef<HTMLDivElement>(),
            coversRef: React.createRef<HTMLDivElement>(),
            listingHeight: 0,
            showSaveModal: false
        };
    }

    // NOTE: Pretty sure this function will never fire since sidebarRect is never set 
    // updateListingHeight() {
    //     if (this.sidebarRef && this.sidebarRect) {
    //         const sidebarRect = this.sidebarRef.current.getBoundingClientRect();
    //         const listingRect = this.coversRef.current.getBoundingClientRect();

    //         const sidebarBottom = sidebarRect.top + sidebarRect.height
    //         const targetHeight = sidebarBottom - 10 - listingRect.top

    //         this.setState({
    //             listingHeight: targetHeight
    //         })
    //     }
    // }

    hideCurrentPage = () => {
        console.log(`hide page ${this.props.currentPage}`)
        if (this.props.updateBook) {
            let req = this.props.slideshow.books[0]
            if (!req.hiddenPages) {
                req.hiddenPages = [this.props.currentPage]
            }
            else {
                if (!req.hiddenPages.includes(this.props.currentPage)) {
                    req.hiddenPages.push(this.props.currentPage)
                }
            }
            this.props.updateBook(req)
            if (this.props.currentPage < this.props.pageCount - 1) {
                this.props.setPage(this.props.currentPage + 1)
            } else {
                this.props.setPage(this.props.currentPage - 1)
            }
        }
    }

    unhidePage = (pageNum: number) => {
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

    addTagToBook = (tag: string) => {
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

    toggleSaveModal = (): void => {
        this.setState((state) => {
            return ({ showSaveModal: !state.showSaveModal })
        })
    }

    resetSlideshow = () => {
        this.props.setPage(0)
    }

    render() {
        return (
            <div className="slideshow-sidebar-container">
                <div className="slideshow-sidebar-toggle stepper-arrow" onClick={this.props.toggleSidebar}>
                    <img src={ChevronRightImg.toString()} className={`svg-icon ${this.props.showSidebar ? 'mirror' : ''}`} alt="stepper left"></img>
                </div>
                <div className="slideshow-sidebar" ref={this.state.sidebarRef}>
                    <PageSelect currentPage={this.props.currentPage}
                        totalPages={this.props.pageCount}
                        setPage={this.props.setPage} />
                    <div className="slideshow-sidebar-stack slideshow-controls">
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
                    <div className="slideshow-sidebar-stack slideshow-controls">
                        <button className="media-button play" onClick={this.props.playPause}>{this.props.playing ? "Pause" : "Play"}</button>
                        <button className="media-button reset" onClick={this.props.resetPage}>Reset</button>
                    </div>
                    {
                        this.props.viewMode === BooksViewMode.Slideshow ?
                            <div className="slideshow-sidebar-stack slideshow-controls">
                                <button className="media-button play" onClick={this.props.emptySlideshow}>Clear</button>
                                <button className="media-button" onClick={this.props.toggleGrid}>{`${this.props.gridView ? 'Hide' : 'Show'} Grid`}</button>
                            </div>
                            :
                            <div className="slideshow-sidebar-stack slideshow-controls">
                                <button className="media-button" onClick={this.hideCurrentPage}>Hide Page</button>
                                <button className="media-button" onClick={this.props.toggleGrid}>{`${this.props.gridView ? 'Hide' : 'Show'} Grid`}</button>
                            </div>
                    }
                    {
                        this.props.viewMode === BooksViewMode.Slideshow ?
                            <div className="slideshow-covers-container">
                                <div className="slideshow-info">
                                    {
                                        this.props.slideshow.id !== 0 && this.props.slideshow.id ?
                                            <button className="saveupdate-button" onClick={() => {this.toggleSaveModal()}}>Update Slideshow</button> :
                                            <button className="saveupdate-button" onClick={() => {this.toggleSaveModal()}}>Save Slideshow</button>
                                    }
                                    <Modal modalId={"saveUpdate-modal"} displayModal={this.state.showSaveModal} toggleModal={this.toggleSaveModal}>
                                        <SavePanel 
                                        currentSlideshow={this.props.slideshow} 
                                        toggleDisplay={this.toggleSaveModal}
                                        createCollection={this.props.createCollection}/>
                                    </Modal>
                                    {"Slideshow: " + this.props.slideshow.name + " ID: " + this.props.slideshow.id}
                                </div>
                                <div className="slideshow-covers" ref={this.state.coversRef}>
                                    {
                                        this.props.slideshow.books.map((book, index) => {
                                            return <GalleryItem
                                                key={index}
                                                index={index}
                                                book={book}
                                                coverUrl={GetCoverPath(book)}
                                                subtitle=""
                                                addButtonHandler={this.props.addButtonHandler}
                                                removeButtonHandler={this.props.removeButtonHandler}
                                                bodyClickHandler={this.props.galleryItemClickHandler} />
                                        })
                                    }
                                </div>
                            </div>
                            :
                            <BookInfo
                                book={this.props.slideshow.books[0]}
                                addButtonHandler={this.props.addButtonHandler}
                                viewSearchResults={this.props.viewSearchResults}
                                unhidePage={this.unhidePage}
                                updateBook={this.props.updateBook}
                                deleteBook={this.props.deleteBook} />

                    }

                </div>
            </div>
        )
    }
}

export default Sidebar