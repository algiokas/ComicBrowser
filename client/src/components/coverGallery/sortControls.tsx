import React, { Component } from "react";
import { getAlphabet } from "../../util/helpers";
import { getBookAuthor } from "../../util/helpers";
import { SortOrder } from "../../util/enums";

class SortControls extends Component {
    constructor(props) {
        super(props)

        //props: sortOrder, bookList, pageSize, sortBooks(), setPage()

        this.state = {
            sortIndex: this.getSortIndex(this.props.sortOrder),
            selectedIndex: null
        }

    }

    componentDidUpdate(prevProps) {
        if (prevProps.sortOrder !== this.props.sortOrder) {
            this.setState({ sortIndex: this.getSortIndex(this.props.sortOrder) })
        }
    }

    isAlphaSort = (sortOrder) => {
        return sortOrder === SortOrder.Artist || sortOrder === SortOrder.Author || sortOrder === SortOrder.Title
    }

    getSortIndex = (sortOrder) => {
        let sortIndex = null
        if (!sortOrder) return sortIndex
        if (this.isAlphaSort(sortOrder)) {
            return getAlphabet()
        }
        return sortIndex
    }

    setPageFromIndex = (indexKey) => {
        let firstMatch = 0
        let findFunction = null
        switch (this.props.sortOrder) {
            case SortOrder.Author:
                findFunction = (b) => { return indexKey.toLowerCase() === getBookAuthor(b).substring(0,1).toLowerCase() }
                break;
            case SortOrder.Artist:
                findFunction = (b) => { return indexKey.toLowerCase() === b.artists[0].substring(0,1).toLowerCase() }
                break;
            case SortOrder.Title:
                findFunction = (b) => { return indexKey.toLowerCase() === b.title.substring(0,1).toLowerCase() }
                break;

        }
        if (findFunction) {
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
                        Object.keys(SortOrder).map((key) => {
                            return <div key={key} className={`sort-order ${this.props.sortOrder === SortOrder[key] ? "selected" : ""}`} 
                                onClick={() => {this.props.sortBooks(key)}}>{key}</div>
                        })
                    }
                </div>
                {
                    this.state.sortIndex ?
                    <div className="sort-index">
                        {
                            this.state.sortIndex.map((key) => {
                                return <div key={key} 
                                        className={`sort-index-item ${key === this.state.sortIndex[key] ? "selected" : ""}`} 
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