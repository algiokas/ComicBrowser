import React, { Component } from "react";
import { IBookSearchQuery } from "../../interfaces/searchQuery";
import searchIcon from "../../img/search.svg"

export interface NavSearchProps {
    displayToggle: boolean,
    viewSearchResults(query?: IBookSearchQuery): void,
}

export interface NavSearchState {
    queryValue: string
}

class NavSearch extends Component<NavSearchProps, NavSearchState> {
    constructor(props: NavSearchProps) {
        super(props)

        this.state = {
            queryValue: ''
        }
    }

    inputRef = React.createRef<HTMLInputElement>()

    textSearch = () => {
        if (this.state.queryValue) {
            const query: IBookSearchQuery = {
                text: this.state.queryValue
            }
            this.setState({ queryValue: '' })
            this.inputRef.current?.blur()
            this.props.viewSearchResults(query)
        }
    }

    handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ queryValue: e.target.value })
    }

    handleTextInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            this.textSearch()
        }
    }

    render() {
        return (
            <div className="nav-search-container" hidden={!this.props.displayToggle}>
                <input type='text'
                    ref={this.inputRef}
                    value={this.state.queryValue}
                    onChange={this.handleTextInputChange}
                    onKeyDown={this.handleTextInputKey}
                ></input>
                <button type='button' onClick={this.textSearch}>                    
                    <img src={searchIcon.toString()} className={`svg-icon`} alt="search"></img>
                </button>
            </div>
        )
    }
}

export default NavSearch