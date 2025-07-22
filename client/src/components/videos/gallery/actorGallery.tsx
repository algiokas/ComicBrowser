import type IActor from "../../../interfaces/actor"
import { ActorsSortOrder } from "../../../util/enums"
import PageSelect from "../../shared/pageSelect"
import ActorGalleryItem from "./actorGalleryItem"
import ActorSortControls from "./actorSortControls"
import { useContext, useEffect, useRef, useState } from "react"
import { VideosAppContext } from "../videosAppContext"
import { scalarArrayCompare } from "../../../util/helpers"
import { getActorVideoCount } from "../../../util/videoUtils"


interface ActorGalleryProps {
    showFilters?: boolean,
    sortOrder?: ActorsSortOrder,
}

const ActorGallery = (props: ActorGalleryProps) => {
    const initialSortOrder = props.sortOrder ?? ActorsSortOrder.Name

    const appContext = useContext(VideosAppContext)

    const [items, setItems] = useState<IActor[]>([])
    const [sortOrder, setSortOrder] = useState<ActorsSortOrder>(initialSortOrder)
    const [totalPages, setTotalPages] = useState<number>(0)

    useEffect(() => {
        updateItems(appContext.allActors)
    }, [appContext.allActors])

    const previousActors = useRef([] as IActor[])

    const updateItems = (actors: IActor[]) => {
        const newIds = actors.map(a => a.id)
        const oldIds = previousActors.current.map(a => a.id)
        if (!scalarArrayCompare(newIds, oldIds)) {
            setItems(getSortedActors(actors, initialSortOrder))
            setTotalPages(getTotalPages(actors))
            setPage(0)
            setSortOrder(initialSortOrder)
        }


        previousActors.current = actors
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
                    return getActorVideoCount(b, appContext.allVideos) - getActorVideoCount(a, appContext.allVideos)
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
            return Math.max(1, Math.ceil(Actors.length / appContext.galleryPageSize))
        }
        return 1
    }

    const sortActors = (newOrder: ActorsSortOrder) => {
        if (sortOrder !== newOrder || newOrder === ActorsSortOrder.Random || newOrder === ActorsSortOrder.Favorite) {
            setItems(getSortedActors(appContext.allActors, newOrder))
            setSortOrder(newOrder)
            setPage(0)
        }
    }

    const setPage = (pageNum: number) => {
        appContext.setActorListingPage(pageNum)
    }

    const getCurrentgalleryPage = (): IActor[] => {
        let pageStart = appContext.actorListingPage * appContext.galleryPageSize;
        let pageEnd = (appContext.actorListingPage + 1) * appContext.galleryPageSize;
        return items.slice(pageStart, pageEnd)
    }

    const bodyClick = (a: IActor) => {
        appContext.viewSearchResults({ actor: a.name })
    }

    const favoriteClick = (a: IActor) => {
        console.log("toggle favorite for actor: " + a.id)
        a.isFavorite = !a.isFavorite; //toggle value
        appContext.updateActor(a)
    }

    return (
        <div className="actorgallery-container dark-theme">
            <div className="actorgallery-container-header">
                <PageSelect
                    setPage={setPage}
                    totalPages={totalPages}
                    currentPage={appContext.actorListingPage} />
                <ActorSortControls sortOrder={sortOrder}
                    actorList={items}
                    pageSize={appContext.galleryPageSize}
                    sortVideos={sortActors}
                    setPage={setPage} />
            </div>
            <div className="actorgallery-container-inner">
                {getCurrentgalleryPage().map((actor, i) => {
                    return <ActorGalleryItem
                        key={i}
                        index={i}
                        actor={actor}
                        bodyClickHandler={bodyClick}
                        favoriteClickHandler={favoriteClick}
                    ></ActorGalleryItem>
                })

                }
            </div>
            <div className="actorgallery-container-footer">
                <PageSelect setPage={setPage} totalPages={totalPages} currentPage={appContext.actorListingPage}></PageSelect>
            </div>
        </div>
    )

}

export default ActorGallery