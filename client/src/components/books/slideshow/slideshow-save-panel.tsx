import React, { Component } from "react";
import ISlideshow from "../../../interfaces/slideshow";
import { GetCoverPath } from "../../../util/helpers";
import GalleryItem from "../coverGallery/galleryItem";
import coverIcon from "../../../img/svg/book-half.svg"

interface SavePanelProps {
    currentSlideshow: ISlideshow,
    toggleDisplay(): void,
    createCollection(collectionName: string, coverBookId: number): void
}

interface SavePanelState {
    collectionName: string,
    selectedCoverIndex: number
}

class SavePanel extends Component<SavePanelProps, SavePanelState> {
    constructor(props: SavePanelProps) {
        super(props)

        this.state = {
            collectionName: this.props.currentSlideshow.id !== null ? this.props.currentSlideshow.name : "",
            selectedCoverIndex: 0
        }
    }

    handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ collectionName: e.target.value })
    }

    handleTextInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            this.saveCollection()
            this.props.toggleDisplay()
        }
    }

    selectCover = (index: number) => {
        this.setState({ selectedCoverIndex: index })
    }

    saveCollection = () => {
        const coverBook = this.props.currentSlideshow.books[this.state.selectedCoverIndex]
        this.props.createCollection(this.state.collectionName, coverBook.id)
    }

    render(): React.ReactNode {
        return (
            <div className="savepanel">
                <h3>{this.props.currentSlideshow.id === null ? "Create New Collection" : "Update Collection"}</h3>
                <div className="savepanel-inner">
                    <div className="savepanel-row">
                        <span>Collection Name: </span>
                        <input type="text"
                            value={this.state.collectionName}
                            onChange={this.handleTextInputChange}
                            onKeyDown={this.handleTextInputKey}></input>
                    </div>
                    <div className="savepanel-covers">
                        {
                            this.props.currentSlideshow.books.map((book, index) => {
                                return <GalleryItem
                                    key={index}
                                    index={index}
                                    book={book}
                                    coverUrl={GetCoverPath(book)}
                                    bodyClickHandler={() => this.selectCover(index)}
                                    subtitle=""
                                    overlayIcon={index === this.state.selectedCoverIndex ? coverIcon : undefined} />
                            })
                        }
                    </div>
                    <div className="savepanel-controls">
                        <button type="button" onClick={() => this.saveCollection()}>Save</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default SavePanel