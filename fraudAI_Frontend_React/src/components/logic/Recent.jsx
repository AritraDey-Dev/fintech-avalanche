"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import Header from "./Header"
import SidebarContent from "./SidebarContent"
import { db } from './firebase' // Import your Firebase configuration
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { auth } from './firebase' // Import Firebase auth
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate



const RecentTransactions = () => {
  const [user, setUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [transactions, setTransactions] = useState([]) // State to hold transactions
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUser(prevUser => {
            // Only update if the data is actually different to avoid re-renders
            return JSON.stringify(prevUser) !== JSON.stringify(userDoc.data()) 
              ? userDoc.data() 
              : prevUser;
          });
          console.log(user);
        } else {
          console.error("User document does not exist");
        }
      } else {
        console.log("No user is currently logged in");
      }
    };

    const fetchTransactions = async () => {
      if (!user) return // Ensure user is defined
    
      const transactionsCollection = collection(db, "transactions");
    
      // Queries for both sent and received transactions
      const sentQuery = query(transactionsCollection, where("senderUPI", "==", user.upiId));
      const receivedQuery = query(transactionsCollection, where("recipientUPI", "==", user.upiId));
    
      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);
    
      const sentTransactions = sentSnapshot.docs.map(doc => ({
        id: doc.id,
        type: "sent",
        ...doc.data()
      }));
    
      const receivedTransactions = receivedSnapshot.docs.map(doc => ({
        id: doc.id,
        type: "received",
        ...doc.data()
      }));
    
      // Combine and sort transactions by timestamp (latest first)
      const allTransactions = [...sentTransactions, ...receivedTransactions].sort(
        (a, b) => b.createdAt.seconds - a.createdAt.seconds
      );
    
      setTransactions(allTransactions);
    };
    

    fetchUserData().then(fetchTransactions) // Fetch user data and then transactions
  }, [user]) // Dependency on user

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.recipientUPI.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.senderUPI.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.amount.toString().includes(searchTerm) ||
      transaction.remarks.toLowerCase().includes(searchTerm.toLowerCase())
  )

  console.log(filteredTransactions , "hello");

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 min-h-screen border-r border-gray-800 bg-gray-900">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <Header user={user} />

        {/* Recent Transactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 space-y-6"
        >
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold text-gray-100">Recent Transactions</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-8 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 ">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-lg   transition-colors duration-200 flex group " >
                  <Card  className="bg-gray-700 border-gray-600 hover:bg-gray-600   flex justify-between w-full peer transition-all duration-600 ease-in-out  hover:scale-105">
                    <CardContent className="flex items-center justify-between p-4  w-full ">
                      <div className="flex items-center space-x-4  ">
                        <div className={`p-2 rounded-full ${transaction.type === 'received' ? 'bg-green-500' : 'bg-red-500'}`}>
                          {transaction.type === 'received' ? <ArrowDownLeft className="h-5 w-5 text-white" /> : <ArrowUpRight className="h-5 w-5 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-100">{transaction.type === 'received' ? transaction.senderUPI : transaction.recipientUPI}</p>
                          <p className="text-sm text-gray-400">{new Date(transaction.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${transaction.type === 'received' ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.type === 'received' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            transaction.status === "Completed"
                              ? "success"
                              : transaction.status === "Pending"
                              ? "warning"
                              : "destructive"
                          }
                          className="mt-1"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                          
                    </CardContent>
                  </Card>

                  {transaction.type !== 'received' && <Card  className="bg-blue-600  mt-4 ml-3 hover:bg-blue-800 h-0 w-0 group-hover:h-3/4 group-hover:w-[20%] hover:cursor-pointer hidden  content-center  justify-between peer-hover:block group-hover:block transition-all duration-600 ease-in-out  hover:scale-105 " 
                  onClick={() => navigate(`/complaint?receiverID=${transaction.recipientUPI}`)}
                  >

                    <CardContent className="flex items-center justify-between p-4  w-1/5 ">
                    <div className="di">Complaint</div>
                    </CardContent>
                    </Card>}
                    
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default RecentTransactions
