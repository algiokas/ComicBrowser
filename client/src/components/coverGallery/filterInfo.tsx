import React, { Component } from "react";
import ISearchQuery from "../../interfaces/searchQuery";

const baseURL = "https://nhentai.net/"

interface FilterInfoProps {
    filterQuery: ISearchQuery
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
                    this.props.filterQuery.artist ?
                    <div className="filter-info-item">
                        <span className="filter-info-label">Artist</span>
                        <a href={this.getExternalURL('artist', this.props.filterQuery.artist)} target="_blank" rel="noreferrer" className="filter-info-value clickable">{this.props.filterQuery.artist}</a>
                    </div>
                    : null
                }
                {
                    this.props.filterQuery.group ?
                    <div className="filter-info-item">
                        <span className="filter-info-label">Group</span>
                        <a href={this.getExternalURL('group', this.props.filterQuery.group)} target="_blank" rel="noreferrer" className="filter-info-value clickable">{this.props.filterQuery.group}</a>
                    </div>
                    : null
                }
                {
                    this.props.filterQuery.prefix ?
                    <div className="filter-info-item">
                        <span className="filter-info-label">Prefix</span>
                        <span className="filter-info-value clickable">{this.props.filterQuery.prefix}</span>
                    </div>
                    : null
                }
                {
                    this.props.filterQuery.tag ?
                    <div className="filter-info-item">
                        <span className="filter-info-label">Tag</span>
                        <a href={this.getExternalURL('tag', this.props.filterQuery.tag)} target="_blank" rel="noreferrer" className="filter-info-value clickable">{this.props.filterQuery.tag}</a>
                    </div>
                    : null
                }
                </div>
            </div>
        )
    }
}

export default FilterInfo