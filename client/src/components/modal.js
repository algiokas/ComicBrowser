import React, { Component } from "react";

class Modal extends Component {
    render() {
        return (
            <div className="modal-dialog">
                {this.props.children}
            </div>
        )
    }
}

export default Modal