import React, { useState } from 'react';
import axios from 'axios';

function RespondQuote({ requestId }) {
    const [formData, setFormData] = useState({
        proposedPrice: '',
        workStartDate: '',
        workEndDate: '',
        note: '',
        status: 'Pending', // Accepted or Rejected
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5050/respond-quote', {
                requestId,
                ...formData,
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Failed to send response');
        }
    };

    const containerStyle = {
        maxWidth: '600px',
        margin: '50px auto',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    };

    const inputStyle = {
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        outline: 'none',
        transition: 'border-color 0.3s ease-in-out',
    };

    const textareaStyle = {
        ...inputStyle,
        resize: 'vertical',
        minHeight: '100px',
    };

    const buttonStyle = {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '12px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease-in-out',
    };

    const buttonHoverStyle = {
        backgroundColor: '#45a049',
    };

    const messageStyle = {
        textAlign: 'center',
        color: '#d9534f',
        fontWeight: 'bold',
        marginTop: '10px',
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Respond to Quote</h3>
            <form style={formStyle} onSubmit={handleSubmit}>
                <input
                    type="number"
                    name="proposedPrice"
                    placeholder="Proposed Price"
                    style={inputStyle}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="workStartDate"
                    placeholder="Start Date"
                    style={inputStyle}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="workEndDate"
                    placeholder="End Date"
                    style={inputStyle}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="note"
                    placeholder="Add a note"
                    style={textareaStyle}
                    onChange={handleChange}
                ></textarea>
                <select
                    name="status"
                    style={inputStyle}
                    onChange={handleChange}
                >
                    <option value="Accepted">Accept</option>
                    <option value="Rejected">Reject</option>
                </select>
                <button
                    type="submit"
                    style={buttonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = buttonHoverStyle.backgroundColor}
                    onMouseOut={(e) => e.target.style.backgroundColor = buttonStyle.backgroundColor}
                >
                    Send Response
                </button>
            </form>
            {message && <p style={messageStyle}>{message}</p>}
        </div>
    );
}

export default RespondQuote;
