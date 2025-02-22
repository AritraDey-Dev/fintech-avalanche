import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, ArrowRight, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { collection, query, where, getDocs, doc, runTransaction, addDoc, serverTimestamp } from "firebase/firestore";

import { db } from './firebase';
const TransactionSimulation = ({ upiId, amount, remarks, senderUPI, onClose }) => {
  const [currentStep, setCurrentStep] = useState('details')
  const [isLoading, setIsLoading] = useState(false)



  const findUserByUPI = async (upiId) => {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("upiId", "==", upiId));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id; // Return the user's UID (document ID)
    }
    return null; // No user found
  };
  
  const handleConfirm = async () => {
    setIsLoading(true);
    setCurrentStep("processing");
  
    try {
      // Find the sender and recipient UIDs by their UPI IDs
      const senderUID = await findUserByUPI(senderUPI);
      const recipientUID = await findUserByUPI(upiId);
  
      if (!senderUID) throw new Error("Sender does not exist");
      if (!recipientUID) throw new Error("Recipient does not exist");
  
      // Reference sender and recipient docs
      const senderRef = doc(db, "users", senderUID);
      const recipientRef = doc(db, "users", recipientUID);
  
      console.log("Sender UID:", senderUID, "Recipient UID:", recipientUID);
  
      // Run transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        const senderDoc = await transaction.get(senderRef);
        const recipientDoc = await transaction.get(recipientRef);
  
        if (!senderDoc.exists()) throw new Error("Sender does not exist");
        if (!recipientDoc.exists()) throw new Error("Recipient does not exist");
  
        const senderData = senderDoc.data();
        if (senderData.balance < amount) throw new Error("Insufficient balance");
  
        // Update balances
        transaction.update(senderRef, { balance: Number(senderData.balance) - Number(amount) });
        transaction.update(recipientRef, { balance: Number(recipientDoc.data().balance) + Number(amount) });

  
        // Add transaction record
        await addDoc(collection(db, "transactions"), {
          amount: Number(amount),
          recipientUPI: upiId,
          senderUPI: senderUPI,
          remarks: remarks,
          createdAt: serverTimestamp(),
        });
      });
  
      setCurrentStep("success");
    } catch (error) {
      console.error("Transaction error:", error);
      setCurrentStep("error");
    } finally {
      setIsLoading(false);
    }
  };
  


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 15,
        stiffness: 300
      }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { 
        type: 'spring',
        damping: 15,
        stiffness: 300
      }
    }
  }

  const DetailItem = ({ label, value }) => (
    <motion.div 
      className="flex items-center justify-between space-x-4 bg-gray-800 bg-opacity-50 p-4 rounded-2xl backdrop-blur-sm"
      variants={itemVariants}
    >
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </motion.div>
  )

  const renderContent = () => {
    switch (currentStep) {
      case 'details':
        return (
          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <DetailItem label="Recipient UPI ID" value={upiId} />
            <DetailItem label="Sender UPI ID" value={senderUPI} />
            <DetailItem label="Amount" value={`₹${amount}`} />
            <DetailItem label="Remarks" value={remarks} />
            <motion.div className="flex justify-center mt-8" variants={itemVariants}>
              <Button
                onClick={handleConfirm}
                className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Confirm Transaction <ArrowRight className="ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )
      case 'processing':
        return (
          <motion.div 
            className="flex flex-col items-center justify-center h-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Loader2 className="w-24 h-24 text-blue-500 animate-spin mb-8" />
            <p className="text-2xl font-semibold text-white mb-4">Processing Transaction</p>
            <p className="text-gray-400 text-center">Please wait while we secure your transaction</p>
          </motion.div>
        )
      case 'success':
        return (
          <motion.div 
            className="flex flex-col items-center justify-center h-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
            >
              <CheckCircle className="w-32 h-32 text-green-500 mb-8" />
            </motion.div>
            <p className="text-3xl font-bold text-white mb-4">Transaction Successful!</p>
            <p className="text-xl text-gray-400 mb-2">Amount: ₹{amount}</p>
            <p className="text-xl text-gray-400 mb-8">Recipient: {upiId}</p>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Close
            </Button>
          </motion.div>
        )
      case 'error':
        return (
          <motion.div 
            className="flex flex-col items-center justify-center h-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          >
            <motion.div 
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
            >
              <XCircle className="w-32 h-32 text-red-500 mb-8" />
            </motion.div>
            <p className="text-3xl font-bold text-white mb-4">Transaction Failed</p>
            <p className="text-xl text-gray-400 mb-8">Please try again later</p>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Close
            </Button>
          </motion.div>
        )
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="bg-blue-600 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">UPI Transaction Details</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-blue-700 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="p-8">
            {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TransactionSimulation

