import IActor from "../../../interfaces/actor"
import { IVideoSearchQuery } from "../../../interfaces/searchQuery"
import { ActorsSortOrder } from "../../../util/enums"
import PageSelect from "../../shared/pageSelect"
import ActorGalleryItem from "./actorGalleryItem"
import ActorSortControls from "./actorSortControls"
import BaseGallery, { BaseGalleryProps, BaseGalleryState } from "../../shared/baseGallery"


interface ActorGalleryProps extends BaseGalleryProps<IActor> {
    sortOrder?: ActorsSortOrder,
    updateActor(actor: IActor): void,
    getActorImageUrl(actor: IActor): string,
    viewSearchResults(query?: IVideoSearchQuery): void,
}

interface ActorGalleryState extends BaseGalleryState<IActor> {
    sortOrder: ActorsSortOrder
}

class ActorGallery extends BaseGallery<IActor, ActorGalleryProps, ActorGalleryState> {
    constructor(props: ActorGalleryProps) {
        super(props)

        let initialSortOrder = props.sortOrder ?? ActorsSortOrder.Favorite

        let initialState: ActorGalleryState = {
            galleryPage: 0,
            currentPageSize: props.allItems.length < props.pageSize ? props.allItems.length : props.pageSize,
            items: this.getSortedActors(props.allItems, initialSortOrder),
            totalPages: this.getTotalPages(props.allItems),
            sortOrder: initialSortOrder
        }

        this.state = initialState
    }

    componentDidUpdate(prevProps: Readonly<ActorGalleryProps>, prevState: Readonly<ActorGalleryState>, snapshot?: any): void {
        if (prevProps.allItems !== this.props.allItems) {
            this.setState({
                galleryPage: 0,
                items: this.getSortedActors(this.props.allItems, ActorsSortOrder.Favorite),
                totalPages: this.getTotalPages(this.props.allItems),
                sortOrder: ActorsSortOrder.Favorite
            })
        }
    }

    getSortedActors = (actors: IActor[], sortOrder: ActorsSortOrder): IActor[] => {
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


    sortActors = (order: ActorsSortOrder) => {
        if (this.state.sortOrder !== order || order === ActorsSortOrder.Random || order === ActorsSortOrder.Favorite) {
            this.setState({
                galleryPage: 0,
                items: this.getSortedActors(this.props.allItems, order),
                sortOrder: order
            })
        }
    }

    getTotalPages = (Actors: IActor[]): number => {
        if (Actors) {
            return Math.max(1, Math.ceil(Actors.length / this.props.pageSize))
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

    getCurrentgalleryPage = (): IActor[] => {
        let pageStart = this.state.galleryPage * this.props.pageSize;
        let pageEnd = (this.state.galleryPage + 1) * this.props.pageSize;
        return this.state.items.slice(pageStart, pageEnd)
    }

    bodyClick = (a: IActor) => {
        this.props.viewSearchResults({ actor: a.name })
    }

    favoriteClick = (a: IActor) => {
        console.log("toggle favorite for actor: " + a.id)
        a.isFavorite = !a.isFavorite; //toggle value
        this.props.updateActor(a)
    }

    render() {
        return (
            <div className="actorgallery-container dark-theme">
                <div className="actorgallery-container-header">
                    <PageSelect
                        setPage={this.setPage}
                        totalPages={this.state.totalPages}
                        currentPage={this.state.galleryPage} />
                    <ActorSortControls sortOrder={this.state.sortOrder}
                        actorList={this.state.items}
                        pageSize={this.props.pageSize}
                        sortVideos={this.sortActors}
                        setPage={this.setPage} />
                </div>
                <div className="actorgallery-container-inner">
                    {this.getCurrentgalleryPage().map((actor, i) => {
                        return <ActorGalleryItem
                            key={i}
                            index={i}
                            data={actor}
                            imageUrl={this.props.getActorImageUrl(actor)}
                            bodyClickHandler={this.bodyClick}
                            favoriteClickHandler={this.favoriteClick}
                        ></ActorGalleryItem>
                    })

                    }
                </div>
                <div className="actorgallery-container-footer">
                    <PageSelect setPage={this.setPage} totalPages={this.state.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                </div>
            </div>
        )
    }
}

export default ActorGallery