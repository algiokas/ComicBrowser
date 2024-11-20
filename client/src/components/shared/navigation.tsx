import { Component } from "react";
import { NavLogo } from "./navLogo";
import INavItem from "../../interfaces/navItem";

interface NavProps {
  viewMode: string,
  leftNavItems: INavItem[],
  rightNavItems: INavItem[],
  logoClick(): void
}

interface NavState {}

class Navigation extends Component<NavProps, NavState>  {
  render() {
    return (
      <nav role="navigation">
        <div className="logo" onClick={this.props.logoClick}>
          <NavLogo cssClass=""/>
        </div>
        <div className="nav-items">
          {
            this.props.leftNavItems.map((n, i) => {
              return (
                <div key={i} className="nav-item" onClick={() => n.clickHandler()}>
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
          {
            this.props.rightNavItems.map((n, i) => {
              return (
                <div key={i} className="nav-item" onClick={() => n.clickHandler()}>
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