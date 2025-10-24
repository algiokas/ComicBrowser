import type { NavItem } from "../../types/navItem";
import type { BaseSearchQuery } from "../../types/searchQuery";
import { NavLogo } from "./navLogo";
import NavSearch from "./navSearch";

interface NavProps {
  viewMode: string,
  showSearch: boolean,
  leftNavItems: NavItem[],
  rightNavItems: NavItem[],
  logoClick(): void,
  viewSearchResults(query?: BaseSearchQuery): void
}

const Navigation = (props: NavProps) => {

  const searchProps = {
    displayToggle: props.showSearch,
    viewSearchResults: props.viewSearchResults
  }

  return (
    <nav role="navigation">
      <div className="logo" onClick={props.logoClick}>
        <NavLogo cssClass="" />
      </div>
      <div className="nav-items">
        {
          props.leftNavItems.map((n, i) => {
            return (
              <div key={i} className="nav-item" onClick={() => n.clickHandler()} hidden={n.displayCheck ? !n.displayCheck() : false}>
                <div className={`nav-item-inner ${n.viewMode && props.viewMode === n.viewMode ? "selected" : ""}`}>
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
          props.rightNavItems.map((n, i) => {
            return (
              <div key={i} className="nav-item" onClick={() => n.clickHandler()} hidden={n.displayCheck ? n.displayCheck() : false}>
                <div className={`nav-item-inner ${n.viewMode && props.viewMode === n.viewMode ? "selected" : ""}`}>
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

export default Navigation