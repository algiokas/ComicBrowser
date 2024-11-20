import { Component } from "react"

export interface BaseGalleryProps<T> {
    allItems: T[]
    pageSize: number,
    showFilters?: boolean,
}

export interface BaseGalleryState<T> {
    galleryPage: number,
    currentPageSize: number,
    totalPages: number,
    items: T[]
}

class BaseGallery<T, P extends BaseGalleryProps<T>, S extends BaseGalleryState<T>> extends Component<P, S> {
    constructor(props: P) {
        super(props)

        let initialState: BaseGalleryState<T> = {
            galleryPage: 0,
            currentPageSize: props.allItems.length < props.pageSize ? props.allItems.length : props.pageSize,
            totalPages: 0,
            items: new Array<T>()
        }
    }

    getTotalPages = (items: T[]): number => {
        if (items) {
            return Math.max(1, Math.ceil(items.length / this.props.pageSize))
        }
        return 1
    }

    getPageSize = (pageNum: number): number => {
        if (pageNum < this.state.totalPages - 1) {
            return this.props.pageSize
        } else {
            return this.state.items.length % this.props.pageSize
        }
    }

    setPage = (pageNum: number) => {
        this.setState({
            galleryPage: pageNum
        })
    }

    getCurrentGalleryPage = (): T[] => {
        let pageStart = this.state.galleryPage * this.props.pageSize;
        let pageEnd = (this.state.galleryPage+1) * this.props.pageSize;
        return this.state.items.slice(pageStart, pageEnd)
    }
}

export default BaseGallery