import { useEffect, useState } from "react";
import IVideo from "../../../interfaces/video";
import { VideosSortOrder } from "../../../util/enums";
import { getAlphabet } from "../../../util/helpers";

interface VideoSortControlsProps {
    sortOrder: VideosSortOrder,
    videoList: IVideo[],
    pageSize: number,
    sortVideos(order: VideosSortOrder): void,
    setPage(pageNum: number): void
}

const VideoSortControls = (props: VideoSortControlsProps) => {
    const [sortIndex, setSortIndex] = useState<string[] | null>(null)
    const [selectedIndex, setSelectedIndex] = useState<string | null>(null)

    useEffect(() => {
        setSortIndex(getSortIndex(props.sortOrder))
    }, [props.sortOrder])

    const isAlphaSort = (sortOrder: VideosSortOrder) => {
        return sortOrder.toString().includes("Alpha")
    }

    const getSortIndex = (sortOrder: VideosSortOrder): string[] | null => {
        let sortIndex = null
        if (!sortOrder) return sortIndex
        if (isAlphaSort(sortOrder)) {
            return getAlphabet()
        }
        return sortIndex
    }

    const firstGalleryMatchForIndex = (indexKey: string): number => {
        let firstMatch = 0
        let hasFindFunction = false
        let findFunction = (b: IVideo) => { }
        switch (props.sortOrder) {
            case VideosSortOrder.Actor:
                findFunction = (b: IVideo) => {
                    if (b.actors.length < 1 || !b.actors[0]) {
                        return false
                    }
                    return indexKey.toLowerCase() === b.actors[0].name.substring(0, 1).toLowerCase()
                }
                hasFindFunction = true
                break;
            case VideosSortOrder.Title:
                findFunction = (b: IVideo) => {
                    return indexKey.toLowerCase() === b.title.substring(0, 1).toLowerCase()
                }
                hasFindFunction = true
                break;

        }
        if (hasFindFunction) {
            firstMatch = props.videoList.findIndex(b => findFunction(b))
        }
        return firstMatch
    }

    const setPageFromIndex = (indexKey: string) => {
        let firstMatch = firstGalleryMatchForIndex(indexKey)
        if (firstMatch < 0) {
            console.log('no match found')
            firstMatch = 0
        }
        let pageNum = Math.floor(firstMatch / props.pageSize)
        props.setPage(pageNum)
        setSelectedIndex(indexKey)
    }

    return (
        <div className="sort-controls">
            <div className="sort-select">
                {
                    Object.keys(VideosSortOrder).map((key, index) => {
                        return <div key={key} className={`sort-order ${props.sortOrder === Object.values(VideosSortOrder)[index] ? "selected" : ""}`}
                            onClick={() => { props.sortVideos(Object.values(VideosSortOrder)[index]) }}>{key}</div>
                    })
                }
            </div>
            {
                sortIndex ?
                    <div className="sort-index">
                        {
                            sortIndex.map((key) => {
                                return <div key={key}
                                    className={`sort-index-item ${key === selectedIndex ? "selected" : ""}`}
                                    onClick={() => { setPageFromIndex(key) }}>
                                    {key}
                                </div>
                            })
                        }

                    </div> : null
            }
        </div>

    )
}

export default VideoSortControls