import React, { useEffect, useState } from "react";
import axios from "axios";

function WorkOrders() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5050/work-orders");
      setWorkOrders(response.data.data);
    } catch (error) {
      console.error("Error fetching work orders:", error.message);
      alert("Failed to fetch work orders.");
    }
    finally {
      setLoading(false);
    }
  };
  // Function to Generate Bill
  const generateBill = async (requestId, clientId) => {
    const amount = prompt("Enter the bill amount:");
    const note = prompt("Add a note for the client (optional):");

    if (!amount) {
      alert("Bill amount is required!");
      return;
    }

    try {
      await axios.post("http://localhost:5050/generate-bill", {
        requestId,
        clientId,
        amount,
        note,
      });
      alert("Bill generated successfully!");
    } catch (error) {
      console.error("Error generating bill:", error.message);
      alert("Failed to generate bill.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Work Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) :
      workOrders.length === 0 ? (
        <p>No work orders found.</p>
      ) : (
        workOrders.map((order) => (
          <div key={order.RequestID} style={styles.card}>
            <p><strong>Request ID:</strong> {order.RequestID}</p>
            <p><strong>Client ID:</strong> {order.ClientID}</p>
            <p><strong>Proposed Price:</strong> ${order.DavidProposedPrice}</p>
            <p><strong>Start Date:</strong> {order.WorkStartDate}</p>
            <p><strong>End Date:</strong> {order.WorkEndDate}</p>
            <pre><strong>Contract:</strong> {order.Contract}</pre>

            {/* Generate Bill Button */}
            <button
              style={styles.button}
              onClick={() => generateBill(order.RequestID, order.ClientID)}
            >
              Generate Bill
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { padding: "20px", maxWidth: "800px", margin: "0 auto" },
  card: {
    border: "1px solid #ccc",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
};

export default WorkOrders;
