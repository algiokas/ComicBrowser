import React, { useState } from "react";
import searchIcon from "../../img/svg/search.svg";
import type { ISearchQuery } from "../../interfaces/searchQuery";

interface NavSearchProps {
    displayToggle: boolean,
    viewSearchResults(query?: ISearchQuery): void,
}

const NavSearch = (props: NavSearchProps) => {
    const [queryValue, setQueryValue] = useState<string>('')
    const inputRef = React.createRef<HTMLInputElement>()

    const textSearch = () => {
        if (queryValue) {
            const query: ISearchQuery = {
                text: queryValue
            }
            setQueryValue('')
            inputRef.current?.blur()
            props.viewSearchResults(query)
        }
    }

    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQueryValue(e.target.value)
    }

    const handleTextInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            textSearch()
        }
    }

    return (
        <div className="nav-search-container" hidden={!props.displayToggle}>
            <input type='text'
                ref={inputRef}
                value={queryValue}
                onChange={handleTextInputChange}
                onKeyDown={handleTextInputKey}
            ></input>
            <button type='button' onClick={textSearch}>
                <img src={searchIcon.toString()} className={`svg-icon`} alt="search"></img>
            </button>
        </div>
    )
}

export default NavSearch