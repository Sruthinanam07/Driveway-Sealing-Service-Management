import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProspectiveClients = () => {
    const [clients, setClients] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProspectiveClients();
    }, []);

    const fetchProspectiveClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/prospective-clients');
            if (response.data.success) {
                setClients(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error("Error fetching prospective clients:", err.message);
            setError("Error fetching prospective clients.");
        }
    };

    return (
        <div>
            <h2>Prospective Clients</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table border="1">
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Username</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.length > 0 ? (
                        clients.map(client => (
                            <tr key={client.ClientID}>
                                <td>{client.ClientID}</td>
                                <td>{client.FirstName}</td>
                                <td>{client.LastName}</td>
                                <td>{client.Username}</td>
                                <td>{client.Email}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">No prospective clients found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProspectiveClients;
