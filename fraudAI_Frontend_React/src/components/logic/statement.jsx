import React, { useState, useEffect } from "react";
import { IndianRupee, Building2, Search, User } from "lucide-react";
import { db, auth } from "./firebase"; // Ensure correct Firebase imports
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useUser } from "@/context/user";

const bankDetails = {
  bankName: "NPCI",
  period: "March 1, 2024, to March 31, 2024",
  website: "www.SafeUPI.com",
};

function Statement() {
  const { user, setUser, upiId, setUpiId } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [latestBalance, setlatestBalance] = useState(100);

  // Fetch user details from the users collection
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
            setUpiId(userDoc.data().upiId || "");
            setlatestBalance(userDoc.data().balance);
            console.log(userDoc.data().balance);
          }
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };
    fetchUser();
  }, []);

  // Fetch transactions from Firestore once we have the UPI ID
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        const allTxns = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Filter transactions where the user is involved (as sender or recipient)
        const userTxns = allTxns.filter(
          (txn) => txn.senderUPI === upiId || txn.recipientUPI === upiId
        );
        // Sort transactions by createdAt ascending (if available)
        userTxns.sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
          return dateA - dateB;
        });
        setTransactions(userTxns);
      } catch (err) {
        setError("Failed to load transactions.");
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    if (upiId) {
      fetchTransactions();
    }
  }, [upiId]);

  const filteredTransactions = transactions.filter(
    (txn) =>
      txn.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.recipientUPI?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.senderUPI?.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="min-h-screen p-6 flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-6xl bg-gray-800 p-6 shadow-lg rounded-lg">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {bankDetails.bankName}
                </h1>
                <p className="text-sm text-gray-400">{bankDetails.website}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Statement Period</p>
              <p className="font-medium text-white">{bankDetails.period}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Account Holder</p>
                <p className="font-medium text-white">{user?.name || "N/A"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">UPI ID</p>
              <p className="font-medium text-white">{upiId || "N/A"}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Current Balance</p>
              <div className ="flex items-center mt-1">
                <IndianRupee className="w-5 h-5 text-gray-300" />
                <span className="text-3xl font-bold text-white">
                  {latestBalance}
                </span>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>
        {/* Transactions Table */}
        <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-600">
            <h2 className="text-lg font-semibold text-white">
              Transaction History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-600 text-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    UPI ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Credit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Deposit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading transactions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.createdAt
                          ? new Date(
                              transaction.createdAt.seconds * 1000
                            ).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {transaction.remarks || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {transaction.recipientUPI || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-500">
                        {transaction.senderUPI === upiId && transaction.amount
                          ? `₹${Math.abs(transaction.amount).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-500">
                        {transaction.senderUPI !== upiId && transaction.amount
                          ? `₹${transaction.amount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statement;
