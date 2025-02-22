# 🛡️SafeUPI
SafeUPI is an advanced fraud detection and prevention application designed to safeguard digital transactions using cutting-edge artificial intelligence techniques. With seamless integration of machine learning models and user-friendly interfaces, SafeUPI offers robust solutions for real-time fraud detection and mitigation.

By leveraging Random Forest classifiers for accurate predictions, SafeUPI ensures unparalleled security and efficiency in transaction monitoring.

---


# ⚙️ Key Features

## 🌐 Frontend Features
- 🔒 User Authentication: Secure login using Google Sign-In.
- 📊 Transaction Dashboard: View and analyze transaction history.
- 📱 Responsive UI: Optimized for both mobile and desktop with Tailwind CSS.
- 🎨 Animations: Interactive transitions powered by Framer Motion.

## 🧠 Backend Features
- 🧪 AI-Powered Fraud Detection: Random Forest classifiers for fraud detection.
- ⚡ Real-Time Analysis: Instant fraud predictions through APIs with pre-trained models.
- 📂 Database Integration: Firebase backend to store UPI IDs, transaction history, and analytics.
---

### **Frontend**  
- 🌟 [React](https://reactjs.org/)  
- ⚡ [Vite](https://vitejs.dev/)  
- 🎨 [Tailwind CSS](https://tailwindcss.com/)  
- 🎭 [Framer Motion](https://www.framer.com/motion/)  
- 🛠️ [Radix UI](https://www.radix-ui.com/)
- 
### **Backend**  
- 🐍 [Python](https://www.python.org/)  
- 🌐 [Flask](https://flask.palletsprojects.com/)  
- 🔥 [Firebase](https://firebase.google.com/)

### **ML**
- 🌳 [Random Forest Classifier](https://scikit-learn.org/stable/modules/ensemble.html#forest)

### **Deployment**
-  [Frontend - Vercel](https://vercel.com/)
-  [Backend - AWS](https://aws.amazon.com/)

---

# User Interface Snapshots

![Signin UI](SystemDesignDiagrams/signin.png)

*Our SafeUPI User Signin UI*

![Dashboard UI](SystemDesignDiagrams/dashboard.png)

*Our SafeUPI User Dashboard UI*

---

![Send Money UI](SystemDesignDiagrams/send_money.png)

*Our SafeUPI Send Money UI*

![Fraud Detection UI](SystemDesignDiagrams/fraud_ui.png)

*Our SafeUPI Fraud Detection Warning UI*

---

![Recent Transaction UI](SystemDesignDiagrams/recent_transactions.png)

*Our SafeUPI Recent Transaction UI*

![Complaint UI](SystemDesignDiagrams/complaint.png)

*Our SafeUPI Complaint UI*

![Transaction Details UI](SystemDesignDiagrams/transaction_ui.png)

*Our Transaction Details UI*

![Complaints History UI](SystemDesignDiagrams/complaint_history.png)

*Our Complaints History UI*

## Installation

### Setup:
1. Clone the Main repository:
   ```bash
   git clone https://github.com/AritraDey-Dev/fintech-avalanche.git
   ```
2. Navigate to the project directory:
   ```bash
   cd fintech-avalanche

   ```

### Frontend Setup:

1. Navigate to the Frontend directory:
   ```bash
   cd fraudAI_Frontend_React

   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the app in your browser at [http://localhost:3000](http://localhost:3000).

### Backend Setup:

1. Navigate to the backend directory:
   ```bash
   cd ../AI_model_server_Flask

   ```
2. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure the trained model file `best_rf_model (1).pkl` is present in the directory.
4. Start the Flask server:
   ```bash
   python app.py
   ```
5. The API will be accessible at [http://127.0.0.1:5000/](http://127.0.0.1:5000/).

---




📊 Fraud Detection Parameters

1. **Transaction Amount Anomalies**: Detects transactions that significantly deviate from a user's historical average or usual behavior.

2. **Transaction Frequency**: Flags unusual spikes in the number of transactions within a short time period (e.g., multiple transactions in minutes).

3. **Recipient Verification Status**: Checks whether the recipient is verified, registered recently, or flagged as suspicious.

4. **Recipient Blacklist Status**: Identifies transactions to or from blacklisted UPI IDs, accounts, or merchants.

5. **Device Fingerprinting**: Analyzes mismatches in the device ID, browser, or OS used for the transaction compared to prior user sessions.

6. **VPN or Proxy Usage**: Flags transactions originating from masked IP addresses, indicating possible fraud attempts.

7. **Geo-Location Flags**: Identifies if transactions are initiated from unusual or high-risk geolocations.

8. **Behavioral Biometrics**: Monitors user interaction patterns, such as typing speed or mouse movement, for deviations from typical behavior.

9. **Time Since Last Transaction with Recipient**: Evaluates if the recipient is a new contact or there has been a significant time gap since the last transaction.

10. **Social Trust Score**: Scores recipients based on their relationship with the user (e.g., presence in contact list or prior transactions).

11. **Account Age**: Analyzes the age of the user’s account, flagging newly created accounts performing high-risk transactions.

12. **High-Risk Transaction Times**: Flags transactions occurring during non-business hours or at unusual times.

13. **Past Fraudulent Behavior Flags**: Checks if the user or recipient has been flagged for prior fraudulent activity.

14. **Location-Inconsistent Transactions**: Detects transactions initiated from multiple geolocations in a short time frame, indicating compromised credentials.

15. **Normalized Transaction Amount**: Compares the transaction amount against normalized values for similar users or demographic profiles.

16. **Transaction Context Anomalies**: Flags transactions that do not align with the user's typical spending habits (e.g., sudden large purchases).

17. **Fraud Complaints Count**: Analyzes the frequency of fraud complaints linked to a UPI ID, device, or account.

18. **Merchant Category Mismatch**: Checks if the merchant's behavior aligns with their declared category (e.g., high-value transactions for a low-value merchant).

19. **User Daily Limit Exceeded**: Flags transactions that exceed predefined daily transaction limits.

20. **Recent High-Value Transaction Flags**: Detects if the user recently performed a high-value transaction, increasing risk for subsequent fraudulent activity.

---


# 🏗️ System Architecture

1. Google Sign-In (Authentication)
Purpose: Enables secure user authentication using Google accounts.
Workflow:
Users authenticate via Google, generating a unique user ID (UID).
This UID is linked to the user's data in Firebase Firestore.

2. Creating/Selecting UPI ID
Purpose: Assigns a unique UPI ID to users upon first login or allows selection from existing ones.
Details:
First-time users are automatically assigned a UPI ID (e.g., user12345@bank).
Existing users can select from their linked UPI IDs.
UPI IDs are stored under the user's profile in Firestore.

3. Entering Transaction Details
Purpose: Allows users to input recipient UPI ID, transaction amount, and remarks.
Workflow:
Users manually enter or select the recipient's UPI ID.
Fraud detection verification is triggered via a "Verify Fraud Status" button.

4. Fraud Check (Verification Process)
Purpose: Determines whether the recipient's UPI ID is flagged for fraud.
Workflow:
System checks the Firestore fraud database for the recipient UPI ID.
If unflagged, simulated fraud detection is applied for new UPI IDs or reuses prior predictions for existing ones.

5. AI Fraud Detection
Purpose: Utilizes AI to analyze transaction details and predict fraud.
Workflow:
Transaction data is sent to the AI service for fraud probability analysis.
Based on the AI’s response:
Fraud: User sees a warning.
Not Fraud: Transaction proceeds.

6. Transaction Execution
Purpose: Processes verified transactions.
Workflow:
If deemed not fraudulent, the system processes the transaction (simulated in this demo).
Status is recorded in the transaction history.

7. Storing Transaction History
Purpose: Maintains a record of transactions for auditing and display.
Workflow:
Details such as amount, recipient, timestamp, and fraud status are saved in Firestore.
History is accessible under the user’s profile and displayed in the app's UI.

8. User Interface (UI) Workflow
Main Screen:
Displays the "Send Money" page with inputs for transaction details and fraud verification.
Transaction Status:
Fraudulent transactions show warnings and are blocked.
Verified transactions activate the "Send Money" button.
Recent Transactions:
Displays historical data, including recipient, amount, date, and fraud status.

![System Design](SystemDesignDiagrams/SystemDesign.png)

