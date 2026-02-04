import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isAdmin?: boolean;
  plan?: {
    name: string;
    expiresAt: Date;
    isActive?: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updatePlan: (planName: string, days: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert Firebase user to our User type
async function getUserData(firebaseUser: FirebaseUser): Promise<User> {
  const userDocRef = doc(db, "users", firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: data.name || firebaseUser.displayName || "User",
      avatar: data.avatar || firebaseUser.photoURL || undefined,
      isAdmin: data.isAdmin || false,
      plan: data.subscription ? {
        name: data.subscription.plan,
        expiresAt: data.subscription.expiresAt?.toDate(),
        isActive: data.subscription.isActive,
      } : undefined,
    };
  }
  
  // If no Firestore doc exists, create one
  const newUser = {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: firebaseUser.displayName || "User",
    avatar: firebaseUser.photoURL || undefined,
    isAdmin: false,
    createdAt: new Date(),
  };
  
  await setDoc(userDocRef, newUser);
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: firebaseUser.displayName || "User",
    avatar: firebaseUser.photoURL || undefined,
    isAdmin: false,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser);
          // Check if plan is expired
          if (userData.plan?.expiresAt && new Date(userData.plan.expiresAt) < new Date()) {
            userData.plan = undefined;
          }
          setUser(userData);
        } catch (error) {
          console.error("Error getting user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUserData(result.user);
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName: name });
      
      // Create user document in Firestore
      const userDocRef = doc(db, "users", result.user.uid);
      await setDoc(userDocRef, {
        name,
        email,
        isAdmin: false,
        createdAt: new Date(),
      });
      
      setUser({
        id: result.user.uid,
        email,
        name,
        isAdmin: false,
      });
      
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = await getUserData(result.user);
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      return false;
    }
  };

  const updatePlan = async (planName: string, days: number) => {
    if (!user) return;
    
    const expiresAt = new Date();
    if (days === -1) {
      // Lifetime
      expiresAt.setFullYear(expiresAt.getFullYear() + 100);
    } else {
      expiresAt.setDate(expiresAt.getDate() + days);
    }
    
    const subscription = {
      plan: planName,
      expiresAt,
      isActive: true,
    };
    
    // Update Firestore
    const userDocRef = doc(db, "users", user.id);
    await updateDoc(userDocRef, { subscription });
    
    setUser({
      ...user,
      plan: {
        name: planName,
        expiresAt,
        isActive: true,
      },
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, loginWithGoogle, logout, resetPassword, updatePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
