import { useEffect, useState } from "react";
import IBook from "../../../interfaces/book";
import { IBookSearchQuery } from "../../../interfaces/searchQuery";
import { BooksSortOrder } from "../../../util/enums";
import { GetCoverPath, getBookAuthor } from "../../../util/helpers";
import PageSelect from "../../shared/pageSelect";
import FilterInfo from "./filterInfo";
import GalleryItem from "./galleryItem";
import SortControls from "./sortControls";

interface CoverGalleryProps {
    allBooks: IBook[],
    pageSize: number,

    sortOrder?: BooksSortOrder,
    query?: IBookSearchQuery,
    showFilters?: boolean,

    viewBook(book: IBook): void,
    updateBook(book: IBook): void,
    viewSearchResults(query?: IBookSearchQuery): void
    addBookToSlideshow(book : IBook): void
}

const CoverGallery = (props: CoverGalleryProps) => {
    const initialSortOrder = props.sortOrder ?? BooksSortOrder.Favorite

    const [ galleryPage, setGalleryPage ] = useState<number>(0)
    const [ currentPageSize, setCurrentPageSize ] = useState<number>(props.allBooks.length < props.pageSize ? props.allBooks.length : props.pageSize)
    const [ bookList, setBookList ] = useState<IBook[]>([])
    const [ totalPages, setTotalPages ] = useState<number>(0)
    const [ sortOrder, setSortOrder ] = useState<BooksSortOrder>(initialSortOrder)

    useEffect(() => {
        updateBookList(props.allBooks, props.query)
    }, [ props.allBooks, props.query ])

     const updateBookList = (books: IBook[], query?: IBookSearchQuery) => {
        if (query) {
            const filteredBooks = getFilteredBooks(books, query)
            const sortedBooks = getSortedBooks(filteredBooks, initialSortOrder)
            setBookList(sortedBooks)
            setTotalPages(getTotalPages(sortedBooks))
            setGalleryPage(0)
        } else {
            const sortedBooks = getSortedBooks(books, initialSortOrder)
            setBookList(sortedBooks)
            setTotalPages(getTotalPages(books))
        }
     }

    const getTotalPages = (books: IBook[]): number => {
        if (books) {
            return Math.max(1, Math.ceil(books.length / props.pageSize))
        }
        return 1
    }

    const getSortedBooks = (books: IBook[], sortOrder: BooksSortOrder): IBook[] => {
        let sortedCopy = [...books]
        switch (sortOrder) {
            case BooksSortOrder.Title:
                sortedCopy.sort((a, b) => {
                    return a.title.localeCompare(b.title)
                })
                break
            case BooksSortOrder.Author:
                sortedCopy.sort((a, b) => {
                    let aAuthor = getBookAuthor(a)
                    let bAuthor = getBookAuthor(b)
                    return aAuthor.localeCompare(bAuthor)      
                })               
                break
            case BooksSortOrder.Artist:
                    sortedCopy.sort((a, b) => {
                        let aArtists = a.artists.join(',')
                        let bArtists = b.artists.join(',')
                        return aArtists.localeCompare(bArtists)
                    })
                    break
            case BooksSortOrder.ID:
                sortedCopy.sort((a, b) => {
                    return a.id - b.id
                })
                break
            case BooksSortOrder.Random:
                sortedCopy.sort((a, b) => {
                    return 0.5 - Math.random()
                })
                break
            case BooksSortOrder.Favorite:
                sortedCopy.sort((a, b) => {
                    return 0.5 - Math.random()
                })
                let favorites = sortedCopy.filter(b => b.isFavorite)
                let other = sortedCopy.filter(b => !b.isFavorite)
                sortedCopy = favorites.concat(other)
                break
            case BooksSortOrder.Date:
                sortedCopy.sort((a, b) => {
                    return b.addedDate.getTime() - a.addedDate.getTime()
                })
                break
            default:
                console.log("getSortedBooks - Invalid Sort Order")
        }
        return sortedCopy
    }

    const getFilteredBooks = (books: IBook[], searchQuery: IBookSearchQuery): IBook[] => {
        let results = books
        if (searchQuery.artists) {
            let queryArtists = searchQuery.artists.split(',').map(s => s.toLowerCase())
            results = results.filter(book => {
                if (book.artists) {
                    let match = book.artists.filter((a) => queryArtists.includes(a.toLowerCase()))
                    if (match.length > 0) {
                        return true
                    }
                    //return book.artists.some((a) => a.toLowerCase() === searchQuery.artist!.toLowerCase())
                }
                return false
            })
        }
        if (searchQuery.groups) {
            results = results.filter(book => {
                return book.artGroup === searchQuery.groups
            })
        }
        if (searchQuery.prefix) {
            results = results.filter(book => {
                return book.prefix === searchQuery.prefix
            })
        }
        if (searchQuery.tags) {
            results = results.filter(book => {
                if (book.tags) {
                    return book.tags.some((a) => a.toLowerCase() === searchQuery.tags!.toLowerCase())
                }
                return false
            })
        }
        if (searchQuery.text) {
            results = results.filter(book => {
                if (book.searchTerms) {
                    return book.searchTerms.some((a) => a.toLowerCase() === searchQuery.text?.toLowerCase())
                }
                return false
            })
        }
        return results
    }

    const sortBooks = (order: BooksSortOrder) => {
        if (sortOrder !== order || order === BooksSortOrder.Random || order === BooksSortOrder.Favorite){
            setBookList(getSortedBooks(props.allBooks, order))
            setSortOrder(order)
            setGalleryPage(0)
        }
    }

    const getItemSubtitle = (book: IBook): string => {
        if (sortOrder === BooksSortOrder.Author) {
            return getBookAuthor(book)
        }
        return book.artists.join(', ')
    }

    const getCurrentGalleryPage = (): IBook[] => {
        let pageStart = galleryPage * props.pageSize;
        let pageEnd = (galleryPage+1) * props.pageSize;
        return bookList.slice(pageStart, pageEnd)
    }

    const getPageSize = (pageNum: number): number => {
        if (pageNum < totalPages-1) {
            return props.pageSize
        } else {
            return bookList.length % props.pageSize
        }
    }

    const setPage = (pageNum: number) => {
        setGalleryPage(pageNum)
    }

    const bodyClick = (book: IBook, bookIndex: number) => {
        props.viewBook(book)
    }

    const subTitleClick = (book: IBook) => {
        let subtitle = getItemSubtitle(book)
        
        if (subtitle === book.artGroup) {
            console.log(`subtitle search - Group: ${subtitle}`)
            props.viewSearchResults({ groups: subtitle })
        }
        else {
            console.log(`subtitle search - Artist: ${subtitle}`)
            props.viewSearchResults({ artists: subtitle })
        }      
    }

    const favoriteClick = (book: IBook) => {
        console.log("toggle favorite for book: " + book.id)
        if (props.updateBook) {
            book.isFavorite = !book.isFavorite; //toggle value
            props.updateBook(book)
        }
    }

    return (
            <div className="gallery-container dark-theme">
                <div className="gallery-container-header">
                    {
                        props.showFilters && props.query && props.query.filled ?
                        <FilterInfo filterQuery={props.query}></FilterInfo>
                        : null
                    }
                    <PageSelect 
                        setPage={setPage} 
                        totalPages={totalPages} 
                        currentPage={galleryPage}/>
                    {
                        props.sortOrder ? null :
                        <SortControls sortOrder={sortOrder}
                            bookList={bookList}
                            pageSize={props.pageSize}
                            sortBooks={sortBooks}
                            setPage={setPage}/>
                    }
                </div>
                <div className="gallery-container-inner">
                    {getCurrentGalleryPage().map((book, i) => {
                        return <GalleryItem
                            key={i}
                            index={i}
                            book={book}
                            coverUrl={GetCoverPath(book)}
                            subtitle={getItemSubtitle(book)}
                            addButtonHandler={props.addBookToSlideshow} 
                            bodyClickHandler={bodyClick}
                            subTitleClickHandler={subTitleClick}
                            favoriteClickHandler={favoriteClick}
                        ></GalleryItem>
                    })

                    }
                </div>
                <div className="gallery-container-footer">
                    <PageSelect setPage={setPage} totalPages={totalPages} currentPage={galleryPage}></PageSelect>
                </div>
            </div>
        )
}
export default CoverGallery