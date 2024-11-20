import React, { Component } from "react";
import { getAlphabet } from "../../../util/helpers";
import { ActorsSortOrder } from "../../../util/enums";
import IActor from "../../../interfaces/actor";

interface ActorSortControlsProps {
    sortOrder: ActorsSortOrder,
    actorList: IActor[],
    pageSize: number,
    sortVideos(order: ActorsSortOrder): void,
    setPage(pageNum: number): void
}

interface ActorSortControlState {
    sortIndex: string[] | null,
    selectedIndex: string | null
}

class ActorSortControls extends Component<ActorSortControlsProps, ActorSortControlState> {
    constructor(props: ActorSortControlsProps) {
        super(props)

        //props: sortOrder, videoList, pageSize, sortVideos(), setPage()

        this.state = {
            sortIndex: this.getSortIndex(this.props.sortOrder),
            selectedIndex: null
        }

    }

    componentDidUpdate(prevProps: ActorSortControlsProps) {
        if (prevProps.sortOrder !== this.props.sortOrder) {
            this.setState({ sortIndex: this.getSortIndex(this.props.sortOrder) })
        }
    }

    isAlphaSort = (sortOrder: ActorsSortOrder) => {
        return sortOrder.toString().includes("Alpha")
    }

    getSortIndex = (sortOrder: ActorsSortOrder): string[] | null => {
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
        let findFunction = (a: IActor) => {}
        switch (this.props.sortOrder) {
            case ActorsSortOrder.Name:
                findFunction = (a: IActor) => { 
                    return indexKey.toLowerCase() === a.name.substring(0,1).toLowerCase() 
                }
                hasFindFunction = true
                break;
        }
        if (hasFindFunction) {
            firstMatch = this.props.actorList.findIndex(a => findFunction(a))
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
                        Object.keys(ActorsSortOrder).map((key, index) => {
                            return <div key={key} className={`sort-order ${this.props.sortOrder === Object.values(ActorsSortOrder)[index] ? "selected" : ""}`} 
                                onClick={() => {this.props.sortVideos(Object.values(ActorsSortOrder)[index])}}>{key}</div>
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

export default ActorSortControls