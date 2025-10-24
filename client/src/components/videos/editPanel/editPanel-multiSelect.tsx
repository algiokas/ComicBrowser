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

    return (
        <div className="multiselect">
            <div className="multiselect-inner">
                {
                    props.valueRange.map((v, i) => {
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