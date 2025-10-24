import { useState } from "react";
import type { Collection } from "../../../types/slideshow";
import PageSelect from "../../shared/pageSelect"
import type { BaseGalleryProps } from "../../shared/baseGallery"
import CollectionGalleryItem from "./collectionGalleryItem";
import { GetCoverPath, GetPagePathByID } from "../../../util/helpers";


interface CollectionGalleryProps extends BaseGalleryProps<Collection> {
    viewCollection(col: Collection): void
}

const CollectionGallery = (props: CollectionGalleryProps) => {
    const [items, setItems] = useState<Collection[]>(props.allItems)
    const [galleryPage, setGalleryPage] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(0)

    const getTotalPages = (items: Collection[]): number => {
        if (items) {
            return Math.max(1, Math.ceil(items.length / props.pageSize))
        }
        return 1
    }

    const getPageSize = (pageNum: number): number => {
        if (pageNum < totalPages - 1) {
            return props.pageSize
        } else {
            return items.length % props.pageSize
        }
    }

    const setPage = (pageNum: number) => {
        setGalleryPage(pageNum)
    }

    const getCurrentGalleryPage = (): Collection[] => {
        let pageStart = galleryPage * props.pageSize;
        let pageEnd = (galleryPage + 1) * props.pageSize;
        return items.slice(pageStart, pageEnd)
    }

    const getCollectionCover = (col: Collection): string => {
        if (col.coverImage) {
            console.log(`Cover images not supported: ${col.coverImage}`)
            return ''
        }
        const coverbook = col.books.find(b => b.id === col.coverBookId) ?? col.books[0]
        if (col.coverPageId >= 0 && col.coverPageId <= coverbook.pageCount) {
            return GetPagePathByID(coverbook.id, col.coverPageId)
        }
        return GetCoverPath(coverbook)
    }

    return (
        <div className="gallery-container dark-theme">
            <div className="gallery-container-header">
                <PageSelect
                    setPage={setPage}
                    totalPages={totalPages}
                    currentPage={galleryPage} />
            </div>
            <div className="gallery-container-inner">
                {getCurrentGalleryPage().map((collection, i) => {
                    return <CollectionGalleryItem
                        key={i}
                        index={i}
                        data={collection}
                        imageUrl={getCollectionCover(collection)}
                        bodyClickHandler={() => props.viewCollection(collection)}
                    ></CollectionGalleryItem>
                })

                }
            </div>
            <div className="gallery-container-footer">
                <PageSelect setPage={setPage} totalPages={totalPages} currentPage={galleryPage}></PageSelect>
            </div>
        </div>
    )
}

export default CollectionGallery