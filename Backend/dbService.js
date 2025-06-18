const dotenv = require('dotenv');
const mysql = require('mysql2');
dotenv.config();
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});
let instance = null;
connection.connect(err => {
    if (err) {
        console.log(err.message);
    }
    console.log('DB Connected: ' + connection.config.database);
});

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }
    async registerUser(username, firstname, lastname, password, address, creditCardInfo, phoneNumber, email) {
        const query = `INSERT INTO Client (Username, FirstName, LastName, Password, Address, CreditCardInfo, PhoneNumber, Email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await connection.promise().query(query, [username, firstname, lastname, password, address, creditCardInfo, phoneNumber, email]);
        return result;
    }  
    async getUserByUsername(username) {
        try {
            const query = 'SELECT * FROM Client WHERE Username = ?';
            console.log("Executing query:", query, "with username:", username);
            const [rows] = await connection.promise().query(query, [username]);
            console.log("Query result:", rows); // Log the query result
            return rows[0]; // Return the first row
        } catch (error) {
            console.error("Error in getUserByUsername:", error.message);
            throw error;
        }
    }
    
    async updateSignInTime(username) {
        const query = "UPDATE Client SET signintime = NOW() WHERE Username = ?";
        try {
            const [result] = await connection.promise().query(query, [username]);
            console.log("Sign-in time updated for username:", username, "Affected rows:", result.affectedRows);
            return result.affectedRows;
        } catch (error) {
            console.error("Error in updateSignInTime:", error.message);
            throw error;
        }
    }
   
    async acceptQuote(requestId, proposedPrice, workStartDate, workEndDate, note) {
        try {
            const query = `
                INSERT INTO quotes (RequestID, ProposedPrice, WorkStartDate, WorkEndDate, Note, Status)
                VALUES (?, ?, ?, ?, ?, 'Accepted')
                ON DUPLICATE KEY UPDATE
                ProposedPrice = VALUES(ProposedPrice),
                WorkStartDate = VALUES(WorkStartDate),
                WorkEndDate = VALUES(WorkEndDate),
                Note = VALUES(Note),
                Status = VALUES(Status)
            `;
            await connection.promise().query(query, [
                requestId, proposedPrice, workStartDate, workEndDate, note
            ]);
    
            const updateStatusQuery = `UPDATE quote_requests SET Status = 'Accepted' WHERE RequestID = ?`;
            await connection.promise().query(updateStatusQuery, [requestId]);
        } catch (error) {
            console.error("Error in acceptQuote:", error.message);
            throw error;
        }
    }
    
    // Submit a new quote request
    async submitQuoteRequest(clientId, propertyAddress, squareFeet, proposedPrice, note, imagePaths) {
        const query = `
            INSERT INTO quote_requests 
            (ClientID, PropertyAddress, SquareFeet, ProposedPrice, Note, Image1, Image2, Image3, Image4, Image5)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            clientId,
            propertyAddress,
            squareFeet,
            proposedPrice,
            note,
            imagePaths[0],
            imagePaths[1],
            imagePaths[2],
            imagePaths[3],
            imagePaths[4]
        ];
        const [result] = await connection.promise().query(query, params);
        return result;
    }
    
    async getQuotesByClientId(clientId) {
        const query = `
            SELECT 
                qr.RequestID,
                qr.PropertyAddress,
                qr.SquareFeet,
                qr.ProposedPrice AS ClientProposedPrice,
                qr.Status,
                qr.ResponseNote,
                COALESCE(q.ProposedPrice, NULL) AS DavidProposedPrice,
                COALESCE(q.WorkStartDate, NULL) AS WorkStartDate,
                COALESCE(q.WorkEndDate, NULL) AS WorkEndDate,
                COALESCE(q.Note, NULL) AS DavidNote
            FROM quote_requests qr
            LEFT JOIN quotes q ON qr.RequestID = q.RequestID
            WHERE qr.ClientID = ?
        `;
        const [results] = await connection.promise().query(query, [clientId]);
        console.log("Fetched Quotes Data:", results);
        return results;
    }
    async respondToQuote(requestId, proposedPrice, workStartDate, workEndDate, note, status) {
        try {
            if (status === "Rejected") {
                // Update the quote_requests table with Rejected status and note
                const query = `UPDATE quote_requests SET Status = ?, ResponseNote = ? WHERE RequestID = ?`;
                await connection.promise().query(query, [status, note, requestId]);
            } else {
                // Insert or Update the quotes table for Accept or Negotiate
                const query = `
                    INSERT INTO quotes (RequestID, ProposedPrice, WorkStartDate, WorkEndDate, Note, Status)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    ProposedPrice = VALUES(ProposedPrice),
                    WorkStartDate = VALUES(WorkStartDate),
                    WorkEndDate = VALUES(WorkEndDate),
                    Note = VALUES(Note),
                    Status = VALUES(Status)
                `;
                await connection.promise().query(query, [requestId, proposedPrice, workStartDate, workEndDate, note, status]);
    
                // Synchronize the Status in the quote_requests table
                const updateStatusQuery = `UPDATE quote_requests SET Status = ? WHERE RequestID = ?`;
                await connection.promise().query(updateStatusQuery, [status, requestId]);
            }
        } catch (error) {
            console.error("Error in respondToQuote:", error.message);
            throw error;
        }
    }
    
    async getQuotesWithClientInfo(status = "") {
        let query = `
            SELECT 
                qr.RequestID, 
                qr.PropertyAddress, 
                qr.SquareFeet, 
                qr.ProposedPrice, 
                qr.Status, 
                qr.Note, 
                qr.ResponseNote,
                q.ClientNote,  -- Include ClientNote from the quotes table
                qr.Image1, qr.Image2, qr.Image3, qr.Image4, qr.Image5, 
                c.FirstName, 
                c.LastName, 
                c.Email 
            FROM quote_requests qr
            JOIN Client c ON qr.ClientID = c.ClientID
            LEFT JOIN quotes q ON qr.RequestID = q.RequestID
        `;
    
        const params = [];
        if (status) {
            query += ` WHERE qr.Status = ?`;
            params.push(status);
        }
    
        try {
            const [rows] = await connection.promise().query(query, params);
            return rows;
        } catch (error) {
            console.error("Error fetching quotes with client info:", error.message);
            throw error;
        }
    }
    async updateQuoteWithDetails(requestId, proposedPrice, workStartDate, workEndDate, davidNote, status) {
        const query = `
            INSERT INTO quotes (RequestID, ProposedPrice, WorkStartDate, WorkEndDate, Note, Status)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            ProposedPrice = VALUES(ProposedPrice),
            WorkStartDate = VALUES(WorkStartDate),
            WorkEndDate = VALUES(WorkEndDate),
            Note = VALUES(Note),
            Status = VALUES(Status)
        `;
        try {
            const [result] = await connection.promise().query(query, [
                requestId, proposedPrice, workStartDate, workEndDate, davidNote, status
            ]);
            return result;
        } catch (error) {
            console.error("Error updating quote with details:", error.message);
            throw error;
        }
    }
    
    async updateClientNote(requestId, clientNote) {
        const query = `UPDATE quotes SET ClientNote = ? WHERE RequestID = ?`;
        try {
            const [result] = await connection.promise().query(query, [clientNote, requestId]);
            return result;
        } catch (error) {
            console.error("Error updating client note:", error.message);
            throw error;
        }
    }
    async updateClientNoteAndStatus(requestId, clientNote, status) {
        const query = `UPDATE quote_requests SET ResponseNote = ?, Status = ? WHERE RequestID = ?`;
        try {
            const [result] = await connection.promise().query(query, [clientNote, status, requestId]);
            return result;
        } catch (error) {
            console.error("Error updating response note and status:", error.message);
            throw error;
        }
    }
    
    async insertWorkOrder(requestId, clientId, proposedPrice, workStartDate, workEndDate, contract) {
        const query = `
            INSERT INTO work_orders (RequestID, ClientID, DavidProposedPrice, WorkStartDate, WorkEndDate, Contract)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        try {
            const [result] = await connection.promise().query(query, [
                requestId,
                clientId,
                proposedPrice,
                workStartDate,
                workEndDate,
                contract,
            ]);
            return result;
        } catch (error) {
            console.error("Error inserting work order:", error.message);
            throw error;
        }
    }
    
    
    async getAcceptedQuoteByRequestId(requestId) {
        const query = `
            SELECT ProposedPrice, WorkStartDate, WorkEndDate
            FROM quotes
            WHERE RequestID = ? AND Status = 'Accepted'
        `;
        try {
            const [result] = await connection.promise().query(query, [requestId]);
            return result[0]; // Return the first row
        } catch (error) {
            console.error("Error fetching accepted quote:", error.message);
            throw error;
        }
    }

    async getQuoteByRequestId(requestId) {
        const query = `
            SELECT ProposedPrice, WorkStartDate, WorkEndDate 
            FROM quotes 
            WHERE RequestID = ? AND WorkStartDate IS NOT NULL
        `;
        const [results] = await connection.promise().query(query, [requestId]);
        return results[0];
    }
    
    async getAllWorkOrders() {
        const query = `SELECT * FROM work_orders`;
        try {
            const [rows] = await connection.promise().query(query);
            return rows;
        } catch (error) {
            console.error("Error fetching work orders:", error.message);
            throw error;
        }
    }
    
    async updateQuoteRequestStatus(requestId, status) {
        const query = `UPDATE quote_requests SET Status = ? WHERE RequestID = ?`;
        try {
            const [result] = await connection.promise().query(query, [status, requestId]);
            return result;
        } catch (error) {
            console.error("Error updating quote request status:", error.message);
            throw error;
        }
    }
    
    //chat
    async addChatMessage(requestId, sender, message) {
        const query = `INSERT INTO chat_messages (RequestID, Sender, Message) VALUES (?, ?, ?)`;
        try {
            const [result] = await connection.promise().query(query, [requestId, sender, message]);
            return result;
        } catch (error) {
            console.error("Error adding chat message:", error.message);
            throw error;
        }
    }
    
    async getChatMessages(requestId) {
        const query = `SELECT Sender, Message, SentAt FROM chat_messages WHERE RequestID = ? ORDER BY SentAt ASC`;
        try {
            const [rows] = await connection.promise().query(query, [requestId]);
            return rows;
        } catch (error) {
            console.error("Error fetching chat messages:", error.message);
            throw error;
        }
    }
    async generateBill(requestId, clientId, amount, discount, note, finalAmount) {
        const query = `
            INSERT INTO bills (RequestID, ClientID, Amount, Discount, Note, FinalAmount)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [requestId, clientId, amount, discount || 0,finalAmount,note || ""];
    
        try {
            const [result] = await connection.promise().query(query, params);
            return result; // Return the result of the query
        } catch (error) {
            console.error("Error in generateBill:", error.message);
            throw error;
        }
    }
    
    
    
    async getBillByRequestId(requestId) {
        const query = `SELECT * FROM bills WHERE RequestID = ?`;
        const [result] = await connection.promise().query(query, [requestId]);
        return result[0];
    }
    
    async payBill(billId, paymentDetails) {
        const query = `UPDATE bills SET Status = 'Paid', PaymentDate = NOW() WHERE BillID = ?`;
        await connection.promise().query(query, [billId]);
        // Handle paymentDetails storage here if needed
    }
    
    async disputeBill(billId, clientNote) {
        const query = `UPDATE bills SET Status = 'Disputed', ClientNote = ? WHERE BillID = ?`;
        await connection.promise().query(query, [clientNote, billId]);
    }
    
    async resubmitBill(billId, davidNote, discount) {
        const query = `
            UPDATE bills SET Status = 'Pending', DavidNote = ?, Discount = ?
            WHERE BillID = ?
        `;
        await connection.promise().query(query, [davidNote, discount || 0, billId]);
    }
    async completeOrder(orderId, completedBy, workEndDate) {
        const query = `
            UPDATE orders 
            SET Status = 'Completed', CompletedBy = ?, WorkEndDate = ?
            WHERE OrderID = ?
        `;
        try {
            const [result] = await connection.promise().query(query, [
                completedBy,
                workEndDate || new Date(), // Default to current date if not provided
                orderId,
            ]);
            return result;
        } catch (error) {
            console.error("Error in completeOrder:", error.message);
            throw error;
        }
    }
    async getRevenueReportForDavid() {
        const query = `
            SELECT 
                wo.CompletedBy, 
                SUM(b.FinalAmount) AS TotalRevenue
            FROM 
                work_orders wo
            JOIN 
                bills b ON wo.RequestID = b.RequestID
            WHERE 
                wo.CompletedBy = 'David Smith'
                AND wo.Status = 'Completed'
            GROUP BY 
                wo.CompletedBy;
        `;
        try {
            const [result] = await connection.promise().query(query);
            return result[0]; // Return the revenue report
        } catch (error) {
            console.error("Error fetching revenue report:", error.message);
            throw error;
        }
    }
    
    //big clients
    async getTopClientsForDavid() {
        const query = `
            WITH OrderCounts AS (
                SELECT 
                    ClientID, 
                    COUNT(WorkOrderID) AS TotalOrders
                FROM 
                    work_orders
                WHERE 
                    CompletedBy = 'David Smith' 
                    AND Status = 'Completed'
                GROUP BY 
                    ClientID
            ),
            MaxOrders AS (
                SELECT 
                    MAX(TotalOrders) AS MaxOrderCount
                FROM 
                    OrderCounts
            )
            SELECT 
                c.ClientID, 
                c.FirstName, 
                c.LastName, 
                oc.TotalOrders
            FROM 
                OrderCounts oc
            JOIN 
                Client c ON oc.ClientID = c.ClientID
            JOIN 
                MaxOrders mo ON oc.TotalOrders = mo.MaxOrderCount;
        `;
    
        try {
            const [results] = await connection.promise().query(query);
            return results; // Return top clients
        } catch (error) {
            console.error("Error fetching top clients for David Smith:", error.message);
            throw error;
        }
    }
    
    //difficult clients
    async getDifficultClients() {
        const query = `
            SELECT 
                c.ClientID, 
                c.FirstName, 
                c.LastName, 
                COUNT(qr.RequestID) AS TotalRequests
            FROM 
                quote_requests qr
            JOIN 
                Client c ON qr.ClientID = c.ClientID
            WHERE 
                qr.Status = 'Negotiating'
            GROUP BY 
                c.ClientID, c.FirstName, c.LastName
            HAVING 
                COUNT(qr.RequestID) = 3;
        `;
    
        try {
            const [rows] = await connection.promise().query(query);
            return rows;
        } catch (error) {
            console.error("Error fetching difficult clients:", error.message);
            throw error;
        }
    }
    
    //accepted
    async getAgreedQuotesThisMonth() {
        const query = `
            SELECT 
                qr.RequestID,
                c.ClientID,
                c.FirstName,
                c.LastName,
                qr.PropertyAddress,
                q.ProposedPrice,
                q.WorkStartDate,
                q.WorkEndDate,
                q.Status
            FROM 
                quotes q
            JOIN 
                quote_requests qr ON q.RequestID = qr.RequestID
            JOIN 
                Client c ON qr.ClientID = c.ClientID
            WHERE 
                q.Status = 'Accepted'
                AND MONTH(q.WorkStartDate) = 12 
                AND YEAR(q.WorkStartDate) = 2024;
        `;
        try {
            const [rows] = await connection.promise().query(query);
            return rows;
        } catch (error) {
            console.error("Error fetching agreed quotes:", error.message);
            throw error;
        }
    }
    
    //neversubmitted
    async getProspectiveClients() {
        const query = `
            SELECT 
                c.ClientID,
                c.FirstName,
                c.LastName,
                c.Username,
                c.Email
            FROM 
                Client c
            LEFT JOIN 
                quote_requests qr ON c.ClientID = qr.ClientID
            WHERE 
                qr.RequestID IS NULL;
        `;
        try {
            const [rows] = await connection.promise().query(query);
            return rows;
        } catch (error) {
            console.error("Error fetching prospective clients:", error.message);
            throw error;
        }
    }
    
    //largest driveway
    async getLargestDrivewayLocations() {
        const query = `
            SELECT 
                qr.PropertyAddress,
                qr.SquareFeet
            FROM 
                work_orders wo
            JOIN 
                quote_requests qr ON wo.RequestID = qr.RequestID
            WHERE 
                wo.CompletedBy = 'David Smith' 
                AND wo.Status = 'Completed'
                AND qr.SquareFeet = (
                    SELECT MAX(qr2.SquareFeet)
                    FROM work_orders wo2
                    JOIN quote_requests qr2 ON wo2.RequestID = qr2.RequestID
                    WHERE wo2.CompletedBy = 'David Smith' 
                      AND wo2.Status = 'Completed'
                      ORDER BY 
            qr.SquareFeet DESC
        LIMIT 1;
                );
        `;
        try {
            const [rows] = await connection.promise().query(query);
            return rows;
        } catch (error) {
            console.error("Error fetching largest driveway locations:", error.message);
            throw error;
        }
    }
    
    //getoverdue bills
    async getOverdueBills() {
        const query = `
            SELECT 
                BillID,
                ClientID,
                RequestID,
                Amount,
                Discount,
                FinalAmount,
                Status,
                CreatedAt
            FROM 
                bills
            WHERE 
                Status != 'Paid'
                AND DATE_ADD(CreatedAt, INTERVAL 7 DAY) < NOW();
        `;
        try {
            const [rows] = await connection.promise().query(query);
            return rows;
        } catch (error) {
            console.error("Error fetching overdue bills:", error.message);
            throw error;
        }
    }
    
    //bad-clients
    async getBadClients() {
        const query = `
            SELECT c.ClientID, c.FirstName, c.LastName, c.Email
            FROM Client c
            JOIN bills b ON c.ClientID = b.ClientID
            WHERE b.Status != 'Paid' AND DATE_ADD(b.CreatedAt, INTERVAL 7 DAY) < NOW()
            GROUP BY c.ClientID
            HAVING COUNT(CASE WHEN b.Status = 'Paid' THEN 1 END) = 0
        `;
        try {
            const [rows] = await connection.promise().query(query);
            return rows;
        } catch (error) {
            console.error("Error fetching bad clients:", error.message);
            throw error;
        }
    }
    //good-clients
    async getGoodClients() {
        const query = `
            SELECT c.ClientID, c.FirstName, c.LastName, c.Email
            FROM Client c
            JOIN bills b ON c.ClientID = b.ClientID
            WHERE b.Status = 'Paid' AND TIMESTAMPDIFF(HOUR, b.CreatedAt, b.PaymentDate) <= 24
            GROUP BY c.ClientID
        `;
        try {
            const [rows] = await connection.promise().query(query);
            return rows;
        } catch (error) {
            console.error("Error fetching good clients:", error.message);
            throw error;
        }
    }
}

module.exports = DbService;
