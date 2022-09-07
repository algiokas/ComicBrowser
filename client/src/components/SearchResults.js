import React, { Component } from "react";
import GalleryItem from "./galleryItem";

export const SearchType = Object.freeze({
    None: Symbol("None"),
    Artist: Symbol("Artist"),
    Group: Symbol("Group"),
    Prefix: Symbol("Prefix"),
    Tag: Symbol("Tag"),
    Multi: Symbol("Multi")
})

class SearchResults extends Component {
    constructor(props) {
        super(props)

        this.allBooks = props.allBooks
        this.searchQuery = props.query

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
            this.setState({
                searchType: type
            })
        } else {
            this.setState({
                searchType:  SearchType.Multi
            })
        }
    }

    filterBooks = (books, searchQuery) => {
        let results = books
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
        if (searchQuery.tag) {
            results = results.filter(book => {
                if (book.tags) {
                    return book.tags.some((a) => a.toLowerCase() === searchQuery.tag.toLowerCase())
                }
                return false
            })
            this.setSearchType(SearchType.Tag)
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
                        return <GalleryItem key={i} book={object} bodyClickHandler={this.viewBook} addButtonHandler={this.addBookToSlideshow} getSubtitle={this.getItemSubtitle}></GalleryItem>
                    })
                    }
                </div>
            </div>
        )
    }
}

export default SearchResults