import React, { Component } from "react";

interface PageSelectProps{
    totalPages: number,
    currentPage: number,
    setPage(pageNum: number): void
}

interface PageSelectState{}

class PageSelect extends Component<PageSelectProps, PageSelectState> {
    isFirstPage() {
        return this.props.currentPage <= 0;
    }

    isLastPage() {
        return this.props.currentPage >= this.props.totalPages-1
    }

    firstPage = () => {
        if (!this.isFirstPage()) {
            this.props.setPage(0)
        }
    }

    previousPage = () => {
        if (!this.isFirstPage()) {
            this.props.setPage(this.props.currentPage-1)
        }
    }

    nextPage = () => {
        if (!this.isLastPage()) {
            this.props.setPage(this.props.currentPage+1)
        }
    }

    lastPage = () => {
        if (!this.isLastPage()) {
            this.props.setPage(this.props.totalPages-1)
        }
    }

    setPageNumber(e: Event) {
        let pageNum = (e.target as HTMLInputElement).value
        if (pageNum < 1) {
            this.props.setPage(0)
        } else if (pageNum > this.props.totalPages) {
            this.props.setPage(this.props.totalPages-1)
        } else {
            this.props.setPage(pageNum-1)
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
                        value={this.props.currentPage+1}
                        onChange={this.setPageNumber}
                        className="page-select-number"
                        disabled={this.props.totalPages === 1 ? true : false}
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