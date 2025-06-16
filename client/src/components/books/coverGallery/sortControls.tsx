import { useEffect, useState } from "react";
import type IBook from "../../../interfaces/book";
import { BooksSortOrder } from "../../../util/enums";
import { getAlphabet, getBookAuthor } from "../../../util/helpers";

interface SortControlsProps {
    sortOrder: BooksSortOrder,
    bookList: IBook[],
    pageSize: number,
    sortBooks(order: BooksSortOrder): void,
    setPage(pageNum: number): void
}

const SortControls = (props: SortControlsProps) => {
    const [ sortIndex, setSortIndex ] = useState<string[] | null>(null)
    const [ selectedIndex, setSelectedIndex ] = useState<string | null>(null)

    useEffect(() => {
        setSortIndex(getSortIndex(props.sortOrder))
    }, [ props.sortOrder ])

    const isAlphaSort = (sortOrder: BooksSortOrder) => {
        return sortOrder === BooksSortOrder.Artist || sortOrder === BooksSortOrder.Author || sortOrder === BooksSortOrder.Title
    }

    const getSortIndex = (sortOrder: BooksSortOrder): string[] | null => {
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
        let findFunction = (b: IBook) => {}
        switch (props.sortOrder) {
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
            firstMatch = props.bookList.findIndex(b => findFunction(b))
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
                        Object.keys(BooksSortOrder).map((key, index) => {
                            return <div key={key} className={`sort-order ${props.sortOrder === Object.values(BooksSortOrder)[index] ? "selected" : ""}`} 
                                onClick={() => {props.sortBooks(Object.values(BooksSortOrder)[index])}}>{key}</div>
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
                                        onClick={() => {setPageFromIndex(key)}}>
                                            {key}
                                        </div>
                            })
                        }

                    </div> : null
                }
            </div>

        )
}

export default SortControls