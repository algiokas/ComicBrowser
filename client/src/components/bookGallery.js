import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import PageSelect from "./pageSelect";

class BookGallery extends Component {
    constructor(props) {
        super(props)

        console.log(this.props)

        console.log('new gallery with ' + props.allBooks.length + ' books')
        
        this.allBooks = props.allBooks
        this.setCurrentBook = props.setCurrentBook.bind(this)
        this.pageSize = props.pageSize
        this.totalPages = Math.floor(props.allBooks.length / this.pageSize)

        this.state = { galleryPage: 0 }
    }

    getCurrentPage = () => {
        let pageStart = this.state.galleryPage * this.pageSize;
        let pageEnd = (this.state.galleryPage+1) * this.pageSize;

        return this.allBooks.slice(pageStart, pageEnd)
    }

    previousPage = () => {
        console.log('prev page')
        if (this.state.galleryPage > 0) {
            this.setState((state) => {
                return {galleryPage: state.galleryPage - 1};
            });
        }
    }

    nextPage = () => {
        console.log('next page')
        if (this.state.galleryPage < this.totalPages-1) {
            this.setState((state) => {
                return {galleryPage: state.galleryPage + 1};
            });
        }
    }

    render() {
        return (
            <div className="container index-container dark-theme">
                <div className="container-header">
                    <PageSelect previousPage={this.previousPage} nextPage={this.nextPage} totalPages={this.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                </div>
                <div className="container-inner">
                    {this.getCurrentPage().map((object, i) => {
                        return <GalleryItem book={object} setCurrentBook={this.setCurrentBook}></GalleryItem>
                    })
                    }
                </div>
                <div className="container-footer">
                    <PageSelect previousPage={this.previousPage} nextPage={this.nextPage} totalPages={this.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                </div>
            </div>
        )
    }
}

export default BookGallery