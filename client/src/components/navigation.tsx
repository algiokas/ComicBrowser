import React, { Component } from "react";
import logo from '../logo.svg';
import { ViewMode } from "../util/enums";

class Navigation extends Component {
  constructor(props) {
    super(props)

    this.viewListing = props.handlers.viewListing.bind(this)
    this.viewSlideshow = props.handlers.viewSlideshow.bind(this)
    this.viewCurrentbook = props.handlers.viewCurrentBook.bind(this)
    this.viewSearchResults = props.handlers.viewSearchResults.bind(this)
    this.importBooks = props.handlers.importBooks.bind(this)
  }

  render() {
    return (
      <nav role="navigation">
        <div className="logo">
          <img className="logo-pink" src={logo} alt="Logo" onClick={this.viewListing} />
        </div>
        <div className="nav-items">
          <div className="nav-item" onClick={this.viewListing}>
            <div className={`nav-item-inner ${this.props.viewMode === ViewMode.Listing ? "selected" : ""}`}>Listing</div>
          </div>
          <div className="nav-item" onClick={this.viewCurrentbook}>
            <div className={`nav-item-inner ${this.props.viewMode === ViewMode.SingleBook ? "selected" : ""}`}>Current book</div>
            </div>
          <div className="nav-item" onClick={this.viewSlideshow}>
            <div className={`nav-item-inner ${this.props.viewMode === ViewMode.Slideshow ? "selected" : ""}`}>Slideshow 
              <span className="slideshow-count">{this.props.slideshowCount}</span>
            </div>
          </div>
          <div className="nav-item" onClick={() => { this.viewSearchResults() }}>
            <div className={`nav-item-inner ${this.props.viewMode === ViewMode.SearchResults ? "selected" : ""}`}>Search Results</div>
          </div>
          <div className="nav-item" onClick={this.importBooks}>
            <div className={`nav-item-inner`}>Import Books</div>
          </div>
        </div>
      </nav>
    )
  }
}

export default Navigation