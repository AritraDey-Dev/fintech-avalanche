import { Navigate, useLocation } from "react-router-dom";

import { useUser } from "@/context/user";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../logic/firebase";
import Loader from "../loader";

export default function RouteGuard({ element }) {
  const location = useLocation();
  const { user, setUser, upiId, setUpiId } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        const diff = new Date().getTime() - currentUser?.metadata?.lastLoginAt;

        if (diff > 10 * 60 * 1000) {
          await signOut(auth);
          setUser(null);
          setUpiId("");
          console.log("Diff", diff);
        } else {
          console.log("Diff", diff);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);
  if (isLoading) {
    return <Loader />;
  }
  if (!user && !location.pathname.includes("/auth")) {
    return <Navigate to={"/auth"} />;
  } else if (user && location.pathname.includes("/auth")) {
    return <Navigate to={"/"} />;
  } else {
    return <>{element}</>;
  }
}
