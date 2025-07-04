import React, { useEffect, useState } from "react";
import type IBook from "../../../interfaces/book";
import type { IBookSearchQuery } from "../../../interfaces/searchQuery";
import type ISlideshow from "../../../interfaces/slideshow";
import { BooksViewMode } from "../../../util/enums";
import { GetPagePathMulti, getSlideshowBookByPage } from "../../../util/helpers";
import GridPage from "./gridPage";
import Sidebar from "./slideshow-sidebar";

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
    viewSearchResults(query?: IBookSearchQuery): void,
    createCollection(collectionName: string, coverBookId: number): void
}

export interface IGridPage {
    bookId: number,
    bookPageNum: number,
    slideNum: number
}

const Slideshow = (props: SlideshowProps) => {
    const [showSidebar, setShowSidebar] = useState<boolean>(true)
    const [gridView, setGridView] = useState<boolean>(false)
    const [playing, setPlaying] = useState<boolean>(false)
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
    const [intervalCounter, setIntervalCounter] = useState<number>(0)
    const [intervalLength, setIntervalLength] = useState<number>(5)
    const [gridPages, setGridPages] = useState<IGridPage[]>([])

    const gridRef = React.createRef<HTMLDivElement>()
    const currentGridPagRef = React.createRef<HTMLDivElement>()

    useEffect(() => {
        setGridPages(getGridPages()) //mount
        return () => {
            if (intervalId) { //unmount
                clearInterval(intervalId)
            }
        }
    }, [])

    useEffect(() => {
        if (intervalId) {
            clearInterval(intervalId)
        }
        setPlaying(false)
        setIntervalId(null)
        setIntervalCounter(0)
        setGridView(false)
        setGridPages(getGridPages())
    }, [ JSON.stringify(props.slideshow.books) ])

    // useEffect(() => {
    //     if (playing) {
    //         const id = setInterval(incrementInterval, 1000)
    //         setIntervalId(id)
    //     } else {
    //         if (intervalId) {
    //             clearInterval(intervalId)
    //         }
    //     }

    // }, [playing])

    useEffect(() => {
        const currentPageRect = currentGridPagRef.current?.getBoundingClientRect()
        if (currentPageRect) {
            console.log(`width: ${currentPageRect.width} - height: ${currentPageRect.height}`)
            const pageRow = Math.floor(props.currentPage / 5)
            console.log(`PageRow: ${pageRow}`)
            const scrollHeight = pageRow * currentPageRect.height
            console.log(`Scrollheight: ${scrollHeight}`)
            gridRef.current?.scrollTo(0, scrollHeight)
        }

    }, [gridView])

    useEffect(() => {
        if (intervalCounter >= intervalLength) {
            setIntervalCounter(0)
            nextPage()
        }
    }, [ intervalCounter ])

    const getGridPages = (): IGridPage[] => {
        let gPages: IGridPage[] = []
        let ssIndex = 0
        props.slideshow.books.forEach((book) => {
            for (let i = 0; i < book.pageCount; i++) {
                gPages.push({ bookId: book.id, bookPageNum: i, slideNum: ssIndex })
                ssIndex++
            }
        })
        return gPages
    }

    const setCurrentPage = (pageNum: number) => {
        setIntervalCounter(0)
        props.setCurrentPage(pageNum)
    }

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar)
    }

    const previousPage = () => {
        let prevPageNum = props.currentPage -1
        let currentBook = getSlideshowBookByPage(props.slideshow, prevPageNum)
        while (currentBook && currentBook.hiddenPages.includes(prevPageNum) && prevPageNum > 0) {
            console.log(`Page ${prevPageNum+1} hidden - Skipping`)
            prevPageNum = prevPageNum - 1
            currentBook = getSlideshowBookByPage(props.slideshow, prevPageNum)
        }
        if (prevPageNum >= 0) {
            setCurrentPage(prevPageNum)
        }
    }

    const nextPage = () => {
        let nextPageNum = props.currentPage + 1
        let currentBook = getSlideshowBookByPage(props.slideshow, nextPageNum)
        while (currentBook && currentBook.hiddenPages.includes(nextPageNum) && nextPageNum < props.slideshow.pageCount -1) {
            console.log(`Page ${nextPageNum+1} hidden - Skipping`)
            nextPageNum += 1
            currentBook = getSlideshowBookByPage(props.slideshow, nextPageNum)
        }
        if (nextPageNum < props.slideshow.pageCount) {
            setCurrentPage(nextPageNum)
        }
    }

    const firstPageOfBook = (book: IBook, bookIndex: number) => {
        let pageIndex = 0;
        for (let i = 0; i < bookIndex; i++) {
            pageIndex += props.slideshow.books[i].pageCount
        }
        setCurrentPage(pageIndex)
    }

    const resetPage = () => {
        props.setCurrentPage(0)
    }

    const toggleGrid = () => {
        setGridView(!gridView)
    }

    const gridClick = (pageNum: number) => {
        setCurrentPage(pageNum)
        toggleGrid()
    }

    const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newInterval = parseInt(e.target.value)
        if (!Number.isNaN(newInterval)) {
            setIntervalLength(newInterval)
            setIntervalCounter(0)
        } else {
            console.log('handleIntervalChange: invalid interval value')
        }

    }

    const playPause = () => {
        if (!playing) {
            console.log('play')
            let currentInterval = setInterval(() => setIntervalCounter((oldVal) => oldVal + 1), 1000)
            setIntervalId(currentInterval)
            setPlaying(true)
        }
        else {
            console.log('pause')
            if (intervalId) {
                clearInterval(intervalId)
            }
            setIntervalId(null)
            setPlaying(false)
        }
    }

    let sidebarProps = {
        toggleSidebar: toggleSidebar,
        previousPage: previousPage,
        nextPage: nextPage,
        handleIntervalChange: handleIntervalChange,
        playPause: playPause,
        setPage: setCurrentPage,
        resetPage: resetPage,
        toggleGrid: toggleGrid,

        galleryItemClickHandler: firstPageOfBook,
        addButtonHandler: props.addButtonHandler,
        removeButtonHandler: props.removeButtonHandler,
        emptySlideshow: props.emptySlideshow,
        updateBook: props.updateBook,
        deleteBook: props.deleteBook,
        viewSearchResults: props.viewSearchResults,
        createCollection: props.createCollection,

        slideshow: props.slideshow,
        showSidebar: showSidebar,
        currentPage: props.currentPage,
        pageCount: props.slideshow.pageCount,
        intervalLength: intervalLength,
        intervalCount: intervalCounter,
        viewMode: props.viewMode,
        gridView: gridView,
        playing: playing
    }

    return (
        <div className={`slideshow-container ${showSidebar ? "show-sidebar" : ""}`}>
            {
                gridView ?
                    <div className="pagegrid" ref={gridRef}>
                        {
                            gridPages.map((page: IGridPage, i: number) =>
                                <GridPage {...page}
                                    index={i}
                                    currentPage={props.currentPage}
                                    gridClick={gridClick}
                                    pageRef={currentGridPagRef} />)}
                    </div>
                    :
                    <div className="slideshow">
                        <img className={`slideshow-image`}
                            src={GetPagePathMulti(props.slideshow.books, props.currentPage)}
                            alt={" page " + props.currentPage + 1}>
                        </img>
                        <div className="slideshow-overlay">
                            <div className="overlay-left" onClick={previousPage}></div>
                            <div className="overlay-right" onClick={nextPage}></div>
                        </div>
                    </div>

            }
            <Sidebar {...sidebarProps}></Sidebar>
        </div>
    )
}

export default Slideshow