import React, { Component } from "react";

interface GalleryItemOverlayProps {
    icon?: React.Component<SVGElement>
    iconAltText?: string
}

interface GalleryItemOverlayState {}

class GalleryItemOverlay extends Component<GalleryItemOverlayProps, GalleryItemOverlayState> {
  render() {
    return (
        <div className="gallery-overlay">
            {
                this.props.icon ?
                <img className="svg-icon" src={this.props.icon.toString()} alt="remove from favorites"></img>
                : null
            }
        </div>
    )
  }
}

export default GalleryItemOverlay