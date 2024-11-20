import React, { Component } from "react";
import { getAlphabet } from "../../../util/helpers";
import { VideosSortOrder } from "../../../util/enums";
import IVideo from "../../../interfaces/video";

interface VideoSortControlsProps {
    sortOrder: VideosSortOrder,
    videoList: IVideo[],
    pageSize: number,
    sortVideos(order: VideosSortOrder): void,
    setPage(pageNum: number): void
}

interface VideoSortControlState {
    sortIndex: string[] | null,
    selectedIndex: string | null
}

class VideoSortControls extends Component<VideoSortControlsProps, VideoSortControlState> {
    constructor(props: VideoSortControlsProps) {
        super(props)

        //props: sortOrder, videoList, pageSize, sortVideos(), setPage()

        this.state = {
            sortIndex: this.getSortIndex(this.props.sortOrder),
            selectedIndex: null
        }

    }

    componentDidUpdate(prevProps: VideoSortControlsProps) {
        if (prevProps.sortOrder !== this.props.sortOrder) {
            this.setState({ sortIndex: this.getSortIndex(this.props.sortOrder) })
        }
    }

    isAlphaSort = (sortOrder: VideosSortOrder) => {
        return sortOrder.toString().includes("Alpha")
    }

    getSortIndex = (sortOrder: VideosSortOrder): string[] | null => {
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
        let findFunction = (b: IVideo) => {}
        switch (this.props.sortOrder) {
            case VideosSortOrder.Actor:
                findFunction = (b: IVideo) => { 
                    if (b.actors.length < 1 || !b.actors[0]) {
                        return false 
                    }
                    return indexKey.toLowerCase() === b.actors[0].name.substring(0,1).toLowerCase() 
                }
                hasFindFunction = true
                break;
            case VideosSortOrder.Title:
                findFunction = (b: IVideo) => { 
                    return indexKey.toLowerCase() === b.title.substring(0,1).toLowerCase() 
                }
                hasFindFunction = true
                break;

        }
        if (hasFindFunction) {
            firstMatch = this.props.videoList.findIndex(b => findFunction(b))
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
                        Object.keys(VideosSortOrder).map((key, index) => {
                            return <div key={key} className={`sort-order ${this.props.sortOrder === Object.values(VideosSortOrder)[index] ? "selected" : ""}`} 
                                onClick={() => {this.props.sortVideos(Object.values(VideosSortOrder)[index])}}>{key}</div>
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

export default VideoSortControls