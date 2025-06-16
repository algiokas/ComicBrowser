import { useEffect, useRef, useState } from "react";
import type IVideoSource from "../../../interfaces/videoSource";
import type { BaseGalleryProps } from "../../shared/baseGallery";
import PageSelect from "../../shared/pageSelect";
import SourceGalleryItem from "./sourceGalleryItem";
import type { IVideoSearchQuery } from "../../../interfaces/searchQuery";

interface SourceGalleryProps extends BaseGalleryProps<IVideoSource> {
    viewSearchResults(query?: IVideoSearchQuery): void,
}

const SourceGallery = (props: SourceGalleryProps) => {
    const getTotalPages = (items: IVideoSource[]): number => {
        if (items) {
            return Math.max(1, Math.ceil(items.length / props.pageSize))
        }
        return 1
    }

    const [galleryPage, setGalleryPage] = useState<number>(0)
    //const [currentPageSize, setCurrentPageSize] = useState<number>(props.allItems.length < props.pageSize ? props.allItems.length : props.pageSize)
    const [totalPages, setTotalPages] = useState<number>(getTotalPages(props.allItems))
    const [items, setItems] = useState<IVideoSource[]>(props.allItems)

    const mountedRef = useRef(false)
    useEffect(() => {
        if (mountedRef.current) {
            setGalleryPage(0)
        } else {
            mountedRef.current = true
        }
    }, [props.allItems])

    const getCurrentGalleryPage = (): IVideoSource[] => {
        let pageStart = galleryPage * props.pageSize;
        let pageEnd = (galleryPage + 1) * props.pageSize;
        return items.slice(pageStart, pageEnd)
    }

    const bodyClick = (s: IVideoSource) => {
        props.viewSearchResults({ source: s.name })
    }

    return (
        <div className="sourcegallery-container dark-theme">
            <div className="sourcegallery-container-header">
                <PageSelect setPage={(n: number) => { setGalleryPage(n) }} totalPages={totalPages} currentPage={galleryPage} />
            </div>
            <div className="sourcegallery-container-inner">
                {
                    getCurrentGalleryPage().map((source, i) => {
                        return <SourceGalleryItem
                            key={i}
                            index={i}
                            data={source}
                            imageUrl="https://picsum.photos/480/270"
                            bodyClickHandler={bodyClick}/>
                    })
                }
            </div>
        </div>
    )
}

export default SourceGallery