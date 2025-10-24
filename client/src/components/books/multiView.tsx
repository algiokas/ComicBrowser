import CoverGallery from "./coverGallery/coverGallery";
import Slideshow from "./slideshow/slideshow";
import LoadingView from "./loadingView";
import { BooksViewMode } from "../../util/enums";
import { BooksSortOrder } from "../../util/enums";
import type { Book } from "../../types/book";
import type { IBookSearchQuery } from "../../types/searchQuery";
import type { BooksAppState } from "./booksApp";
import CollectionGallery from "./coverGallery/collectionGallery";
import type { Collection } from "../../types/slideshow";

interface MultiViewProps extends BooksAppState {
    viewBook(book: Book): void,
    viewSlideshow(): void,
    viewListing(): void,
    viewCurrentBook(): void,
    viewSearchResults(query?: IBookSearchQuery): void,
    viewCollection(col: Collection): void,
    addBookToSlideshow(book: Book): void,
    removeBookFromSlideshow(index: number): void,
    setSlideshowInterval(interval: number): void,
    setCurrentPage(n: number): void,
    resetSlideshow(): void,
    updateBook(book: Book): void,
    deleteBook(bookId: number): void,
    importBooks(): void,
    createCollection(collectionName: string, coverBookId: number): void
}

const MultiView = (props: MultiViewProps) => {
    const galleryHandlers = {
        viewBook: props.viewBook,
        updateBook: props.updateBook,
        viewSearchResults: props.viewSearchResults,
        addBookToSlideshow: props.addBookToSlideshow
    }

    const slideshowHandlers = {
        setCurrentPage: props.setCurrentPage,
        addButtonHandler: props.addBookToSlideshow,
        removeButtonHandler: props.removeBookFromSlideshow,
        emptySlideshow: props.resetSlideshow,
        updateBook: props.updateBook,
        deleteBook: props.deleteBook,
        viewSearchResults: props.viewSearchResults,
        createCollection: props.createCollection
    }

    switch (props.viewMode) {
        case BooksViewMode.Listing:
            return (
                <CoverGallery
                    allBooks={props.allBooks}
                    pageSize={props.galleryPageSize}
                    {...galleryHandlers} />
            )
        case BooksViewMode.SearchResults:
            return (
                <CoverGallery
                    sortOrder={BooksSortOrder.Title}
                    query={props.currentSearchQuery}
                    allBooks={props.allBooks}
                    pageSize={props.galleryPageSize}
                    showFilters={true}
                    {...galleryHandlers} />
            )
        case BooksViewMode.SingleBook:
            let singleBook = {
                id: null,
                name: "",
                pageCount: props.currentBook?.pageCount ?? 0,
                books: [props.currentBook!],
            }
            return (
                <Slideshow
                    slideshow={singleBook}
                    currentPage={props.singleBookPage}
                    viewMode={props.viewMode}
                    {...slideshowHandlers} />
            )
        case BooksViewMode.Slideshow:
            return (
                <Slideshow
                    slideshow={props.currentSlideshow}
                    currentPage={props.slideshowPage}
                    viewMode={props.viewMode}
                    {...slideshowHandlers} />
            )
        case BooksViewMode.Collections:
            return (
                <CollectionGallery
                    allItems={props.allCollections}
                    pageSize={props.galleryPageSize}
                    viewCollection={props.viewCollection} />
            )
        case BooksViewMode.Loading:
            return (
                <LoadingView></LoadingView>
            )
        default:
            console.log("INVALID VIEWMODE")
            return (<p>VIEWMODE ERROR</p>)
    }
}

export default MultiView