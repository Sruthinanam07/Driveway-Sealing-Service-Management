import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatBox from './Chatbox'; // Ensure the path and file name match
import Bills from './Bills';
import { useNavigate } from 'react-router-dom';
function DavidSmithDashboard() {
    const [quotes, setQuotes] = useState([]);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [actionType, setActionType] = useState("");
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        requestId: "",
        proposedPrice: "",
        workStartDate: "",
        workEndDate: "",
        note: "",
        status: "",
    });
    const [activeChatRequestId, setActiveChatRequestId] = useState(null);
    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async (status = "") => {
        try {
            const response = await axios.get(`http://localhost:5050/quotes-with-client-info?status=${status}`);
            setQuotes(response.data.data);
        } catch (error) {
            console.error("Error fetching quotes:", error.message);
        }
    };

    const handleAction = (quote, action) => {
        setSelectedQuote(quote);
        setActionType(action);
    
        setFormData({
            requestId: quote.RequestID,
            proposedPrice: "",
            workStartDate: "",
            workEndDate: "",
            note: action === "Negotiating" ? quote.ClientNote || "" : "", // Use ClientNote
            status: action === "Accept" ? "Accepted" : action === "Reject" ? "Rejected" : "Negotiating",
        });
    };
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validation: Client note is only required for "Negotiating"
        if (actionType === "Negotiating" && !formData.note?.trim()) {
            alert("Client note cannot be empty.");
            return;
        }
    
        try {
            console.log("Submitting Form Data:", formData);
            await axios.post("http://localhost:5050/respond-quote", formData);
            alert(`Quote ${actionType.toLowerCase()} successfully.`);
            fetchQuotes(); // Refresh the list
            setSelectedQuote(null);
            setActionType("");
        } catch (error) {
            console.error("Error submitting response:", error.message);
            alert("Failed to submit response.");
        }
    };
    
    return (
        <div style={styles.container}>
            <h2>David Smith - Manage Quotes</h2>
            <div>
            <button
                onClick={() => navigate("/workorder")}
                style={styles.button}
            >
                View Work Orders
            </button>
            </div>
            <div style={styles.filterButtons}>
                <button style={styles.button} onClick={() => fetchQuotes("")}>All</button>
                <button style={styles.button} onClick={() => fetchQuotes("Pending")}>Pending</button>
                <button style={styles.button} onClick={() => fetchQuotes("Accepted")}>Accepted</button>
                <button style={styles.button} onClick={() => fetchQuotes("Rejected")}>Rejected</button>
                <button style={styles.button} onClick={() => fetchQuotes("Negotiating")}>Negotiating</button>
            </div>

            <div>
                {quotes.map((quote) => (
                    <div key={quote.RequestID} style={styles.quoteCard}>
                        <p><strong>Client:</strong> {quote.FirstName} {quote.LastName}</p>
                        <p><strong>Address:</strong> {quote.PropertyAddress}</p>
                        <p><strong>Square Feet:</strong> {quote.SquareFeet}</p>
                        <p><strong>Proposed Price:</strong> ${quote.ProposedPrice}</p>
                        <p><strong>Status:</strong> {quote.Status || "Pending"}</p>
                        {/* Images Section */}
                        <div style={styles.imageContainer}>
                        {[quote.Image1, quote.Image2, quote.Image3, quote.Image4, quote.Image5].map((img, index) => (
                         img && (
                        <img
                    key={index}
                    src={`http://localhost:5050/${img}`}
                    alt={`Driveway ${index + 1}`}
                    style={styles.image}
                />
            )
        ))}
    </div>
<div style={styles.conversationSection}>
    {quote.ClientNote && (
        <p style={styles.clientNote}>
            <strong>Client's Note:</strong> {quote.ClientNote}
        </p>
    )}
    {quote.DavidNote && (
        <p style={styles.davidNote}>
            <strong>David's Note:</strong> {quote.DavidNote}
        </p>
    )}
</div>
{/* Chat Button */}
<button
            style={styles.actionButton}
            onClick={() =>
                setActiveChatRequestId(
                    activeChatRequestId === quote.RequestID ? null : quote.RequestID
                )
            }
        >
            {activeChatRequestId === quote.RequestID ? "Close Chat" : "Chat with Client"}
        </button>

        {/* ChatBox Component */}
        {activeChatRequestId === quote.RequestID && (
            <ChatBox requestId={quote.RequestID} sender="David" />
        )}
         <h4 style={{ marginTop: '10px' }}>Your Bill</h4>
        <Bills userRole="David" requestId={quote.RequestID} />


                        {quote.Status === "Pending" || quote.Status === "Negotiating" ? (
                            <>
                                <button style={styles.actionButton} onClick={() => handleAction(quote, "Accept")}>Accept</button>
                                <button style={{ ...styles.actionButton, backgroundColor: "#f44336" }} onClick={() => handleAction(quote, "Reject")}>Reject</button>
                                <button style={{ ...styles.actionButton, backgroundColor: "#ff9800" }} onClick={() => handleAction(quote, "Negotiate")}>Negotiate</button>
                            </>
                        ) : null}
                    </div>
                ))}
            </div>

            {selectedQuote && (
                <form style={styles.form} onSubmit={handleSubmit}>
                    <h3>
                        {actionType === "Accept" ? "Accept Quote" : actionType === "Reject" ? "Reject Quote" : "Negotiate Quote"}
                    </h3>
                    {actionType === "Accept" && (
                        <>
                            <input style={styles.input} type="number" name="proposedPrice" placeholder="Proposed Price" onChange={handleInputChange} required />
                            <input style={styles.input} type="date" name="workStartDate" placeholder="Start Date" onChange={handleInputChange} required />
                            <input style={styles.input} type="date" name="workEndDate" placeholder="End Date" onChange={handleInputChange} required />
                        </>
                    )}
                    {actionType === "Reject" && (
                        <textarea style={styles.textarea} name="note" placeholder="Rejection Note" onChange={handleInputChange} required />
                    )}
                    {actionType === "Negotiating" && (
                        <>
                            <input style={styles.input} type="number" name="proposedPrice" placeholder="Proposed Price" onChange={handleInputChange} required />
                            <textarea style={styles.textarea} name="note" placeholder="Negotiation Note" onChange={handleInputChange} required />
                        </>
                    )}
                    <button style={styles.submitButton} type="submit">Submit</button>
                </form>
            )}
        </div>
    );
}

const styles = {
    imageContainer: {
        display: "flex",
        gap: "10px",
        marginTop: "10px",
        flexWrap: "wrap",
    },
    image: {
        width: "150px",          // Set a fixed width for all images
        height: "150px",         // Set a fixed height for all images
        objectFit: "cover",      // Ensures the image maintains aspect ratio and fills the box
        borderRadius: "5px",
        border: "1px solid #ddd",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Optional shadow for better visuals
    },
    container: {
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
    },
    filterButtons: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
    },
    button: {
        padding: "10px 15px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
    quoteCard: {
        border: "1px solid #ddd",
        padding: "15px",
        borderRadius: "5px",
        marginBottom: "10px",
        backgroundColor: "white",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
    actionButton: {
        marginRight: "10px",
        padding: "8px 12px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    form: {
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid #ccc",
        padding: "15px",
        borderRadius: "5px",
        backgroundColor: "white",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
    input: {
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
    },
    textarea: {
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
    },
    submitButton: {
        padding: "10px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
};

export default DavidSmithDashboard;
