import React from 'react';
import './Modal.css'; // Tạo file CSS cho modal nếu cần

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Xóa nút close-button */}
                {/* <button className="close-button" onClick={onClose}>X</button> */}
                {children}
            </div>
        </div>
    );
};

export default Modal;
