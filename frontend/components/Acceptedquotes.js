import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ThisMonthQuotes = () => {
    const [quotes, setQuotes] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchThisMonthQuotes();
    }, []);

    const fetchThisMonthQuotes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/this-month-quotes');
            if (response.data.success) {
                setQuotes(response.data.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error("Error fetching this month's quotes:", err.message);
            setError("Error fetching quotes.");
        }
    };

    return (
        <div>
            <h2>Agreed Quotes for December 2024</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table border="1">
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Client Name</th>
                        <th>Property Address</th>
                        <th>Proposed Price</th>
                        <th>Work Start Date</th>
                        <th>Work End Date</th>
                    </tr>
                </thead>
                <tbody>
                    {quotes.length > 0 ? (
                        quotes.map(quote => (
                            <tr key={quote.RequestID}>
                                <td>{quote.RequestID}</td>
                                <td>{quote.FirstName} {quote.LastName}</td>
                                <td>{quote.PropertyAddress}</td>
                                <td>${quote.ProposedPrice}</td>
                                <td>{quote.WorkStartDate}</td>
                                <td>{quote.WorkEndDate}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No agreed quotes found for this month.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ThisMonthQuotes;
