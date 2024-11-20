import React, { Component } from "react";
import { getAlphabet } from "../../../util/helpers";
import { getBookAuthor } from "../../../util/helpers";
import { BooksSortOrder } from "../../../util/enums";
import IBook from "../../../interfaces/book";

interface SortControlsProps {
    sortOrder: BooksSortOrder,
    bookList: IBook[],
    pageSize: number,
    sortBooks(order: BooksSortOrder): void,
    setPage(pageNum: number): void
}

interface SortControlState {
    sortIndex: string[] | null,
    selectedIndex: string | null
}

class SortControls extends Component<SortControlsProps, SortControlState> {
    constructor(props: SortControlsProps) {
        super(props)

        //props: sortOrder, bookList, pageSize, sortBooks(), setPage()

        this.state = {
            sortIndex: this.getSortIndex(this.props.sortOrder),
            selectedIndex: null
        }

    }

    componentDidUpdate(prevProps: SortControlsProps) {
        if (prevProps.sortOrder !== this.props.sortOrder) {
            this.setState({ sortIndex: this.getSortIndex(this.props.sortOrder) })
        }
    }

    isAlphaSort = (sortOrder: BooksSortOrder) => {
        return sortOrder === BooksSortOrder.Artist || sortOrder === BooksSortOrder.Author || sortOrder === BooksSortOrder.Title
    }

    getSortIndex = (sortOrder: BooksSortOrder): string[] | null => {
        let sortIndex = null
        if (!sortOrder) return sortIndex
        if (this.isAlphaSort(sortOrder)) {
            return getAlphabet()
        }
        return sortIndex
    }

    firstGalleryMatchForIndex = (indexKey: string): number => {
        let firstMatch = 0
        let hasFindFunction = false
        let findFunction = (b: IBook) => {}
        switch (this.props.sortOrder) {
            case BooksSortOrder.Author:
                findFunction = (b: IBook) => { 
                    return indexKey.toLowerCase() === getBookAuthor(b).substring(0,1).toLowerCase() 
                }
                hasFindFunction = true
                break;
            case BooksSortOrder.Artist:
                findFunction = (b: IBook) => { 
                    if (b.artists.length < 1 || !b.artists[0]) {
                        return false 
                    }
                    return indexKey.toLowerCase() === b.artists[0].substring(0,1).toLowerCase() 
                }
                hasFindFunction = true
                break;
            case BooksSortOrder.Title:
                findFunction = (b: IBook) => { 
                    return indexKey.toLowerCase() === b.title.substring(0,1).toLowerCase() 
                }
                hasFindFunction = true
                break;

        }
        if (hasFindFunction) {
            firstMatch = this.props.bookList.findIndex(b => findFunction(b))
        }
        return firstMatch
    }

    setPageFromIndex = (indexKey: string) => {
        let firstMatch = this.firstGalleryMatchForIndex(indexKey)
        if (firstMatch < 0) {
            console.log('no match found')
            firstMatch = 0
        }
        let pageNum = Math.floor(firstMatch / this.props.pageSize)
        this.props.setPage(pageNum)
    }


    render() {
        return (
            <div className="sort-controls">
                <div className="sort-select">
                    {
                        Object.keys(BooksSortOrder).map((key, index) => {
                            return <div key={key} className={`sort-order ${this.props.sortOrder === Object.values(BooksSortOrder)[index] ? "selected" : ""}`} 
                                onClick={() => {this.props.sortBooks(Object.values(BooksSortOrder)[index])}}>{key}</div>
                        })
                    }
                </div>
                {
                    this.state.sortIndex ?
                    <div className="sort-index">
                        {
                            this.state.sortIndex.map((key) => {
                                return <div key={key} 
                                        className={`sort-index-item ${key === this.state.selectedIndex ? "selected" : ""}`} 
                                        onClick={() => {this.setPageFromIndex(key)}}>
                                            {key}
                                        </div>
                            })
                        }

                    </div> : null
                }
            </div>

        )
    }
}

export default SortControls