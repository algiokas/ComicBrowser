import { Component } from "react";
import { NavLogo } from "./navLogo";
import INavItem from "../../interfaces/navItem";
import NavSearch from "./navSearch";
import { IBookSearchQuery } from "../../interfaces/searchQuery";

interface NavProps {
  viewMode: string,
  showSearch: boolean,
  leftNavItems: INavItem[],
  rightNavItems: INavItem[],
  logoClick(): void,
  viewSearchResults(query?: IBookSearchQuery): void
}

interface NavState {}

class Navigation extends Component<NavProps, NavState>  {
  render() {
    const searchProps = {
      displayToggle: this.props.showSearch,
      viewSearchResults: this.props.viewSearchResults
    }

    return (
      <nav role="navigation">
        <div className="logo" onClick={this.props.logoClick}>
          <NavLogo cssClass=""/>
        </div>
        <div className="nav-items">
          {
            this.props.leftNavItems.map((n, i) => {
              return (
                <div key={i} className="nav-item" onClick={() => n.clickHandler()} hidden={n.displayCheck ? !n.displayCheck() : false}>
                  <div className={`nav-item-inner ${n.viewMode && this.props.viewMode === n.viewMode ? "selected" : ""}`}>
                    {n.text}
                    {n.counter ? <span className="slideshow-count">{n.counter}</span> : null}
                  </div> 
                </div>
              )
            })
          }
        </div>
        <div className="nav-items right">
          <NavSearch {...searchProps}></NavSearch>
          {
            this.props.rightNavItems.map((n, i) => {
              return (
                <div key={i} className="nav-item" onClick={() => n.clickHandler()} hidden={n.displayCheck ? n.displayCheck() : false}>
                  <div className={`nav-item-inner ${n.viewMode && this.props.viewMode === n.viewMode ? "selected" : ""}`}>
                    {n.text}
                    {n.counter ? <span className="slideshow-count">{n.counter}</span> : null}
                  </div>
                </div>
              )
            })
          }
        </div>
      </nav>
    )
  }
}

export default Navigation