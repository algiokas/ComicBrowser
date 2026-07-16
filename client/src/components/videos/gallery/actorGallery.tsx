import type { Actor } from "../../../types/actor"
import { ActorsSortOrder } from "../../../util/enums"
import PageSelect from "../../shared/pageSelect"
import ActorGalleryItem from "./actorGalleryItem"
import ActorSortControls from "./actorSortControls"
import { useContext, useEffect, useRef, useState } from "react"
import { VideosAppContext } from "../../../context/videosAppContext"
import { scalarArrayCompare } from "../../../util/helpers"
import { getActorVideoCount } from "../../../util/videoUtils"
import type { IActorSearchQuery } from "../../../types/searchQuery"


interface ActorGalleryProps {
    showFilters?: boolean,
    sortOrder?: ActorsSortOrder,
    query?: IActorSearchQuery
}

const ActorGallery = (props: ActorGalleryProps) => {
    const initialSortOrder = props.sortOrder ?? ActorsSortOrder.Name

    const appContext = useContext(VideosAppContext)

    const [items, setItems] = useState<Actor[]>([])
    const [sortOrder, setSortOrder] = useState<ActorsSortOrder>(initialSortOrder)
    const [totalPages, setTotalPages] = useState<number>(0)
    const [videoCounts, setVideoCounts] = useState<Map<number, number>>(new Map<number, number>())

    useEffect(() => {
        updateItems(appContext.allActors)
    }, [appContext.allActors])

    const previousActors = useRef([] as Actor[])

    const updateItems = (actors: Actor[]) => {
        const newIds = actors.map(a => a.id)
        const oldIds = previousActors.current.map(a => a.id)
        if (!scalarArrayCompare(newIds, oldIds)) {
            setItems(getSortedActors(actors, initialSortOrder))
            setTotalPages(getTotalPages(actors))
            setPage(0)
            setSortOrder(initialSortOrder)
            getVideoCounts()
        }
        previousActors.current = actors
    }

    const getVideoCounts = () => {
        let newVideoCounts = new Map<number, number>()
        for (const a of appContext.allActors) {
            newVideoCounts.set(a.id, getActorVideoCount(a, appContext.allVideos))
        }
        setVideoCounts(newVideoCounts)
    }

    // const getVideoTagApperanceCount = (a: Actor): number => {
        
    // }

    const getSortedActors = (actors: Actor[], sortOrder: ActorsSortOrder): Actor[] => {
        let sortedCopy = [...actors]
        switch (sortOrder) {
            case ActorsSortOrder.ID:
                sortedCopy.sort((a, b) => {
                    return a.id - b.id
                })
                break
            case ActorsSortOrder.Name:
                sortedCopy.sort((a, b) => {
                    return a.name.localeCompare(b.name)
                })
                break
            case ActorsSortOrder.NumVideos:
                sortedCopy.sort((a, b) => {
                    return (videoCounts.get(b.id) ?? 0) - (videoCounts.get(a.id) ?? 0)
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

    const getTotalPages = (Actors: Actor[]): number => {
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

    const getCurrentgalleryPage = (): Actor[] => {
        let pageStart = appContext.actorListingPage * appContext.galleryPageSize;
        let pageEnd = (appContext.actorListingPage + 1) * appContext.galleryPageSize;

        return items.slice(pageStart, pageEnd)
    }

    const bodyClick = (a: Actor) => {
        appContext.viewSearchResults({ actor: a.name })
    }

    const favoriteClick = (a: Actor) => {
        console.log("toggle favorite for actor: " + a.id)
        a.isFavorite = !a.isFavorite; //toggle value
        appContext.updateActor(a)
    }

    const getInfoDisplay = (a: Actor): string[] | null => {
        switch (sortOrder) {
            case ActorsSortOrder.ID:
                return ["ID: ", `${a.id}`]
            case ActorsSortOrder.Name:
                return null
            case ActorsSortOrder.NumVideos:
                return ["Videos: ", `${(videoCounts.get(a.id) ?? 0)}`]
            case ActorsSortOrder.Random:
                return null
            case ActorsSortOrder.Favorite:
                return null
        }
        return null
    }

    return (
        <div className="actor-gallery-container dark-theme">
            <div className="actor-gallery-container-header">
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
            <div className="actor-gallery-container-inner">
                {getCurrentgalleryPage().map((actor, i) => {
                    let infoDisplay = getInfoDisplay(actor)
                    return <ActorGalleryItem
                        key={i}
                        index={i}
                        data={actor}
                        imageUrl={actor.imageUrl}
                        bodyClickHandler={bodyClick}
                        favoriteClickHandler={favoriteClick}
                        infoLabel={infoDisplay?.at(0)}
                        infoValue={infoDisplay?.at(1)}
                    ></ActorGalleryItem>
                })

                }
            </div>
            <div className="actor-gallery-container-footer">
                <PageSelect setPage={setPage} totalPages={totalPages} currentPage={appContext.actorListingPage}></PageSelect>
            </div>
        </div>
    )

}

export default ActorGallery