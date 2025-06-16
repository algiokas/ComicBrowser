import { useEffect, useState } from "react";
import type IActor from "../../../interfaces/actor";
import { ActorsSortOrder } from "../../../util/enums";
import { getAlphabet } from "../../../util/helpers";

interface ActorSortControlsProps {
    sortOrder: ActorsSortOrder,
    actorList: IActor[],
    pageSize: number,
    sortVideos(order: ActorsSortOrder): void,
    setPage(pageNum: number): void
}

const ActorSortControls = (props: ActorSortControlsProps) => {
    const [sortIndex, setSortIndex] = useState<string[] | null>(null)
    const [selectedIndex, setSelectedIndex] = useState<string | null>(null)

    useEffect(() => {
        setSortIndex(getSortIndex(props.sortOrder))
    }, [props.sortOrder])

    const isAlphaSort = (sortOrder: ActorsSortOrder) => {
        return sortOrder.toString().includes("Alpha")
    }
    
    const getSortIndex = (sortOrder: ActorsSortOrder): string[] | null => {
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
        let findFunction = (a: IActor) => { }
        switch (props.sortOrder) {
            case ActorsSortOrder.Name:
                findFunction = (a: IActor) => {
                    return indexKey.toLowerCase() === a.name.substring(0, 1).toLowerCase()
                }
                hasFindFunction = true
                break;
        }
        if (hasFindFunction) {
            firstMatch = props.actorList.findIndex(a => findFunction(a))
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
                    Object.keys(ActorsSortOrder).map((key, index) => {
                        return <div key={key} className={`sort-order ${props.sortOrder === Object.values(ActorsSortOrder)[index] ? "selected" : ""}`}
                            onClick={() => { props.sortVideos(Object.values(ActorsSortOrder)[index]) }}>{key}</div>
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

export default ActorSortControls