interface EditPanelMultiSelectProps<T> {
    valueRange: T[],
    collection: T[],
    addToCollection(item: T): void,
    removeFromCollection(item: T): void,
    getDisplayString: (x: T | null) => string,
}


function EditPanelMultiSelect<T>(props: EditPanelMultiSelectProps<T>) {
    const inCollection = (item: T) => {
        const temp = props.collection.some(i => props.getDisplayString(i) === props.getDisplayString(item))
        return temp
    }

    const addOrRemoveItem = (value: T) => {
        if (inCollection(value)) 
            props.removeFromCollection(value)
        else 
            props.addToCollection(value)
    }

    const getDisplayItems = (): T[] => {
        const newCollectionItems = props.collection.filter(i => !props.valueRange.some(v => props.getDisplayString(v) === props.getDisplayString(i)))
        return [...props.valueRange, ...newCollectionItems].toSorted((a, b) => props.getDisplayString(a).localeCompare(props.getDisplayString(b)))
    }

    return (
        <div className="multiselect">
            <div className="multiselect-inner">
                {
                    getDisplayItems().map((v, i) => {
                        return (
                            <div className={"multiselect-item click-item clickable" + (inCollection(v) ? " selected" : "")} 
                                key={i} onClick={() => addOrRemoveItem(v)}>
                                {props.getDisplayString(v)}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default EditPanelMultiSelect