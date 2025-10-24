import { useContext, useEffect, useRef, useState } from "react";
import type { VideoSource } from "../../../types/videoSource";
import PageSelect from "../../shared/pageSelect";
import SourceGalleryItem from "./sourceGalleryItem";
import { VideosAppContext } from "../videosAppContext";

interface SourceGalleryProps { }

const SourceGallery = (props: SourceGalleryProps) => {
    const [galleryPage, setGalleryPage] = useState<number>(0)

    const appContext = useContext(VideosAppContext)

    const getTotalPages = (items: VideoSource[]): number => {
        if (items) {
            return Math.max(1, Math.ceil(items.length / appContext.galleryPageSize))
        }
        return 1
    }

    const mountedRef = useRef(false)
    useEffect(() => {
        if (mountedRef.current) {
            setGalleryPage(0)
        } else {
            mountedRef.current = true
        }
    }, [appContext.allSources])

    const getCurrentGalleryPage = (): VideoSource[] => {
        let pageStart = galleryPage * appContext.galleryPageSize;
        let pageEnd = (galleryPage + 1) * appContext.galleryPageSize;
        return appContext.allSources.slice(pageStart, pageEnd)
    }

    const bodyClick = (s: VideoSource) => {
        appContext.viewSearchResults({ source: s.name })
    }

    return (
        <div className="sourcegallery-container dark-theme">
            <div className="sourcegallery-container-header">
                <PageSelect setPage={(n: number) => { setGalleryPage(n) }} totalPages={getTotalPages(appContext.allSources)} currentPage={galleryPage} />
            </div>
            <div className="sourcegallery-container-inner">
                {
                    getCurrentGalleryPage().map((source, i) => {
                        return <SourceGalleryItem
                            key={i}
                            index={i}
                            source={source}
                            bodyClickHandler={bodyClick} />
                    })
                }
            </div>
        </div>
    )
}

export default SourceGallery