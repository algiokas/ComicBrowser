import type { EditField } from "../../../util/enums";

interface EditPanelDropdownProps<T> {
    editField: EditField,
    valueRange: T[],
    collection: T[],
    getDisplayString: (x: T | null) => string,
    handleDropdownChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
}

function EditPanelDropdown<T>(props: EditPanelDropdownProps<T>): React.ReactNode {
    return <select className="edit-panel-row-dropdown" onChange={props.handleDropdownChange} id={`${props.editField.toString().toLowerCase()}-dropdown`}>
        <option value=''>{`-- Select ${props.editField} --`}</option>
        {props.valueRange.map((v, i) => {
            if (!props.collection.some(item => props.getDisplayString(item) === props.getDisplayString(v))) {
                return (<option key={i} value={props.getDisplayString(v)}>{props.getDisplayString(v)}</option>);
            }
        })}
    </select>;
}

export default EditPanelDropdown