import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Load the mapped transactions JSON
import mappedTransactions from "./mapped_transactions.json"; // Ensure this path is correct

// Helper function to generate unique UPI ID
const generateUPIId = (name) => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  const baseName = name.split(" ")[0].toLowerCase(); // First name in lowercase
  return `${baseName}${randomSuffix}@expressbank`;
};

// Function to randomly assign a transaction to a user
const getRandomTransaction = () => {
  const randomIndex = Math.floor(Math.random() * mappedTransactions.length);
  return mappedTransactions[randomIndex];
};

// Function to handle Google Sign-In
export const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // First-time user
        const upiId = generateUPIId(user.displayName || "user");

        // Get a random transaction from the mapped transactions
        const { user_friendly, model_processed } = getRandomTransaction();

        await setDoc(userRef, {
          balance: 1000000,
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          upiId: upiId,
          createdAt: serverTimestamp(),
          transactionDetails: user_friendly, // Save user-friendly transaction details
          modelData: model_processed, // Save model-processed transaction details
        });

        console.log("New user created with UPI ID:", upiId);
        console.log("Assigned Transaction Details:", user_friendly);
      } else {
        // Returning user
        const userData = userDoc.data();
        console.log("User already exists:", userData);
      }
    }
  } catch (error) {
    console.error("Google Sign-In Error:", error);
  }
};
