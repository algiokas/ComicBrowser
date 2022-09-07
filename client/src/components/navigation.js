import React, { Component } from "react";
import logo from '../logo.svg';

class Navigation extends Component {
    constructor(props) {
        super(props)

        this.viewListing = props.handlers.viewListing.bind(this)
        this.viewSlideshow = props.handlers.viewSlideshow.bind(this)
        this.viewCurrentbook = props.handlers.viewCurrentBook.bind(this)
        this.viewSearchResults = props.handlers.viewSearchResults.bind(this)
    }

    render() {
        return (
            <nav role="navigation">
            <div className="logo">
              <img className="logo-pink" src={logo} alt="Logo" onClick={this.viewListing} />
            </div>
            <div className="nav-items">
              <div className="nav-item" onClick={this.viewListing}>Listing</div>
              <div className="nav-item" onClick={this.viewCurrentbook}>Current book</div>
              <div className="nav-item" onClick={this.viewSlideshow}>
                Slideshow <span className="slideshow-count">{this.props.slideshowCount}</span> 
              </div>
              <div className="nav-item" onClick={() => {this.viewSearchResults()}}>Search Results</div>
            </div>
          </nav>
        )
    }
}

export default Navigation