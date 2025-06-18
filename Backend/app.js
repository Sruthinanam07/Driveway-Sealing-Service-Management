const express = require('express');
const cors = require('cors');
const dbService = require('./dbService');
const app = express();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// Do NOT use express.json() before multer middleware for file uploads

app.use(cors());
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data (form-data compatibility)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.post('/register', async (req, res) => {
    const { username, firstname, lastname, password, address, creditCardInfo, phoneNumber, email } = req.body;
    if (!username || !firstname || !lastname || !password || !address || !creditCardInfo || !phoneNumber || !email) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
        const db = dbService.getDbServiceInstance();
        const result = await db.registerUser(username, firstname, lastname, password, address, creditCardInfo, phoneNumber, email);
        res.json({ success: true, data: result, message: "Registration successful!" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
app.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        console.log("Validation Failed: Missing username or password");
        return res.status(400).json({ success: false, message: "Missing username or password" });
    }

    try {
        const db = dbService.getDbServiceInstance();
        const Client = await db.getUserByUsername(username);

        // Check if user exists
        if (!Client) {
            console.log("User not found");
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Password validation
        if (Client.password && password && Client.password.trim() !== password.trim()) {
            console.log("Password mismatch");
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        // Update sign-in time
        await db.updateSignInTime(username);
        console.log("Sign-in time updated for username:", username);

        // Send successful login response
        return res.json({
            success: true,
            message: "Login successful",
            clientId: Client.ClientID
        });

    } catch (error) {
        console.error("Error during signin:", error.message);
        if (!res.headersSent) { // Ensure no response is sent twice
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Created uploads directory');
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), // Store images in 'uploads' directory
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`), // Unique filename
});
const upload = multer({ storage });


app.post('/request-quote', upload.array('images', 5), async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Log form fields
        console.log("Uploaded Files:", req.files); // Log uploaded files
        const { clientId, address, squareFeet, proposedPrice, note } = req.body;
        
        // Validate all fields
        if (
            !clientId ||
            !address ||
            !squareFeet ||
            !proposedPrice ||
            !req.files ||
            req.files.length !== 5
        ) {
            console.error("Validation Failed: Missing fields or exactly 5 images required");
            return res.status(400).json({
                success: false,
                message: 'Missing required fields or exactly 5 images are required.',
            });
        }

        const imagePaths = req.files.map((file) => file.path.replace(/\\/g, '/')); // Fix backslashes

        const db = dbService.getDbServiceInstance();
        const result = await db.submitQuoteRequest(
            clientId,
            address,
            squareFeet,
            proposedPrice,
            note,
            imagePaths
        );

        res.json({ success: true, message: 'Quote submitted successfully!', data: result });
    } catch (error) {
        console.error("Error submitting quote request:", error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/get-quotes/:clientId', async (req, res) => {
    const { clientId } = req.params;
    // console.log("Client ID:", req.body.clientId);
    if (!clientId) {
        return res.status(400).json({ success: false, message: 'Client ID is required' });
    }

    try {
        const db = dbService.getDbServiceInstance();
        console.log("Fetching quotes for Client ID:", clientId);
        const quotes = await db.getQuotesByClientId(clientId);
        console.log("Fetched Quotes:", quotes);
        res.json({ success: true, data: quotes });
    } catch (error) {
        console.error("Error fetching quotes:", error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/quotes-with-client-info', async (req, res) => {
    const { status } = req.query;

    try {
        const db = dbService.getDbServiceInstance();
        const quotesWithClients = await db.getQuotesWithClientInfo(status || "Negotiating"); // Default to 'Negotiating'
        res.json({ success: true, data: quotesWithClients });
    } catch (error) {
        console.error("Error fetching quotes with client info:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

app.post('/client-respond', async (req, res) => {
    const { requestId, clientNote } = req.body;

    console.log("Received Payload:", { requestId, clientNote }); // Debugging

    if (!requestId || !clientNote) {
        return res.status(400).json({ success: false, message: "Request ID and note are required." });
    }

    try {
        const db = dbService.getDbServiceInstance();
        await db.updateClientNoteAndStatus(requestId, clientNote, 'Negotiating');
        await db.updateQuoteRequestStatus(requestId, 'Negotiating');
        res.json({ success: true, message: "Client response resubmitted successfully." });
    } catch (error) {
        console.error("Error in client response:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

app.post('/respond-quote', async (req, res) => {
    const { requestId, proposedPrice, workStartDate, workEndDate, note, status } = req.body;

    if (!requestId || !status) {
        return res.status(400).json({ success: false, message: "Request ID and status are required." });
    }

    try {
        const db = dbService.getDbServiceInstance();

        console.log("Updating Response for Request:", requestId);
        console.log("Status:", status);

        if (status === "Rejected") {
            await db.updateQuoteRequestStatus(requestId, "Rejected");
            await db.updateClientNoteAndStatus(requestId, note, "Rejected");
            console.log(`Request ${requestId} updated with status 'Rejected' and note: ${note}`);
        }
        
        
        else if (status === "Negotiating") {
            await db.updateQuoteRequestStatus(requestId, 'Negotiating');
            await db.updateClientNoteAndStatus(requestId, note, 'Negotiating');
        } 
        else if (status === "Accepted") {
            // Call a new method to handle the 'Accepted' logic
            await db.acceptQuote(requestId, proposedPrice, workStartDate, workEndDate, note);
        }

        res.json({ success: true, message: "Response updated successfully." });
    } catch (error) {
        console.error("Error responding to quote:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


app.post('/create-work-order', async (req, res) => {
    const { requestId, clientId } = req.body;

    if (!requestId || !clientId) {
        return res.status(400).json({ success: false, message: "Request ID and Client ID are required." });
    }

    try {
        const db = dbService.getDbServiceInstance();

        // Fetch the quote by requestId
        const quote = await db.getQuoteByRequestId(requestId);

        if (!quote || !quote.WorkStartDate) {
            return res.status(400).json({ success: false, message: "WorkStartDate is required." });
        }

        console.log("Fetched Quote:", quote); // Debugging

        const { ProposedPrice, WorkStartDate, WorkEndDate } = quote;

        // Generate contract content
        const contractContent = `
            Contract Agreement:
            --------------------
            Client ID: ${clientId}
            Work Order: ${requestId}
            Agreed Price: $${ProposedPrice}
            Work Start Date: ${WorkStartDate}
            Work End Date: ${WorkEndDate}
            Terms: Both parties agree to the above terms and conditions.
        `;

        // Insert into work_orders table
        await db.insertWorkOrder(requestId, clientId, ProposedPrice, WorkStartDate, WorkEndDate, contractContent);

        res.json({ success: true, message: "Work order created successfully!", contract: contractContent });
    } catch (error) {
        console.error("Error creating work order:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});



app.get('/work-orders', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const workOrders = await db.getAllWorkOrders();
        res.json({ success: true, data: workOrders });
    } catch (error) {
        console.error("Error fetching work orders:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
//chats
app.post("/send-message", async (req, res) => {
    const { requestId, sender, message } = req.body;

    if (!requestId || !sender || !message) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        const db = dbService.getDbServiceInstance();
        await db.addChatMessage(requestId, sender, message);
        res.json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
app.get("/get-messages/:requestId", async (req, res) => {
    const { requestId } = req.params;

    if (!requestId) {
        return res.status(400).json({ success: false, message: "Request ID is required." });
    }

    try {
        const db = dbService.getDbServiceInstance();
        const messages = await db.getChatMessages(requestId);
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
//bill generate

app.post('/generate-bill', async (req, res) => {
    const { requestId, clientId, amount, discount, note } = req.body;

    if (!requestId || !clientId || !amount) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        const finalAmount = parseFloat(amount) - parseFloat(discount || 0);

        const db = dbService.getDbServiceInstance();
        const result = await db.generateBill(requestId, clientId, amount, discount || 0, note, finalAmount);

        console.log("DB Result:", result);

        res.json({
            success: true,
            message: "Bill generated successfully!",
            billId: result.insertId, // Include BillID
            affectedRows: result.affectedRows
        });
    } catch (error) {
        console.error("Error generating bill:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});


//fetch bill
app.get('/get-bill/:requestId', async (req, res) => {
    const { requestId } = req.params;

    try {
        const db = dbService.getDbServiceInstance();
        const bill = await db.getBillByRequestId(requestId);
        if (bill) {
            res.json({ success: true, data: bill });
        } else {
            res.status(404).json({ success: false, message: "Bill not found" });
        }
    } catch (error) {
        console.error("Error fetching bill:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
//client responds to pay or dispute
app.post('/respond-bill', async (req, res) => {
    const { billId, status, clientNote, paymentDetails } = req.body;

    if (!billId || !status) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        const db = dbService.getDbServiceInstance();

        if (status === 'Paid' && paymentDetails) {
            await db.payBill(billId, paymentDetails);
        } else if (status === 'Disputed') {
            await db.disputeBill(billId, clientNote);
        }

        res.json({ success: true, message: `Bill marked as ${status}.` });
    } catch (error) {
        console.error("Error responding to bill:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
//resubmit bill to david
app.post('/resubmit-bill', async (req, res) => {
    const { billId, davidNote, discount } = req.body;

    if (!billId) {
        return res.status(400).json({ success: false, message: "Bill ID is required." });
    }

    try {
        const db = dbService.getDbServiceInstance();
        await db.resubmitBill(billId, davidNote, discount);
        res.json({ success: true, message: "Bill resubmitted successfully." });
    } catch (error) {
        console.error("Error resubmitting bill:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
app.get('/bills/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const db = dbService.getDbServiceInstance();
        const bill = await db.getBillByRequestId(requestId);

        if (bill) {
            res.json({ success: true, data: bill }); // Consistent format
        } else {
            res.status(404).json({ success: false, message: "Bill not found" });
        }
    } catch (error) {
        console.error("Error fetching bill:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
//paybill
app.post('/pay-bill', async (req, res) => {
    const { billId } = req.body;
  
    if (!billId) {
      return res.status(400).json({ success: false, message: "Bill ID is required." });
    }
  
    try {
      const db = dbService.getDbServiceInstance();
  
      // Update bill status to 'Paid' and set PaymentDate
      const query = `UPDATE bills SET Status = 'Paid', PaymentDate = NOW() WHERE BillID = ?`;
      const [result] = await db.connection.promise().query(query, [billId]);
  
      if (result.affectedRows > 0) {
        res.json({ success: true, message: "Bill paid successfully!" });
      } else {
        res.status(404).json({ success: false, message: "Bill not found." });
      }
    } catch (error) {
      console.error("Error paying bill:", error.message);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  });
  app.post('/complete-order', async (req, res) => {
    const { orderId, workEndDate } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, message: "Order ID is required." });
    }

    try {
        const db = dbService.getDbServiceInstance();
        const completedBy = "David Smith"; 

        // Update the order status to 'Completed'
        const result = await db.completeOrder(orderId, completedBy, workEndDate);

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Order marked as completed successfully." });
        } else {
            res.status(404).json({ success: false, message: "Order not found or already completed." });
        }
    } catch (error) {
        console.error("Error completing order:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
app.get('/revenue-report', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const revenueReport = await db.getRevenueReportForDavid();

        if (revenueReport) {
            res.json({ success: true, data: revenueReport });
        } else {
            res.status(404).json({ success: false, message: "No revenue data found for David Smith." });
        }
    } catch (error) {
        console.error("Error generating revenue report:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

  //big-clients
  app.get('/big-clients', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const topClients = await db.getTopClientsForDavid();

        if (topClients.length > 0) {
            res.json({ success: true, data: topClients });
        } else {
            res.status(404).json({ success: false, message: "No completed orders found for David Smith." });
        }
    } catch (error) {
        console.error("Error fetching big clients:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

//difficult clients
app.get('/difficult-clients', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const difficultClients = await db.getDifficultClients();

        if (difficultClients.length > 0) {
            res.json({ success: true, data: difficultClients });
        } else {
            res.status(404).json({ success: false, message: "No difficult clients found." });
        }
    } catch (error) {
        console.error("Error fetching difficult clients:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
//accepted quotes
app.get('/this-month-quotes', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const agreedQuotes = await db.getAgreedQuotesThisMonth();

        if (agreedQuotes.length > 0) {
            res.json({ success: true, data: agreedQuotes });
        } else {
            res.status(404).json({ success: false, message: "No agreed quotes found for this month." });
        }
    } catch (error) {
        console.error("Error fetching this month's quotes:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

//never-requested
app.get('/prospective-clients', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const prospectiveClients = await db.getProspectiveClients();

        if (prospectiveClients.length > 0) {
            res.json({ success: true, data: prospectiveClients });
        } else {
            res.status(404).json({ success: false, message: "No prospective clients found." });
        }
    } catch (error) {
        console.error("Error fetching prospective clients:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

//Largest driveway
app.get('/largest-driveway', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const largestDriveways = await db.getLargestDrivewayLocations();

        if (largestDriveways.length > 0) {
            res.json({ success: true, data: largestDriveways });
        } else {
            res.status(404).json({ success: false, message: "No completed driveways found for David Smith." });
        }
    } catch (error) {
        console.error("Error fetching largest driveways:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

//over-due bills
app.get('/overdue-bills', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const overdueBills = await db.getOverdueBills();

        if (overdueBills.length > 0) {
            res.json({ success: true, data: overdueBills });
        } else {
            res.status(404).json({ success: false, message: "No overdue bills found." });
        }
    } catch (error) {
        console.error("Error fetching overdue bills:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

//bad-clients
app.get('/bad-clients', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const badClients = await db.getBadClients();

        if (badClients.length > 0) {
            res.json({ success: true, data: badClients });
        } else {
            res.status(404).json({ success: false, message: "No bad clients found." });
        }
    } catch (error) {
        console.error("Error fetching bad clients:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

//good-clients
app.get('/good-clients', async (req, res) => {
    try {
        const db = dbService.getDbServiceInstance();
        const goodClients = await db.getGoodClients();

        if (goodClients.length > 0) {
            res.json({ success: true, data: goodClients });
        } else {
            res.status(404).json({ success: false, message: "No good clients found." });
        }
    } catch (error) {
        console.error("Error fetching good clients:", error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});
app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
