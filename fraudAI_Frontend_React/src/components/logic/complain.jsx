import React, { useState, useEffect } from "react";
import { AlertCircle, Lock, CheckCircle } from "lucide-react";
import { auth, db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from "firebase/firestore";

import { useSearchParams } from "react-router-dom";


export default function Complaint() {
  const [user, setUser] = useState(null);
  const [searchParams] = useSearchParams();
  const receiverID = searchParams.get("receiverID") || "";

  const [formData, setFormData] = useState({
    upiId: receiverID,
    complaint: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
      }
    };

    checkUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const upiPattern = /^[\w.-]+@[\w.-]+$/;
    if (!upiPattern.test(formData.upiId)) {
      setError("Please enter a valid UPI ID (e.g., username@bankname)");
      return;
    }
  
    if (formData.complaint.length < 10) {
      setError("Complaint must be at least 10 characters long.");
      return;
    }
  
    try {
      // Add complaint to Firestore
      await addDoc(collection(db, "complaints"), {
        senderEmail: user.email,
        recipientUpiId: formData.upiId,
        complaint: formData.complaint,
        timestamp: new Date(),
      });
  
      // Fetch recipient's user document
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("upiId", "==", formData.upiId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]; // Assuming UPI ID is unique
        const userRef = doc(db, "users", userDoc.id);
        const userData = userDoc.data();
        const modelData = userData.modelData || {}; // Ensure modelData exists
  
        // Increment the required values by 0.2
        const updatedModelData = {
          ...modelData,
          "Geo-Location Flags_normal": (modelData["Geo-Location Flags_normal"] || 0) - 0.02,
          "Geo-Location Flags_unusual": (modelData["Geo-Location Flags_unusual"] || 0) - 0.02,
          "Recent High-Value Transaction Flags": (modelData["Recent High-Value Transaction Flags"] || 0) + 0.02,
          "Recipient Blacklist Status": (modelData["Recipient Blacklist Status"] || 0) + 0.02,
          "Normalized Transaction Amount": (modelData["Normalized Transaction Amount"] || 0) - 0.01,
          "Social Trust Score": (modelData["Social Trust Score"] || 0) - 0.1,
          "Account Age": (modelData["Account Age"] || 0) +  0.1,
        };
  
        // Update Firestore with new modelData values
        await updateDoc(userRef, { modelData: updatedModelData });
      }
  
      setError("");
      setSubmitted(true);
  
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ upiId: formData.upiId, complaint: "" });
      }, 3000);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setError("An error occurred while submitting your complaint. Please try again.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="max-w-lg w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 relative">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-indigo-400">Submit a Complaint</h2>
          <p className="mt-2 text-gray-400">Report UPI transaction issues</p>
        </div>

        {!user ? (
          <div className="bg-red-500/20 p-4 rounded-md flex items-center gap-2 text-red-400">
            <Lock className="h-6 w-6" />
            <p className="text-sm">You must be logged in to submit a complaint.</p>
          </div>
        ) : submitted ? (
          <div className="bg-green-500/20 p-4 rounded-md mb-6 flex items-center gap-2 text-green-400">
            <CheckCircle className="h-6 w-6" />
            <p className="text-sm">Complaint submitted successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 p-4 rounded-md flex items-center gap-2 text-red-400">
                <AlertCircle className="h-6 w-6" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="upiId" className="block text-sm font-medium text-gray-300">
                UPI ID (Receiver)
              </label>
              <input
                type="text"
                id="upiId"
                placeholder="Complaint Against"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="mt-2 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
                disabled={!user || !!receiverID}
              />
            </div>

            <div>
              <label htmlFor="complaint" className="block text-sm font-medium text-gray-300">
                Complaint Details
              </label>
              <textarea
                id="complaint"
                rows={4}
                placeholder="Describe your issue in detail..."
                value={formData.complaint}
                onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                className="mt-2 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
                disabled={!user}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:opacity-50"
              disabled={!user}
            >
              Submit Complaint
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
