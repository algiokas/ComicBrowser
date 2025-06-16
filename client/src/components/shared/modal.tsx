import React from "react";

interface ModalProps {
    displayModal: boolean,
    modalId: string,
    toggleModal(): void
    children: React.ReactNode
}

const Modal = (props: ModalProps) => {
    return (
        <dialog id={props.modalId ?? "modal-component"}
            className="modal-background"
            open={props.displayModal}
            onClick={() => { props.toggleModal() }}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-dialog-inner">
                    {props.children}
                </div>
            </div>
        </dialog>
    )
}

export default Modal