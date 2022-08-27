import React, { Component } from "react";
import BookGallery from "./bookGallery";
import SlideShow from "./slideshow";
import { ViewMode } from "../App";

class MainBody extends Component {
    constructor(props) {
        super(props)

        console.log("Construct Main Body")
        console.log(props)
    }

    render() {
        switch(this.props.viewMode) {
            case ViewMode.Listing:
                return(
                    <BookGallery 
                        allBooks={this.props.allBooks} 
                        pageSize={this.props.galleryPageSize} 
                        viewBook={this.props.viewBook} 
                        addBookToSlideshow={this.props.addBookToSlideshow}>
                    </BookGallery>
                )
            case ViewMode.SingleBook:
                let singleBook = {
                    pageCount: this.props.currentBook.pageCount,
                    books: [ this.props.currentBook ]
                }
                return(
                    <SlideShow 
                    slideShow={singleBook}
                    interval={this.props.slideshowInterval}
                    setSlideshowInterval={this.props.setSlideshowInterval}
                    ></SlideShow>
                )
            case ViewMode.Slideshow:
                return (
                    <SlideShow 
                    slideShow={this.props.currentSlideshow}
                    interval={this.props.slideshowInterval}
                    setSlideshowInterval={this.props.setSlideshowInterval}
                    ></SlideShow>
                )
            default:
                console.log("INVALID VIEWMODE")
                return(<p>VIEWMODE ERROR</p>)
        }
    }
}

export default MainBody