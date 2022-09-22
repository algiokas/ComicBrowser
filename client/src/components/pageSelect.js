import React, { Component } from "react";

class PageSelect extends Component {
    constructor(props) {
        super(props)

        this.setCurrentPage = props.setPage.bind(this)

        this.state = { currentPage: props.currentPage }
    }

    isFirstPage() {
        return this.state.currentPage <= 0;
    }

    isLastPage() {
        return this.state.currentPage >= this.props.totalPages-1
    }

    firstPage = () => {
        if (!this.isFirstPage()) {
            this.setCurrentPage(0)
        }
    }

    previousPage = () => {
        if (!this.isFirstPage()) {
            this.setCurrentPage(this.state.currentPage-1)
        }
    }

    nextPage = () => {
        if (!this.isLastPage()) {
            this.setCurrentPage(this.state.currentPage+1)
        }
    }

    lastPage = () => {
        if (!this.isLastPage()) {
            this.setCurrentPage(this.props.totalPages-1)
        }
    }

    setPageNumber = (e) => {
        let pageNum = e.target.value
        console.log(pageNum)
        if (pageNum < 1) {
            this.setCurrentPage(0)
        } else if (pageNum > this.props.totalPages) {
            this.setCurrentPage(this.props.totalPages-1)
        } else {
            this.setCurrentPage(pageNum-1)
        }
    }


    componentDidUpdate(prevProps) {
        if (this.props.currentPage !== prevProps.currentPage) {
          this.setState({ currentPage: this.props.currentPage })
        }
      }

    render() {
        return (
            <div className="page-select">
                <div className="stepper-arrow mirror" onClick={this.firstPage}>
                    <img className={`svg-icon ${this.isFirstPage() ? 'hidden' : ''}`} src="http://localhost:9000/data/images/chevron-double-right.svg" alt="stepper left"></img>
                </div>
                <div className="stepper-arrow mirror" onClick={this.previousPage}>
                    <img className={`svg-icon ${this.isFirstPage() ? 'hidden' : ''}`} src="http://localhost:9000/data/images/chevron-right.svg" alt="stepper left"></img>
                </div>
                <div className="page-number">
                    <input
                        type='number'
                        value={this.state.currentPage+1}
                        onChange={this.setPageNumber}
                        className="page-select-number"
                    />
                    &nbsp;/&nbsp;
                    <div>{this.props.totalPages}</div>
                </div>
                <div className="stepper-arrow" onClick={this.nextPage}>
                    <img className={`svg-icon ${this.isLastPage() ? 'hidden' : ''}`} src="http://localhost:9000/data/images/chevron-right.svg" alt="stepper right"></img>
                </div>
                <div className="stepper-arrow" onClick={this.lastPage}>
                    <img className={`svg-icon ${this.isLastPage() ? 'hidden' : ''}`} src="http://localhost:9000/data/images/chevron-double-right.svg" alt="stepper right"></img>
                </div>
            </div>
        )
    }
}

export default PageSelect