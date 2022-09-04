import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import { getBookAuthor } from "../util/helpers";

export const SearchType = Object.freeze({
    None: Symbol("None"),
    Artist: Symbol("Artist"),
    Group: Symbol("Group"),
    Prefix: Symbol("Prefix"),
    Suffix: Symbol("Suffix"),
    Tag: Symbol("Tag"),
    Multi: Symbol("Multi")
})

class SearchResults extends Component {
    constructor(props) {
        super(props)

        this.allBooks = props.allBooks
        this.searchQuery = props.query

        console.log('')

        this.viewBook = props.viewBook.bind(this)
        this.addBookToSlideshow = props.addBookToSlideshow.bind(this)
        
        this.state = {
            searchType: SearchType.None,
            filteredBooks: []
        }
        this.state.filteredBooks = this.filterBooks(props.allBooks, props.query)
    }

    setSearchType = (type) => {
        if (this.state.searchType === SearchType.None) {
            this.state.searchType = type
        } else {
            this.state.searchType = SearchType.Multi
        }
    }

    filterBooks = (books, searchQuery) => {
        let results = books
        console.log('filter books')
        console.log(searchQuery)
        if (searchQuery.artist) {
            results = results.filter(book => {
                if (book.artists) {
                    return book.artists.some((a) => a.toLowerCase() === searchQuery.artist.toLowerCase())
                }
                return false
            })
            this.setSearchType(SearchType.Artist)
        }
        if (searchQuery.group) {
            results = results.filter(book => {
                return book.group === searchQuery.group
            })
            this.setSearchType(SearchType.Group)
        }
        if (searchQuery.prefix) {
            results = results.filter(book => {
                return book.prefix === searchQuery.prefix
            })
            this.setSearchType(SearchType.Prefix)
        }
        if (searchQuery.suffix) {
            console.log('pre-search results:')
            console.log(results)
            results = results.filter(book => {
                if (book.suffixItems) {
                    return book.suffixItems.some((a) => a.toLowerCase() === searchQuery.suffix.toLowerCase())
                }
                return false
            })
            console.log('post-search results:')
            console.log(results)
            this.setSearchType(SearchType.Suffix)
        }
        return results
    }

    getItemSubtitle = (book) => {


        return book.artists.join(',')
    }

    render() {
        return (
            <div className="container index-container dark-theme">
                <div className="container-header">
                    SEARCH RESULTS
                </div>
                <div className="container-inner">
                    {this.state.filteredBooks.map((object, i) => {
                        return <GalleryItem book={object} bodyClickHandler={this.viewBook} addButtonHandler={this.addBookToSlideshow} getSubtitle={this.getItemSubtitle}></GalleryItem>
                    })
                    }
                </div>
            </div>
        )
    }
}

export default SearchResults