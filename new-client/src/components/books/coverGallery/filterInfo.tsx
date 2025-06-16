import type { IBookSearchQuery } from "../../../interfaces/searchQuery";

const baseURL = import.meta.env.VITE_BOOK_SOURCE_URL

interface FilterInfoProps {
    filterQuery: IBookSearchQuery
}

const FilterInfo = (props: FilterInfoProps) => {
    const getExternalURL = (filterType: string, filterValue: string) => {
        if (!baseURL || !filterType || !filterValue) return ''
        return baseURL + filterType + '/' + filterValue.toLowerCase().replaceAll(' ', '-').replace(/[^0-9a-z-]/gi, '')
    }

    return (
        <div className="filter-info">
            <h2 className="filters-header">Filters</h2>
            <div className="filter-info-container">
                {
                    props.filterQuery.artists ?
                        props.filterQuery.artists.split(',').map((artist, i) => {
                            return (
                                <div className="filter-info-item" key={i}>
                                    <span className="filter-info-label">Artist</span>
                                    <a href={getExternalURL('artist', artist)} target="_blank" rel="noreferrer" className="filter-info-value clickable">{artist}</a>
                                </div>)
                        }) : null
                }
                {
                    props.filterQuery.groups ?
                        <div className="filter-info-item">
                            <span className="filter-info-label">Group</span>
                            <a href={getExternalURL('group', props.filterQuery.groups)} target="_blank" rel="noreferrer" className="filter-info-value clickable">{props.filterQuery.groups}</a>
                        </div>
                        : null
                }
                {
                    props.filterQuery.prefix ?
                        <div className="filter-info-item">
                            <span className="filter-info-label">Prefix</span>
                            <span className="filter-info-value">{props.filterQuery.prefix}</span>
                        </div>
                        : null
                }
                {
                    props.filterQuery.tags ?
                        <div className="filter-info-item">
                            <span className="filter-info-label">Tag</span>
                            <a href={getExternalURL('tag', props.filterQuery.tags)} target="_blank" rel="noreferrer" className="filter-info-value clickable">{props.filterQuery.tags}</a>
                        </div>
                        : null
                }
                {
                    props.filterQuery.text ?
                        <div className="filter-info-item">
                            <span className="filter-info-label">Text</span>
                            <span className="filter-info-value">{props.filterQuery.text}</span>
                        </div>
                        : null
                }
            </div>
        </div>
    )
}


export default FilterInfo