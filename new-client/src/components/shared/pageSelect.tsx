import React from "react";
import DoubleStepperImg from "../../img/svg/chevron-double-right.svg";
import SingleStepperImg from "../../img/svg/chevron-right.svg";

interface PageSelectProps {
    totalPages: number,
    currentPage: number,
    setPage(pageNum: number): void
}

const PageSelect = (props: PageSelectProps) => {
    const isFirstPage = () => {
        return props.currentPage <= 0;
    }

    const isLastPage = () => {
        return props.currentPage >= props.totalPages - 1
    }

    const firstPage = () => {
        if (!isFirstPage()) {
            props.setPage(0)
        }
    }

    const previousPage = () => {
        if (!isFirstPage()) {
            props.setPage(props.currentPage - 1)
        }
    }

    const nextPage = () => {
        if (!isLastPage()) {
            props.setPage(props.currentPage + 1)
        }
    }

    const lastPage = () => {
        if (!isLastPage()) {
            props.setPage(props.totalPages - 1)
        }
    }

    const setPageNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        let pageNum = parseInt(e.target.value)
        if (Number.isNaN(pageNum)) return
        if (pageNum < 1) {
            props.setPage(0)
        } else if (pageNum > props.totalPages) {
            props.setPage(props.totalPages - 1)
        } else {
            props.setPage(pageNum - 1)
        }
    }

    return (
        <div className="page-select">
            <div className="stepper-arrow mirror" onClick={firstPage}>
                <img className={`svg-icon ${isFirstPage() ? 'hidden' : ''}`} src={DoubleStepperImg.toString()} alt="stepper left"></img>
            </div>
            <div className="stepper-arrow mirror" onClick={previousPage}>
                <img className={`svg-icon ${isFirstPage() ? 'hidden' : ''}`} src={SingleStepperImg.toString()} alt="stepper left"></img>
            </div>
            <div className="page-number">
                <input
                    type='number'
                    value={props.currentPage + 1}
                    onChange={setPageNumber}
                    className="page-select-number"
                    disabled={props.totalPages === 1 ? true : false}
                />
                &nbsp;/&nbsp;
                <div>{props.totalPages}</div>
            </div>
            <div className="stepper-arrow" onClick={nextPage}>
                <img className={`svg-icon ${isLastPage() ? 'hidden' : ''}`} src={SingleStepperImg.toString()} alt="stepper right"></img>
            </div>
            <div className="stepper-arrow" onClick={lastPage}>
                <img className={`svg-icon ${isLastPage() ? 'hidden' : ''}`} src={DoubleStepperImg.toString()} alt="stepper right"></img>
            </div>
        </div>
    )
}

export default PageSelect