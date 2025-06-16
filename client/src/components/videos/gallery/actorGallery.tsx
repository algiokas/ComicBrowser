import IActor from "../../../interfaces/actor"
import { IVideoSearchQuery } from "../../../interfaces/searchQuery"
import { ActorsSortOrder } from "../../../util/enums"
import PageSelect from "../../shared/pageSelect"
import ActorGalleryItem from "./actorGalleryItem"
import ActorSortControls from "./actorSortControls"
import { BaseGalleryProps } from "../../shared/baseGallery"
import { useEffect, useState } from "react"


interface ActorGalleryProps extends BaseGalleryProps<IActor> {
    sortOrder?: ActorsSortOrder,
    updateActor(actor: IActor): void,
    getActorImageUrl(actor: IActor): string,
    viewSearchResults(query?: IVideoSearchQuery): void,
}

const ActorGallery = (props: ActorGalleryProps) => {
    const initialSortOrder = props.sortOrder ?? ActorsSortOrder.Favorite

    const [items, setItems] = useState<IActor[]>([])
    const [sortOrder, setSortOrder] = useState<ActorsSortOrder>(initialSortOrder)
    const [galleryPage, setGalleryPage] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [currentPageSize, setCurrentPageSize] = useState<number>(props.allItems.length < props.pageSize ? props.allItems.length : props.pageSize)

    useEffect(() => {
        updateItems(props.allItems)
    }, [props.allItems])

    const updateItems = (actors: IActor[]) => {
        setItems(getSortedActors(actors, initialSortOrder))
        setTotalPages(getTotalPages(actors))
        setGalleryPage(0)
        setSortOrder(initialSortOrder)
    }

    const getSortedActors = (actors: IActor[], sortOrder: ActorsSortOrder): IActor[] => {
        let sortedCopy = [...actors]
        switch (sortOrder) {
            case ActorsSortOrder.Name:
                sortedCopy.sort((a, b) => {
                    return a.name.localeCompare(b.name)
                })
                break
            case ActorsSortOrder.NumVideos:
                sortedCopy.sort((a, b) => {
                    return b.videos.length - a.videos.length
                })
                break
            case ActorsSortOrder.Random:
                sortedCopy.sort((a, b) => {
                    return 0.5 - Math.random()
                })
                break
            case ActorsSortOrder.Favorite:
                sortedCopy.sort((a, b) => {
                    return 0.5 - Math.random()
                })
                let favorites = sortedCopy.filter(b => b.isFavorite)
                let other = sortedCopy.filter(b => !b.isFavorite)
                sortedCopy = favorites.concat(other)
                break
        }
        return sortedCopy
    }

    const getTotalPages = (Actors: IActor[]): number => {
        if (Actors) {
            return Math.max(1, Math.ceil(Actors.length / props.pageSize))
        }
        return 1
    }

    const sortActors = (newOrder: ActorsSortOrder) => {
        if (sortOrder !== newOrder || newOrder === ActorsSortOrder.Random || newOrder === ActorsSortOrder.Favorite) {
            setItems(getSortedActors(props.allItems, newOrder))
            setSortOrder(newOrder)
            setGalleryPage(0)
        }
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

    const getCurrentgalleryPage = (): IActor[] => {
        let pageStart = galleryPage * props.pageSize;
        let pageEnd = (galleryPage + 1) * props.pageSize;
        return items.slice(pageStart, pageEnd)
    }

    const bodyClick = (a: IActor) => {
        props.viewSearchResults({ actor: a.name })
    }

    const favoriteClick = (a: IActor) => {
        console.log("toggle favorite for actor: " + a.id)
        a.isFavorite = !a.isFavorite; //toggle value
        props.updateActor(a)
    }

    return (
        <div className="actorgallery-container dark-theme">
            <div className="actorgallery-container-header">
                <PageSelect
                    setPage={setPage}
                    totalPages={totalPages}
                    currentPage={galleryPage} />
                <ActorSortControls sortOrder={sortOrder}
                    actorList={items}
                    pageSize={props.pageSize}
                    sortVideos={sortActors}
                    setPage={setPage} />
            </div>
            <div className="actorgallery-container-inner">
                {getCurrentgalleryPage().map((actor, i) => {
                    return <ActorGalleryItem
                        key={i}
                        index={i}
                        data={actor}
                        imageUrl={props.getActorImageUrl(actor)}
                        bodyClickHandler={bodyClick}
                        favoriteClickHandler={favoriteClick}
                    ></ActorGalleryItem>
                })

                }
            </div>
            <div className="actorgallery-container-footer">
                <PageSelect setPage={setPage} totalPages={totalPages} currentPage={galleryPage}></PageSelect>
            </div>
        </div>
    )

}

export default ActorGallery