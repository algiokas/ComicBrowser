import React, { Component } from "react";

class FilterInfo extends Component {
    render() {
        return(
            <div className="filter-info">
                <h2 className="filters-header">Filters</h2>
                <div className="filter-info-container">
                {
                    this.props.filterQuery.artist ?
                    <div className="filter-info-item">
                        <span>Artist:</span>
                        <span class="info-item clickable">{this.props.filterQuery.artist}</span>
                    </div>
                    : null
                }
                {
                    this.props.filterQuery.group ?
                    <div className="filter-info-item">
                        <span>Group:</span>
                        <span class="info-item clickable">{this.props.filterQuery.group}</span>
                    </div>
                    : null
                }
                {
                    this.props.filterQuery.prefix ?
                    <div className="filter-info-item">
                        <span>Prefix:</span>
                        <span class="info-item clickable">{this.props.filterQuery.prefix}</span>
                    </div>
                    : null
                }
                {
                    this.props.filterQuery.tag ?
                    <div className="filter-info-item">
                        <span>Tag:</span>
                        <span class="info-item clickable">{this.props.filterQuery.tag}</span>
                    </div>
                    : null
                }
                </div>
            </div>
        )
    }
}

export default FilterInfo