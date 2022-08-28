import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import PageSelect from "./pageSelect";

class BookGallery extends Component {
    constructor(props) {
        super(props)
        
        this.allBooks = props.allBooks  
        this.viewBook = props.viewBook.bind(this)
        this.addBookToSlideshow = props.addBookToSlideshow.bind(this)
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
        if (this.state.galleryPage > 0) {
            this.setState((state) => {
                return {galleryPage: state.galleryPage - 1};
            });
        }
    }

    nextPage = () => {
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
                        return <GalleryItem book={object} bodyClickHandler={this.viewBook} addButtonHandler={this.addBookToSlideshow} ></GalleryItem>
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