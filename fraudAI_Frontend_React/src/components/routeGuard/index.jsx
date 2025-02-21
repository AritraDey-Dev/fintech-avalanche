import { Navigate, useLocation } from "react-router-dom";

import { useUser } from "@/context/user";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../logic/firebase";

export default function RouteGuard({ element }) {
  const location = useLocation();
  const { user, setUser } = useUser();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);
  console.log("user: ", user);
  if (!user && !location.pathname.includes("/auth")) {
    return <Navigate to={"/auth"} />;
  } else if (user && location.pathname.includes("/auth")) {
    return <Navigate to={"/"} />;
  } else {
    return <>{element}</>;
  }
}
