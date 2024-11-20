import React, { Component } from "react";
import { GetPagePathByID, GetPagePathMulti } from "../../../util/helpers"
import Sidebar from "./slideshow-sidebar";
import ISlideshow from "../../../interfaces/slideshow";
import { BooksViewMode } from "../../../util/enums";
import IBook from "../../../interfaces/book";
import { IBookSearchQuery }from "../../../interfaces/searchQuery";

interface SlideshowProps {
    slideshow: ISlideshow,
    currentPage: number,
    viewMode: BooksViewMode,

    setCurrentPage(n: number): void,
    addButtonHandler(book: IBook): void,
    removeButtonHandler(index: number): void,
    emptySlideshow(): void,
    updateBook(book: IBook): void,
    deleteBook(bookId: number): void,
    viewSearchResults(query?: IBookSearchQuery): void
}

interface SlideshowState {
    showSidebar: boolean,
    gridView: boolean,
    playing: boolean,
    intervalId: number,
    intervalCounter: number,
    intervalLength: number,
    gridPages: GridPage[]
}

interface GridPage {
    bookId: number,
    bookPageNum: number,
    slideNum: number
    
}

class Slideshow extends Component<SlideshowProps, SlideshowState> {
    constructor(props: SlideshowProps) {
        super(props)

        this.state = {
            showSidebar: true,
            gridView: false,
            playing: false,
            intervalId: 0,
            intervalCounter: 0,
            intervalLength: 5,
            gridPages: this.getGridPages()
        }
    }

    getGridPages = (): GridPage[] => {
        let gPages: GridPage[] = []
        let ssIndex = 0
        this.props.slideshow.books.forEach((book) => {
            for (let i = 0; i < book.pageCount; i++) {
                gPages.push({ bookId: book.id, bookPageNum: i, slideNum: ssIndex })
                ssIndex++
            }
        })
        return gPages
    }

    componentDidUpdate(prevProps: SlideshowProps, prevState: SlideshowState) {
        if (this.props.slideshow && prevProps.slideshow) {
            let ssOld = prevProps.slideshow.id !== null ? prevProps.slideshow.id : JSON.stringify(prevProps.slideshow.books.map(b => b.id))
            let ssNew = this.props.slideshow.id !== null ? this.props.slideshow.id : JSON.stringify(this.props.slideshow.books.map(b => b.id))
            if (ssOld !== ssNew) {
                if (prevState.intervalId > 0) {
                    clearInterval(this.state.intervalId);
                    this.setState({
                        playing: false,
                        intervalId: 0,
                        intervalCounter: 0,
                    })
                }
                this.setState({ 
                    gridView: false,
                    gridPages: this.getGridPages()
                })
            }
        }

    }

    componentWillUnmount() {
        clearInterval(this.state.intervalId)
    }

    //override
    setCurrentPage = (pageNum: number) => {
        this.setState({ intervalCounter: 0 })
        this.props.setCurrentPage(pageNum)
    }

    toggleSidebar = () => {
        this.setState((state) => {
            return { showSidebar: !state.showSidebar }
        })
    }

    previousPage = () => {
        if (this.props.currentPage > 0) {
            this.setCurrentPage(this.props.currentPage - 1)
        }
    }

    nextPage = () => {
        if (this.props.currentPage < this.props.slideshow.pageCount - 1) {
            this.setCurrentPage(this.props.currentPage + 1)
        }
    }

    firstPageOfBook = (book: IBook, bookIndex: number) => {
        let pageIndex = 0;
        for (let i = 0; i < bookIndex; i++) {
            pageIndex += this.props.slideshow.books[i].pageCount
        }
        this.setCurrentPage(pageIndex)
    }

    resetPage = () => {
        this.props.setCurrentPage(0)
    }

    toggleGrid = () => {
        this.setState((prevState: SlideshowState) => {
            return { ...prevState, gridView: !prevState.gridView }
        })
    }

    gridClick = (pageNum: number) => {
        this.setCurrentPage(pageNum)
        this.toggleGrid()
    }

    handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newInterval = parseInt(e.target.value)
        if (!Number.isNaN(newInterval)) {
            this.setState({
                intervalLength: newInterval,
                intervalCounter: 0
            })
        } else {
            console.log('handleIntervalChange: invalid interval value')
        }

    }

    incrementInterval = () => {
        let counterVal = this.state.intervalCounter + 1
        if (counterVal < this.state.intervalLength) {
            this.setState({ intervalCounter: counterVal })
        } else {
            this.setState({ intervalCounter: 0 })
            this.nextPage()
        }
    }

    playPause = () => {
        if (!this.state.playing) {
            console.log('play')
            let currentInterval = window.setInterval(this.incrementInterval, 1000)
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
            setPage: this.setCurrentPage,
            resetPage: this.resetPage,
            toggleGrid: this.toggleGrid,

            galleryItemClickHandler: this.firstPageOfBook,
            addButtonHandler: this.props.addButtonHandler,
            removeButtonHandler: this.props.removeButtonHandler,
            emptySlideshow: this.props.emptySlideshow,
            updateBook: this.props.updateBook,
            deleteBook: this.props.deleteBook,
            viewSearchResults: this.props.viewSearchResults,

            slideshow: this.props.slideshow,
            showSidebar: this.state.showSidebar,
            currentPage: this.props.currentPage,
            pageCount: this.props.slideshow.pageCount,
            intervalLength: this.state.intervalLength,
            intervalCount: this.state.intervalCounter,
            viewMode: this.props.viewMode,
            gridView: this.state.gridView,
            playing: this.state.playing
        }

        return (
            <div className={`slideshow-container ${this.state.showSidebar ? "show-sidebar" : ""}`}>
                {
                    this.state.gridView ?
                        <div className="pagegrid">
                            {
                                this.state.gridPages.map((page: GridPage) => {
                                    return <div className="pagegrid-page" onClick={() => this.gridClick(page.slideNum)}>
                                        <img className={`pagegrid-page-image ${page.slideNum === this.props.currentPage ? "selected" : ""}`}
                                            src={GetPagePathByID(page.bookId, page.bookPageNum)}
                                            alt={" page " + (page.slideNum + 1)}>
                                        </img>
                                    </div>
                                })}
                        </div>
                        :
                        <div className="slideshow">
                            <img className={`slideshow-image`}
                                src={GetPagePathMulti(this.props.slideshow.books, this.props.currentPage)}
                                alt={" page " + this.props.currentPage + 1}>
                            </img>
                            <div className="slideshow-overlay">
                                <div className="overlay-left" onClick={this.previousPage}></div>
                                <div className="overlay-right" onClick={this.nextPage}></div>
                            </div>
                        </div>

                }
                <Sidebar {...sidebarProps}></Sidebar>
            </div>
        )
    }
}

export default Slideshow