import React, { Component } from "react";
import { IBookSearchQuery }from "../../../interfaces/searchQuery";

const baseURL = process.env.REACT_APP_BOOK_SOURCE_URL

interface FilterInfoProps {
    filterQuery: IBookSearchQuery
}

interface FilterInfoState {}

class FilterInfo extends Component<FilterInfoProps, FilterInfoState> {
    getExternalURL = (filterType: string, filterValue: string) => {
        if (!baseURL || !filterType || !filterValue) return ''
        return baseURL + filterType + '/' + filterValue.toLowerCase().replaceAll(' ', '-').replace(/[^0-9a-z-]/gi, '')
    }

    render() {
        return(
            <div className="filter-info">
                <h2 className="filters-header">Filters</h2>
                <div className="filter-info-container">
                {
                    this.props.filterQuery.artists ?
                    this.props.filterQuery.artists.split(',').map((artist, i) => {
                        return (
                        <div className="filter-info-item" key={i}>
                            <span className="filter-info-label">Artist</span>
                            <a href={this.getExternalURL('artist', artist)} target="_blank" rel="noreferrer" className="filter-info-value clickable">{artist}</a>
                        </div>)
                    }): null
                }
                {
                    this.props.filterQuery.groups ?
                    <div className="filter-info-item">
                        <span className="filter-info-label">Group</span>
                        <a href={this.getExternalURL('group', this.props.filterQuery.groups)} target="_blank" rel="noreferrer" className="filter-info-value clickable">{this.props.filterQuery.groups}</a>
                    </div>
                    : null
                }
                {
                    this.props.filterQuery.prefix ?
                    <div className="filter-info-item">
                        <span className="filter-info-label">Prefix</span>
                        <span className="filter-info-value">{this.props.filterQuery.prefix}</span>
                    </div>
                    : null
                }
                {
                    this.props.filterQuery.tags ?
                    <div className="filter-info-item">
                        <span className="filter-info-label">Tag</span>
                        <a href={this.getExternalURL('tag', this.props.filterQuery.tags)} target="_blank" rel="noreferrer" className="filter-info-value clickable">{this.props.filterQuery.tags}</a>
                    </div>
                    : null
                }
                {
                    this.props.filterQuery.text ?
                    <div className="filter-info-item">
                        <span className="filter-info-label">Text</span>
                        <span className="filter-info-value">{this.props.filterQuery.text}</span>
                    </div>
                    : null
                }
                </div>
            </div>
        )
    }
}

export default FilterInfo