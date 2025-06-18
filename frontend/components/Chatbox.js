import React, { useEffect, useState } from "react";
import axios from "axios";

function ChatBox({ requestId, sender }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll for new messages every 3s
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`http://localhost:5050/get-messages/${requestId}`);
            setMessages(response.data.data);
        } catch (error) {
            console.error("Error fetching messages:", error.message);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            await axios.post("http://localhost:5050/send-message", {
                requestId,
                sender,
                message: newMessage,
            });
            setNewMessage("");
            fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error.message);
        }
    };

    return (
        <div style={styles.container}>
            <h3>Chat</h3>
            <div style={styles.chatBox}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            textAlign: msg.Sender === sender ? "right" : "left",
                            margin: "10px 0",
                        }}
                    >
                        <strong>{msg.Sender}:</strong> {msg.Message}
                        <p style={styles.time}>{new Date(msg.SentAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    style={styles.input}
                />
                <button onClick={sendMessage} style={styles.button}>Send</button>
            </div>
        </div>
    );
}

const styles = {
    container: { border: "1px solid #ccc", padding: "10px", borderRadius: "5px", maxWidth: "500px" },
    chatBox: { maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px" },
    inputContainer: { display: "flex", marginTop: "10px" },
    input: { flexGrow: 1, padding: "8px", border: "1px solid #ddd", borderRadius: "3px" },
    button: { marginLeft: "10px", padding: "8px 15px", background: "#4CAF50", color: "white", border: "none", cursor: "pointer" },
    time: { fontSize: "0.8em", color: "#666" },
};

export default ChatBox;
