import React, { useState } from "react";
import coverIcon from "../../../img/svg/book-half.svg";
import ISlideshow from "../../../interfaces/slideshow";
import { GetCoverPath } from "../../../util/helpers";
import GalleryItem from "../coverGallery/galleryItem";

interface SavePanelProps {
    currentSlideshow: ISlideshow,
    toggleDisplay(): void,
    createCollection(collectionName: string, coverBookId: number): void
}

const SavePanel = (props: SavePanelProps) => {
    const [ collectionName, setCollectionName ] = useState<string>(props.currentSlideshow.id !== null ? props.currentSlideshow.name : "")
    const [ selectedCoverIndex, setSelectedCoverIndex ] = useState<number>(0)

    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionName(e.target.value)
    }

    const handleTextInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            saveCollection()
            props.toggleDisplay()
        }
    }

    const saveCollection = () => {
        const coverBook = props.currentSlideshow.books[selectedCoverIndex]
        props.createCollection(collectionName, coverBook.id)
    }

    return (
            <div className="savepanel">
                <h3>{props.currentSlideshow.id === null ? "Create New Collection" : "Update Collection"}</h3>
                <div className="savepanel-inner">
                    <div className="savepanel-row">
                        <span>Collection Name: </span>
                        <input type="text"
                            value={collectionName}
                            onChange={handleTextInputChange}
                            onKeyDown={handleTextInputKey}></input>
                    </div>
                    <div className="savepanel-covers">
                        {
                            props.currentSlideshow.books.map((book, index) => {
                                return <GalleryItem
                                    key={index}
                                    index={index}
                                    book={book}
                                    coverUrl={GetCoverPath(book)}
                                    bodyClickHandler={() => setSelectedCoverIndex(index)}
                                    subtitle=""
                                    overlayIcon={index === selectedCoverIndex ? coverIcon : undefined} />
                            })
                        }
                    </div>
                    <div className="savepanel-controls">
                        <button type="button" onClick={() => saveCollection()}>Save</button>
                    </div>
                </div>
            </div>
        )
}

export default SavePanel