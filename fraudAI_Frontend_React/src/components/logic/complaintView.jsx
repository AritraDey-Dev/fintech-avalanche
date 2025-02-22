import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Loader, AlertCircle } from "lucide-react";

export default function ComplaintsHistory() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError("You must be logged in to view your complaints.");
          setLoading(false);
          return;
        }

        const complaintsRef = collection(db, "complaints");
        const q = query(
          complaintsRef,
          where("senderEmail", "==", currentUser.email)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("No complaints found.");
          setLoading(false);
          return;
        }

        const complaintsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setComplaints(complaintsData);
        setError("");
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError("Failed to fetch complaints. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="max-w-4xl w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 relative">
        <h2 className="text-3xl font-bold text-indigo-400 text-center mb-6">
          Your Complaints
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : error ? (
          <div className="bg-red-500/20 p-4 rounded-md flex items-center gap-2 text-red-400 text-center">
            <AlertCircle className="h-6 w-6" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-800 rounded-lg">
              <thead>
                <tr className="bg-gray-800 text-gray-300">
                  <th className="px-4 py-3 text-left">UPI ID</th>
                  <th className="px-4 py-3 text-left">Complaint</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-gray-700 hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">{complaint.recipientUpiId}</td>
                    <td className="px-4 py-3">{complaint.complaint}</td>
                    <td className="px-4 py-3">
                      {new Date(complaint.timestamp.toDate()).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
