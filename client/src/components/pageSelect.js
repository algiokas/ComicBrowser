import React, { Component } from "react";

class PageSelect extends Component {
    constructor(props) {
        super(props)

        this.previousPageHandler = props.previousPage.bind(this)
        this.nextPageHandler = props.nextPage.bind(this)

        this.totalPages = props.totalPages

        this.state = { currentPage: props.currentPage }
    }

    previousPage = () => {
        if (this.state.currentPage > 0) {
            this.previousPageHandler();
            this.setState((state) => {
                return {galleryPage: state.galleryPage - 1};
            });
        }
    }

    nextPage = () => {
        if (this.state.currentPage < this.totalPages-1) {
            this.nextPageHandler()
            this.setState((state) => {
                return {galleryPage: state.galleryPage + 1};
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentPage !== prevProps.currentPage) {
          this.setState({ currentPage: this.props.currentPage })
        }
      }

    render() {
        return (
            <div className="gallery-controls">
                <div className="stepper-arrow mirror" onClick={this.previousPage}>
                    <img src="http://localhost:9000/data/images/chevron-right.svg"></img>
                </div>
                <div className="page-number">
                    {this.state.currentPage + 1}/{this.totalPages}
                </div>
                <div className="stepper-arrow" onClick={this.nextPage}>
                    <img src="http://localhost:9000/data/images/chevron-right.svg"></img>
                </div>
            </div>
        )
    }
}

export default PageSelect