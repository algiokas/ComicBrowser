import React, { Component } from "react";
import { getAlphabet } from "../../util/helpers";
import { getBookAuthor } from "../../util/helpers";
import { SortOrder } from "../../util/enums";
import IBook from "../../interfaces/book";

interface SortControlsProps {
    sortOrder: SortOrder,
    bookList: IBook[],
    pageSize: number,
    sortBooks(order: SortOrder): void,
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

    isAlphaSort = (sortOrder: SortOrder) => {
        return sortOrder === SortOrder.Artist || sortOrder === SortOrder.Author || sortOrder === SortOrder.Title
    }

    getSortIndex = (sortOrder: SortOrder) => {
        let sortIndex = null
        if (!sortOrder) return sortIndex
        if (this.isAlphaSort(sortOrder)) {
            return getAlphabet()
        }
        return sortIndex
    }

    setPageFromIndex = (indexKey: string) => {
        let firstMatch = 0
        let hasFindFunction = false
        let findFunction = (b: IBook) => {}
        switch (this.props.sortOrder) {
            case SortOrder.Author:
                findFunction = (b: IBook) => { return indexKey.toLowerCase() === getBookAuthor(b).substring(0,1).toLowerCase() }
                hasFindFunction = true
                break;
            case SortOrder.Artist:
                findFunction = (b: IBook) => { return indexKey.toLowerCase() === b.artists[0].substring(0,1).toLowerCase() }
                hasFindFunction = true
                break;
            case SortOrder.Title:
                findFunction = (b: IBook) => { return indexKey.toLowerCase() === b.title.substring(0,1).toLowerCase() }
                hasFindFunction = true
                break;

        }
        if (hasFindFunction) {
            firstMatch = this.props.bookList.findIndex(b => findFunction(b))
        }
        let pageNum = Math.floor(firstMatch / this.props.pageSize)
        this.props.setPage(pageNum)
    }


    render() {
        return (
            <div className="sort-controls">
                <div className="sort-select">
                    {
                        Object.keys(SortOrder).map((key, index) => {
                            return <div key={key} className={`sort-order ${this.props.sortOrder === Object.values(SortOrder)[index] ? "selected" : ""}`} 
                                onClick={() => {this.props.sortBooks(Object.values(SortOrder)[index])}}>{key}</div>
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