import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DifficultClients = () => {
    const [clients, setClients] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDifficultClients();
    }, []);

    const fetchDifficultClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/difficult-clients');
            if (response.data.success) {
                setClients(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error("Error fetching difficult clients:", err.message);
            setError("Error fetching difficult clients.");
        }
    };

    return (
        <div>
            <h2>Difficult Clients</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table border="1">
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Total Requests</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.length > 0 ? (
                        clients.map(client => (
                            <tr key={client.ClientID}>
                                <td>{client.ClientID}</td>
                                <td>{client.FirstName}</td>
                                <td>{client.LastName}</td>
                                <td>{client.TotalRequests}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No difficult clients found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DifficultClients;
