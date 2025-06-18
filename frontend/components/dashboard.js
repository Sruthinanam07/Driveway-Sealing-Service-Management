import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ChatBox from './Chatbox'; // Ensure the path and file name match
import Bills from './Bills'; 
function Dashboard() {
  const [quotes, setQuotes] = useState([]);
  const [formData, setFormData] = useState({
    address: '',
    squareFeet: '',
    proposedPrice: '',
    note: '',
    images: [],
  });
  const [clientId, setClientId] = useState(null);
  const [message, setMessage] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [clientNotes, setClientNotes] = useState({});
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [actionType, setActionType] = useState("");
  const [activeChatRequestId, setActiveChatRequestId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");
    if (!storedClientId) {
      setMessage("You are not logged in. Redirecting to sign-in...");
      setTimeout(() => navigate('/signin'), 2000);
    } else {
      setClientId(storedClientId);
      fetchRequests(storedClientId);
    }
  }, [navigate]);

 
  const fetchRequests = async (clientId) => {
    try {
        const response = await axios.get(`http://localhost:5050/get-quotes/${clientId}`);
        console.log("Fetched Requests:", response.data.data); // Debugging
        setRequests(response.data.data);
    } catch (error) {
        console.error("Failed to fetch requests:", error.message);
        setMessage("Error fetching submitted requests.");
    }
};

  const fetchQuotes = async () => {
    try {
      const response = await axios.get(`http://localhost:5050/quotes-with-client-info`);
      setQuotes(response.data.data); // Update quotes state
    } catch (error) {
      console.error("Error fetching quotes:", error.message);
    }
};

  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      setMessage("Client ID is missing. Please log in again.");
      return;
    }

    if (formData.images.length !== 5) {
      setMessage('Please upload exactly 5 images.');
      return;
    }

    const data = new FormData();
    data.append('clientId', clientId);
    data.append('address', formData.address);
    data.append('squareFeet', formData.squareFeet);
    data.append('proposedPrice', formData.proposedPrice);
    data.append('note', formData.note);
    formData.images.forEach((file) => data.append('images', file));

    try {
      await axios.post("http://localhost:5050/request-quote", data);
      setMessage("Request submitted successfully!");
      fetchRequests(clientId);
    } catch (error) {
      setMessage("Failed to submit the request.");
    }
  };

const handleClientResponse = async (requestId) => {
  const clientNote = formData.clientNote?.trim();

  if (!clientNote) {
      alert("Client note cannot be empty.");
      return;
  }

  console.log("Sending Client Note Request:", { requestId, clientNote });

  try {
      const response = await axios.post("http://localhost:5050/client-respond", {
          requestId,
          clientNote,
      });
      alert(response.data.message);
      fetchRequests(clientId); // Refresh the requests
  } catch (error) {
      console.error("Error sending client note:", error.response?.data || error.message);
      alert("Failed to send note.");
  }
};

const handleAccept = async (requestId) => {
  try {
    console.log("Sending Work Order Creation Request:", { requestId, clientId });
    const response = await axios.post("http://localhost:5050/create-work-order", {
      requestId,
      clientId,
    });
    alert(response.data.message);
    fetchRequests(clientId); // Refresh the requests
  } catch (error) {
    console.error("Error creating work order:", error.response?.data || error.message);
    alert(`Failed to accept the proposal: ${error.response?.data?.message || error.message}`);
  }
};



const handleResubmit = async (requestId) => {
  console.log("Resubmit button clicked for Request ID:", requestId);
  const clientNote = clientNotes[requestId] || "";

  if (!clientNote.trim()) {
      alert("Please write a note before resubmitting.");
      return;
  }

  try {
      const response = await axios.post("http://localhost:5050/client-respond", {
          requestId,
          clientNote,
      });
      console.log("Resubmit response:", response.data);
      alert("Negotiation resubmitted successfully!");
      fetchRequests(clientId); // Refresh the requests
      setSelectedRequestId(null); // Close the resubmit form
  } catch (error) {
      console.error("Error resubmitting negotiation:", error.message);
      alert("Failed to resubmit the proposal.");
  }
};



  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dashboard - Request a Quote</h2>
      <div>
      <button
        onClick={() => navigate("/workorder")}
        style={styles.button}
      >
        View Work Orders
    </button>
      </div>
      

      {/* Quote Submission Form */}
      <form style={styles.form} onSubmit={handleSubmit}>
        <input style={styles.input} type="text" name="address" placeholder="Property Address" value={formData.address} onChange={handleChange} required />
        <input style={styles.input} type="number" name="squareFeet" placeholder="Square Feet" value={formData.squareFeet} onChange={handleChange} required />
        <input style={styles.input} type="number" name="proposedPrice" placeholder="Proposed Price" value={formData.proposedPrice} onChange={handleChange} required />
        <textarea style={styles.textarea} name="note" placeholder="Additional Notes" value={formData.note} onChange={handleChange} rows="4" />
        <input style={styles.fileInput} type="file" name="images" accept="image/*" multiple onChange={handleFileChange} required />
        <div style={styles.previewContainer}>
          {previewImages.map((src, index) => (
            <img key={index} src={src} alt={`Preview ${index}`} style={styles.previewImage} />
          ))}
        </div>
        <button type="submit" style={styles.button}>Submit Request</button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      {/* Display Submitted Requests */}
      <h3 style={styles.sectionTitle}>Your Submitted Requests</h3>
      <div style={styles.requestContainer}>
        {requests.length === 0 ? (
          <p>No requests submitted yet.</p>
        ) : (
          requests.map((req) => (
            <div key={req.RequestID} style={styles.requestCard}>
                <h4 style={styles.cardTitle}>Request #{req.RequestID}</h4>
                <p><strong>Address:</strong> {req.PropertyAddress}</p>
                <p><strong>Square Feet:</strong> {req.SquareFeet}</p>
                <p><strong>Your Proposed Price:</strong> ${req.ClientProposedPrice}</p>
                <p><strong>Status:</strong> {req.Status}</p>
                {req.Status === "Accepted" && !req.Contract && (
                <>
                <p><strong>David's Proposed Price:</strong> ${req.DavidProposedPrice || "N/A"}</p>
                <p><strong>Work Start Date:</strong> {req.WorkStartDate || "N/A"}</p>
                <p><strong>Work End Date:</strong> {req.WorkEndDate || "N/A"}</p>
                <p><strong>David's Note:</strong> {req.DavidNote || "N/A"}</p>
                {/* ChatBox Button */}
                <button
                onClick={() =>
                setActiveChatRequestId(
                activeChatRequestId === req.RequestID ? null : req.RequestID
                )
                }
                style={styles.button}
                >
                {activeChatRequestId === req.RequestID ? "Close Chat" : "Chat with David"}
                </button>
                {/* Render ChatBox */}
    {activeChatRequestId === req.RequestID && (
      <ChatBox requestId={req.RequestID} sender="Client" />
    )}
    {/* Bills Component */}
    <h4 style={{ marginTop: '10px' }}>Your Bill</h4>
    <Bills requestId={req.RequestID} userRole="Client" clientId={clientId} />


                {/* Accept and Resubmit Buttons */}
                <button onClick={() => handleAccept(req.RequestID)}>Accept</button>
                <button onClick={() => setSelectedRequestId(req.RequestID)}>Resubmit</button>

                {/* Resubmit Form */}
                {selectedRequestId === req.RequestID && (
                <div>
                <textarea
                placeholder="Write your new proposal note"
                value={clientNotes[req.RequestID] || ""}
                onChange={(e) =>
                setClientNotes({ ...clientNotes, [req.RequestID]: e.target.value })
                }
                rows="3"
                />
              <button onClick={() => handleResubmit(req.RequestID)}>Submit Resubmission</button>
              </div>
            )}
        </>

      )}

              {req.Status === "Rejected" && (
                <p><strong>Rejection Note:</strong> {req.ResponseNote || "No note provided"}</p>
              )}
              {req.Contract && (
              <div>
              <h4>Contract</h4>
              <pre>{req.Contract}</pre>
            </div>
            )}
              {/* Show David's Note under Negotiating status */}
{req.Status === "Negotiating" && req.DavidNote && (
  <p><strong>David's Note:</strong> {req.DavidNote}</p>
)}

{/* Show Client's Note if it exists */}
{req.ClientNote && (
  <p><strong>Your Note:</strong> {req.ClientNote}</p>
)}

{/* Resubmission form under Negotiating status */}
{req.Status === "Negotiating" && (
  <>
    <textarea
      placeholder="Write your note to David"
      value={clientNotes[req.RequestID] || ""}
      onChange={(e) =>
        setClientNotes({ ...clientNotes, [req.RequestID]: e.target.value })
      }
      rows="3"
    />
    <button onClick={() => handleClientResponse(req.RequestID)}>Send Note</button>
  </>
)}

            </div>
          ))
        )}
      </div>
    </div>
    
  );
}


const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '20px' },
  title: { textAlign: 'center', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
  textarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
  fileInput: { padding: '10px' },
  previewContainer: { display: 'flex', gap: '10px' },
  previewImage: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' },
  button: { backgroundColor: '#4CAF50', color: '#fff', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  sectionTitle: { marginTop: '20px', fontSize: '1.2rem' },
  requestContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  requestCard: { padding: '15px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  cardTitle: { marginBottom: '10px', fontWeight: 'bold', color: '#4CAF50' },
  message: { textAlign: 'center', color: 'red' },
};

export default Dashboard;
