import React, { Component } from "react";
import { GetCoverPath } from "../helpers";

class GalleryItem extends Component {
    constructor(props) {
      super(props)
      this.state = { coverUrl: GetCoverPath(props.book) }
      this.setCurrentBook = this.props.setCurrentBook.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
      if (this.props.book.title != prevProps.book.title) {
        this.setState({ coverUrl: GetCoverPath(this.props.book) })
      }
    }

    render() {
        return (
          <div className="gallery" key={this.props.book.title} onClick={() => this.setCurrentBook(this.props.book)}>
            <img className="gallery-image" src={this.state.coverUrl}></img>
            <div className="caption">{this.props.book.title}</div>
          </div>
        )
      }
}

export default GalleryItem