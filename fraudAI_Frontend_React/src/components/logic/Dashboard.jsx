import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Header from "./Header.jsx";
import SidebarContent from "./SidebarContent";
import { handleGoogleSignIn } from "./auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IndianRupee, CreditCard, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";
import {
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { useUser } from "@/context/user/index.jsx";
import { useNavigate } from "react-router-dom";

const transactionData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

const spendingData = [
  { name: "Food", value: 400 },
  { name: "Transport", value: 300 },
  { name: "Shopping", value: 300 },
  { name: "Bills", value: 200 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const Dashboard = () => {
  const { user, upiId, setUser, setUpiId } = useUser();
  const [balance, setBalance] = useState(0);
  const [transaction, setTransaction] = useState([]);
  const [monthly, setmonthly] = useState(0);
  const [transactionData, setTransactionData] = useState([]);
  const navigate = useNavigate();
  console.log(transaction);

  const fetchTransactions = async (user, upiId) => {
    if (!user) return; // Ensure user is defined

    const transactionsCollection = collection(db, "transactions");

    // Queries for both sent and received transactions
    const sentQuery = query(
      transactionsCollection,
      where("senderUPI", "==", upiId)
    );
    const receivedQuery = query(
      transactionsCollection,
      where("recipientUPI", "==", upiId)
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery),
    ]);

    const sentTransactions = sentSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "sent",
      ...doc.data(),
    }));

    const receivedTransactions = receivedSnapshot.docs.map((doc) => ({
      id: doc.id,
      type: "received",
      ...doc.data(),
    }));

    setTransaction([...sentTransactions, ...receivedTransactions]);
    setmonthly(sentTransactions.reduce((acc, curr) => acc + curr.amount, 0));
    setTransactionData(
      sentTransactions.map((item) => ({
        name: item.createdAt
          ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("en-IN")
          : "N/A",
        value: item.amount,
      }))
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUpiId(userDoc.data().upiId);
          setBalance(userDoc.data().balance);
        }
      } else {
        setUser(null);
        setUpiId("");
        setBalance(0);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    if ((user, upiId)) {
      fetchTransactions(user, upiId);
    }
  }, [user, upiId]);
  const TransactionChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={transactionData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-gray-800 border border-gray-700 p-2 rounded-lg">
                  <p className="text-blue-400">{`₹${payload[0].value}`}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const SpendingPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={spendingData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {spendingData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-gray-800 border border-gray-700 p-2 rounded-lg">
                  <p className="text-blue-400">{`${payload[0].name}: ₹${payload[0].value}`}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          formatter={(value, entry, index) => (
            <span className="text-gray-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="hidden md:flex flex-col w-72 min-h-screen border-r border-gray-800 bg-gray-900">
        <SidebarContent />
      </aside>
      <div className="flex-1 p-6 overflow-y-auto">
        <Header user={user} onSignIn={handleGoogleSignIn} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-6"
        >
          <div className="flex items-center space-x-4 mt-4">
            <Avatar className="h-12 w-12 ring-2 ring-blue-500">
              <AvatarImage src={user?.photoURL} alt={user?.displayName} />
              <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-blue-400">
                {user?.displayName}
              </h2>
              <p className="text-sm text-gray-400">UPI ID: {upiId}</p>
            </div>
          </div>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Balance",
              icon: IndianRupee,
              value: balance.toFixed(2),
              color: "blue",
            },
            {
              title: "Monthly Spending",
              icon: CreditCard,
              value: monthly.toFixed(2),
              color: "green",
            },
            {
              title: "Total Transactions",
              icon: Activity,
              value: transaction.length,
              color: "purple",
            },
            {
              title: "Cashback Earned",
              icon: Zap,
              value: (balance * 0.02).toFixed(2),
              color: "yellow",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    {item.title}
                  </CardTitle>
                  <item.icon className={`h-4 w-4 text-${item.color}-400`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold text-${item.color}-400`}>
                    {item.title === "Total Transactions"
                      ? item.value
                      : `₹${item.value}`}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-400">
                Spending History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionChart />
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-400">
                Spending Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingPieChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
