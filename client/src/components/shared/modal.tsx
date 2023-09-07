import React, { Component } from "react";

interface ModalProps {
    displayModal: boolean,
    modalId: string,
    toggleModal(): void
    children: React.ReactNode
}

class Modal extends Component<ModalProps> {
    render() {
        return (
            <dialog id={ this.props.modalId ?? "modal-component" }
                className="modal-background"
                open={this.props.displayModal}
                onClick={() => { this.props.toggleModal() }}>
                <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-dialog-inner">
                        {this.props.children}
                    </div>
                </div>
            </dialog>
        )
    }
}

export default Modal