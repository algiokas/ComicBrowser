import React, { Component } from "react";
import ISlideshow from "../../interfaces/slideshow";

interface SavePanelProps {
    currentSlideshow: ISlideshow,
    toggleDisplay(): void
}

interface SavePanelState {
    slideshowName: string
}

class SavePanel extends Component<SavePanelProps, SavePanelState> {
    constructor(props: SavePanelProps) {
        super(props)

        this.state = {
            slideshowName: this.props.currentSlideshow.id !== null ? this.props.currentSlideshow.name : ""
        }
    }

    handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ slideshowName: e.target.value })
    }

    handleTextInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            this.props.toggleDisplay()
        }
    }

    render(): React.ReactNode {
        return (
            <div className="savepanel">
                <h3>{this.props.currentSlideshow.id === null ? "Save Slideshow" : "Update Slideshow"}</h3>
                <div className="savepanel-inner">
                    <div className="savePanel-row">
                        <input type="text" 
                        value={this.state.slideshowName} 
                        onChange={this.handleTextInputChange}
                        onKeyDown={this.handleTextInputKey}></input>
                    </div>
                </div>
            </div>
        )
    }
}

export default SavePanel