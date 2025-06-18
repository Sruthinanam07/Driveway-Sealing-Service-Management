import React, { useEffect, useState } from "react";
import axios from "axios";

function Bills({ userRole, requestId, clientId }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true); // Fix: setLoading defined
  const [error, setError] = useState(null); // Fix: setError defined
  const [clientNote, setClientNote] = useState("");
  const [davidNote, setDavidNote] = useState("");
  const [discount, setDiscount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [creditCardNumber, setCreditCardNumber] = useState(""); // New state for credit card number
  const [expiryDate, setExpiryDate] = useState(""); // New state for expiry date
  const [cvv, setCvv] = useState(""); // New state for CVV
  useEffect(() => {
    const fetchBillDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:5050/bills/${requestId}`);
            if (response.data.success) {
                setBill(response.data.data);
            } else {
                setError(response.data.message || "Failed to load bill details.");
            }
        } catch (error) {
            console.error("Error fetching bill details:", error.message);
            setError("Failed to load bill details.");
        } finally {
            setLoading(false);
        }
    };

    fetchBillDetails();
}, [requestId]);

  if (loading) return <p>Loading bill details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

const handleGenerateBill = async () => {
  if (!amount.trim()) {
      alert("Please enter an amount.");
      return;
  }
  try {
      const response = await axios.post("http://localhost:5050/generate-bill", {
          requestId,
          clientId,
          amount: parseFloat(amount),
          discount: parseFloat(discount) || 0,
          note,
      });
      alert(`Bill generated successfully! Bill ID: ${response.data.billId}`);
      console.log("Response Data:", response.data);
  } catch (error) {
      console.error("Error generating bill:", error.message);
      alert("Failed to generate the bill.");
  }
};


  // Fetch bill details
  const fetchBill = async () => {
    console.log("Fetching bill for RequestID:", requestId);
    try {
      const response = await axios.get(`http://localhost:5050/get-bill/${requestId}`);
      console.log("Bill Response:", response.data);
      setBill(response.data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching bill:", error.response?.data?.message || error.message);
      setError("Failed to load bill details.");
    } finally {
      setLoading(false);
    }
  };
  

  // Client pays the bill
  const handlePayBill = async () => {
    if (!creditCardNumber || !expiryDate || !cvv) {
      alert("Please enter all credit card details.");
      return;
    }
    try {
      await axios.post("http://localhost:5050/respond-bill", { 
      billId: bill.BillID ,
      status: "Paid",
      // paymentDetails: { method: "CreditCard", timestamp: new Date() }, // Example details
      paymentDetails: {
        creditCardNumber,
        expiryDate,
        cvv,
      },
    });
      alert("Bill paid successfully!");
      fetchBill();
    } catch (error) {
      console.error("Error paying bill:", error.message);
      alert("Failed to pay the bill.");
    }
  };

  // Client disputes the bill
  const handleDisputeBill = async () => {
    if (!clientNote.trim()) {
      alert("Please enter a note explaining your concerns.");
      return;
    }
    try {
      await axios.post("http://localhost:5050/respond-bill", {
        billId: bill.BillID,
        status: "Disputed",
        clientNote: clientNote,
      });
      alert("Bill disputed successfully!");
      fetchBill();
    } catch (error) {
      console.error("Error disputing bill:", error.message);
      alert("Failed to dispute the bill.");
    }
  };

  // David resubmits the bill
  const handleResubmitBill = async () => {
    if (!davidNote.trim()) {
      alert("Please add a note before resubmitting.");
      return;
    }
    try {
      await axios.post("http://localhost:5050/resubmit-bill", {
        billId: bill.BillID,
        davidNote: davidNote,
        discount: parseFloat(discount) || 0,
      });
      alert("Bill resubmitted successfully!");
      fetchBill();
    } catch (error) {
      console.error("Error resubmitting bill:", error.message);
      alert("Failed to resubmit the bill.");
    }
  };

  
  return (
    <div style={styles.container}>
      <h2>Bill Details</h2>
      {/* David's Bill Generation Form */}
    {userRole === "David" && !bill && (
      <>
        <h3>Generate Bill</h3>
        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Enter Discount"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          style={styles.input}
        />
        <textarea
          placeholder="Enter a note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={styles.textarea}
        />
        <button style={styles.buttonPay} onClick={handleGenerateBill}>
          Generate Bill
        </button>
      </>
    )}
  {/* Existing Bill Details */}
      {bill ? (
        <div style={styles.card}>
          <p><strong>Bill ID:</strong> {bill.BillID}</p>
          <p><strong>Amount:</strong> ${bill.Amount}</p>
          <p><strong>Discount:</strong> ${bill.Discount}</p>
          <p><strong>Final Amount:</strong> ${bill.FinalAmount}</p>
          <p><strong>Status:</strong> {bill.Status}</p>
          {bill.ClientNote && <p><strong>Client's Note:</strong> {bill.ClientNote}</p>}
          {bill.DavidNote && <p><strong>David's Note:</strong> {bill.DavidNote}</p>}

          {/* Client Actions */}
          {userRole === "Client" && bill.Status === "Pending" && (
            <>
            <input
      style={styles.input}
      type="text"
      placeholder="Credit Card Number"
      value={creditCardNumber}
      onChange={(e) => setCreditCardNumber(e.target.value)}
    />
    <input
      style={styles.input}
      type="text"
      placeholder="Expiry Date (MM/YY)"
      value={expiryDate}
      onChange={(e) => setExpiryDate(e.target.value)}
    />
    <input
      style={styles.input}
      type="password"
      placeholder="CVV"
      value={cvv}
      onChange={(e) => setCvv(e.target.value)}
    />
              <button style={styles.buttonPay} onClick={handlePayBill}>
                Pay Bill
              </button>
              <textarea
                style={styles.textarea}
                placeholder="Explain your concerns"
                value={clientNote}
                onChange={(e) => setClientNote(e.target.value)}
              />
              <button style={styles.buttonDispute} onClick={handleDisputeBill}>
                Dispute Bill
              </button>
            </>
          )}

          {/* David's Actions */}
          {userRole === "David" && bill?.Status === "Disputed"&& (
            <>
              <textarea
                style={styles.textarea}
                placeholder="Enter your note for resubmission"
                value={davidNote}
                onChange={(e) => setDavidNote(e.target.value)}
              />
              <input
                style={styles.input}
                type="number"
                placeholder="Enter discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <button style={styles.buttonResubmit} onClick={handleResubmitBill}>
                Resubmit Bill
              </button>
            </>
          )}
        </div>
      ) : (
        <p>Loading bill details...</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  card: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "white",
  },
  buttonPay: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
  buttonDispute: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
  buttonResubmit: {
    backgroundColor: "#ff9800",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    resize: "vertical",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginTop: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
};

export default Bills;
