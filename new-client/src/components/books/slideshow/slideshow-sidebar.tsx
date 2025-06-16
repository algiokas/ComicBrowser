import React, { useState } from "react";
import ChevronRightImg from "../../../img/svg/chevron-right.svg";
import type IBook from "../../../interfaces/book";
import type { IBookSearchQuery } from "../../../interfaces/searchQuery";
import type ISlideshow from "../../../interfaces/slideshow";
import { BooksViewMode } from "../../../util/enums";
import { GetCoverPath } from "../../../util/helpers";
import Modal from "../../shared/modal";
import PageSelect from "../../shared/pageSelect";
import GalleryItem from "../coverGallery/galleryItem";
import SavePanel from "./slideshow-save-panel";
import BookInfo from "./slideshow-sidebar-bookInfo";

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

const Sidebar = (props: SidebarProps) => {
    const [showSaveModal, setShowSaveModal] = useState<boolean>(false)

    // NOTE: Pretty sure this function will never fire since sidebarRect is never set 
    // updateListingHeight() {
    //     if (sidebarRef && sidebarRect) {
    //         const sidebarRect = sidebarRef.current.getBoundingClientRect();
    //         const listingRect = coversRef.current.getBoundingClientRect();

    //         const sidebarBottom = sidebarRect.top + sidebarRect.height
    //         const targetHeight = sidebarBottom - 10 - listingRect.top

    //         setState({
    //             listingHeight: targetHeight
    //         })
    //     }
    // }

    const hideCurrentPage = () => {
        console.log(`hide page ${props.currentPage}`)
        if (props.updateBook) {
            let req = props.slideshow.books[0]
            if (!req.hiddenPages) {
                req.hiddenPages = [props.currentPage]
            }
            else {
                if (!req.hiddenPages.includes(props.currentPage)) {
                    req.hiddenPages.push(props.currentPage)
                }
            }
            props.updateBook(req)
            if (props.currentPage < props.pageCount - 1) {
                props.setPage(props.currentPage + 1)
            } else {
                props.setPage(props.currentPage - 1)
            }
        }
    }

    const unhidePage = (pageNum: number) => {
        console.log(`un-hide page ${pageNum}`)
        if (props.updateBook) {
            let req = props.slideshow.books[0]
            if (req.hiddenPages && req.hiddenPages.includes(pageNum)) {
                req.hiddenPages = req.hiddenPages.filter((p) => {
                    return p !== pageNum
                })
                props.updateBook(req)
                props.setPage(pageNum)
            }
        }
    }

    const addTagToBook = (tag: string) => {
        console.log(`add tag "${tag}" to book`)
        if (props.updateBook) {
            let req = props.slideshow.books[0]
            if (req.tags) {
                req.tags.push(tag)
            } else {
                req.tags = [tag]
            }
            props.updateBook(req)
        }
    }

    const toggleSaveModal = (): void => {
        setShowSaveModal(!showSaveModal)
    }

    const resetSlideshow = () => {
        props.setPage(0)
    }

    return (
        <div className="slideshow-sidebar-container">
            <div className="slideshow-sidebar-toggle stepper-arrow" onClick={props.toggleSidebar}>
                <img src={ChevronRightImg.toString()} className={`svg-icon ${props.showSidebar ? 'mirror' : ''}`} alt="stepper left"></img>
            </div>
            <div className="slideshow-sidebar">
                <PageSelect currentPage={props.currentPage}
                    totalPages={props.pageCount}
                    setPage={props.setPage} />
                <div className="slideshow-sidebar-stack slideshow-controls">
                    <span className="control-label">Interval</span>
                    <div className="interval-input">
                        <input type="number"
                            value={props.intervalLength}
                            onChange={props.handleIntervalChange}></input>
                    </div>
                    <div className="interval-counter">
                        <input type="number" disabled
                            value={props.intervalCount}></input>
                    </div>
                </div>
                <div className="slideshow-sidebar-stack slideshow-controls">
                    <button className="media-button play" onClick={props.playPause}>{props.playing ? "Pause" : "Play"}</button>
                    <button className="media-button reset" onClick={props.resetPage}>Reset</button>
                </div>
                {
                    props.viewMode === BooksViewMode.Slideshow ?
                        <div className="slideshow-sidebar-stack slideshow-controls">
                            <button className="media-button play" onClick={props.emptySlideshow}>Clear</button>
                            <button className="media-button" onClick={props.toggleGrid}>{`${props.gridView ? 'Hide' : 'Show'} Grid`}</button>
                        </div>
                        :
                        <div className="slideshow-sidebar-stack slideshow-controls">
                            <button className="media-button" onClick={hideCurrentPage}>Hide Page</button>
                            <button className="media-button" onClick={props.toggleGrid}>{`${props.gridView ? 'Hide' : 'Show'} Grid`}</button>
                        </div>
                }
                {
                    props.viewMode === BooksViewMode.Slideshow ?
                        <div className="slideshow-covers-container">
                            <div className="slideshow-info">
                                {
                                    props.slideshow.id !== 0 && props.slideshow.id ?
                                        <button className="saveupdate-button" onClick={() => { toggleSaveModal() }}>Update Slideshow</button> :
                                        <button className="saveupdate-button" onClick={() => { toggleSaveModal() }}>Save Slideshow</button>
                                }
                                <Modal modalId={"saveUpdate-modal"} displayModal={showSaveModal} toggleModal={toggleSaveModal}>
                                    <SavePanel
                                        currentSlideshow={props.slideshow}
                                        toggleDisplay={toggleSaveModal}
                                        createCollection={props.createCollection} />
                                </Modal>
                                {"Slideshow: " + props.slideshow.name + " ID: " + props.slideshow.id}
                            </div>
                            <div className="slideshow-covers">
                                {
                                    props.slideshow.books.map((book, index) => {
                                        return <GalleryItem
                                            key={index}
                                            index={index}
                                            book={book}
                                            coverUrl={GetCoverPath(book)}
                                            subtitle=""
                                            addButtonHandler={props.addButtonHandler}
                                            removeButtonHandler={props.removeButtonHandler}
                                            bodyClickHandler={props.galleryItemClickHandler} />
                                    })
                                }
                            </div>
                        </div>
                        :
                        <BookInfo
                            book={props.slideshow.books[0]}
                            addButtonHandler={props.addButtonHandler}
                            viewSearchResults={props.viewSearchResults}
                            unhidePage={unhidePage}
                            updateBook={props.updateBook}
                            deleteBook={props.deleteBook} />

                }

            </div>
        </div>
    )
}

export default Sidebar