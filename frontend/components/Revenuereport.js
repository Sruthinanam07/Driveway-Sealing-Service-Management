import React, { useEffect, useState } from "react";
import axios from "axios";

const RevenueReport = () => {
    const [revenue, setRevenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the revenue report
        const fetchRevenueReport = async () => {
            try {
                const response = await axios.get("http://localhost:3000/revenue-report");
                if (response.data.success) {
                    setRevenue(response.data.data);
                } else {
                    setError(response.data.message || "No revenue data available.");
                }
            } catch (err) {
                console.error("Error fetching revenue report:", err.message);
                setError("Failed to fetch revenue report. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueReport();
    }, []);

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>David Smith's Revenue Report</h1>

            {loading && <p style={styles.loading}>Loading revenue data...</p>}

            {error && <p style={styles.error}>{error}</p>}

            {revenue && (
                <div style={styles.reportCard}>
                    <p><strong>Completed By:</strong> {revenue.CompletedBy}</p>
                    <p><strong>Total Revenue:</strong> ${revenue.TotalRevenue.toFixed(2)}</p>
                </div>
            )}
        </div>
    );
};

// Inline Styles
const styles = {
    container: {
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1.5rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        fontFamily: "Arial, sans-serif",
    },
    title: {
        textAlign: "center",
        color: "#333",
        marginBottom: "1rem",
    },
    loading: {
        textAlign: "center",
        color: "#555",
    },
    error: {
        color: "red",
        textAlign: "center",
    },
    reportCard: {
        marginTop: "1rem",
        padding: "1rem",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "5px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        fontSize: "1.1rem",
    },
};

export default RevenueReport;
