import { Component } from "react";
import { ICollection } from "../../../interfaces/slideshow";
import PageSelect from "../../shared/pageSelect"
import BaseGallery, { BaseGalleryProps, BaseGalleryState } from "../../shared/baseGallery"
import CollectionGalleryItem from "./collectionGalleryItem";
import { GetCoverPath, GetPagePathByID } from "../../../util/helpers";


interface CollectionGalleryProps extends BaseGalleryProps<ICollection> {
    viewCollection(col: ICollection): void
}

interface CoverGalleryState extends BaseGalleryState<ICollection> {
}

class CollectionGallery extends BaseGallery<ICollection, CollectionGalleryProps, CoverGalleryState> {
    constructor(props: CollectionGalleryProps) {
        super(props)

        this.state = {
            galleryPage: 0,
            currentPageSize: props.allItems.length < props.pageSize ? props.allItems.length : props.pageSize,
            items: this.props.allItems,
            totalPages: 0,
        }
    }

    getCollectionCover = (col: ICollection): string => {
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

    render() {
        return (
            <div className="gallery-container dark-theme">
                <div className="gallery-container-header">
                    <PageSelect 
                        setPage={this.setPage} 
                        totalPages={this.state.totalPages} 
                        currentPage={this.state.galleryPage}/>
                </div>
                <div className="gallery-container-inner">
                    {this.getCurrentGalleryPage().map((collection, i) => {
                        return <CollectionGalleryItem
                            key={i}
                            index={i}
                            data={collection}
                            imageUrl={this.getCollectionCover(collection)}
                            bodyClickHandler={() => this.props.viewCollection(collection)}
                        ></CollectionGalleryItem>
                    })

                    }
                </div>
                <div className="gallery-container-footer">
                    <PageSelect setPage={this.setPage} totalPages={this.state.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                </div>
            </div>
        )
    }
}

export default CollectionGallery