import React from 'react'
import { GetPagePathByID } from '../../../util/helpers'
import type { IGridPage } from './slideshow'

interface GridPageProps extends IGridPage {
    index: number
    currentPage: number
    gridClick(n: number): void
    pageRef: React.RefObject<HTMLDivElement | null>
}

const GridPage = (props: GridPageProps) => {
    const isCurrentPage = props.slideNum === props.currentPage

    if (isCurrentPage) {
        return <div className="pagegrid-page" ref={props.pageRef} onClick={() => props.gridClick(props.slideNum)} key={props.index}>
                <img className={`pagegrid-page-image selected`}
                    src={GetPagePathByID(props.bookId, props.bookPageNum)}
                    alt={" page " + (props.slideNum + 1)}>
                </img>
            </div>
    } else {
        return <div className="pagegrid-page" onClick={() => props.gridClick(props.slideNum)} key={props.index}>
                <img className={`pagegrid-page-image`}
                    src={GetPagePathByID(props.bookId, props.bookPageNum)}
                    alt={" page " + (props.slideNum + 1)}>
                </img>
            </div>
    }
}

export default GridPage