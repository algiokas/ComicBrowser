import React, { Component } from "react";

class Modal extends Component {
    constructor(props) {
        super(props);

        if (this.props.toggleModal) {
            this.toggleModal = this.props.toggleModal.bind(this)
        } else {
            console.log("Failed to bind modal toggle function")
        }

    }

    render() {
        return (
            <dialog id={ this.props.modalId ?? "modal-component" }
                className="modal-background"
                open={this.props.displayModal}
                onClick={() => { this.toggleModal() }}>
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