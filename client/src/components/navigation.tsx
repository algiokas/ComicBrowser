import React, { Component } from "react";
import logo from '../logo.svg';
import { ViewMode } from "../util/enums";
import ISearchQuery from "../interfaces/searchQuery";

interface NavProps {
  slideshowCount: number,
  viewMode: ViewMode,
  viewListing(): void,
  viewSlideshow(): void,
  viewCurrentBook(): void,
  viewSearchResults(query?: ISearchQuery): void,
  importBooks(): void,
}

interface NavState {}

class Navigation extends Component<NavProps, NavState>  {
  // constructor(props : NavProps) {
  //   super(props)
  // }

  render() {
    return (
      <nav role="navigation">
        <div className="logo">
          <img className="logo-pink" src={logo} alt="Logo" onClick={this.props.viewListing} />
        </div>
        <div className="nav-items">
          <div className="nav-item" onClick={this.props.viewListing}>
            <div className={`nav-item-inner ${this.props.viewMode === ViewMode.Listing ? "selected" : ""}`}>Listing</div>
          </div>
          <div className="nav-item" onClick={this.props.viewCurrentBook}>
            <div className={`nav-item-inner ${this.props.viewMode === ViewMode.SingleBook ? "selected" : ""}`}>Current book</div>
            </div>
          <div className="nav-item" onClick={this.props.viewSlideshow}>
            <div className={`nav-item-inner ${this.props.viewMode === ViewMode.Slideshow ? "selected" : ""}`}>Slideshow 
              <span className="slideshow-count">{this.props.slideshowCount}</span>
            </div>
          </div>
          <div className="nav-item" onClick={() => { this.props.viewSearchResults() }}>
            <div className={`nav-item-inner ${this.props.viewMode === ViewMode.SearchResults ? "selected" : ""}`}>Search Results</div>
          </div>
          <div className="nav-item" onClick={this.props.importBooks}>
            <div className={`nav-item-inner`}>Import Books</div>
          </div>
        </div>
      </nav>
    )
  }
}

export default Navigation