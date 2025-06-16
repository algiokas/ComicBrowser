import React from "react";

interface GalleryItemOverlayProps {
  icon?: React.Component<SVGElement>
  iconAltText?: string
}

const GalleryItemOverlay = (props: GalleryItemOverlayProps) => {
  return (
    <div className="gallery-overlay">
      {
        props.icon ?
          <img className="svg-icon" src={props.icon.toString()} alt="remove from favorites"></img>
          : null
      }
    </div>
  )
}

export default GalleryItemOverlay