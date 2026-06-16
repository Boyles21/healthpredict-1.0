import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";

export interface UserProfile {
  fullName: string;
  email: string;
  location: string;
  ethnicity: string;
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  medications: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setUserProfileStateDirectly: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isRegistering = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Skip document fetching/fallback creations during active registration
        // to prevent race conditions. The register function itself handles document setup.
        if (isRegistering.current) {
          setLoading(false);
          return;
        }

        try {
          // Fetch additional user bio and physical profile
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const profileDocRef = doc(db, "profiles", firebaseUser.uid);
          
          let userDocSnap;
          let profileDocSnap;
          
          try {
            userDocSnap = await getDoc(userDocRef);
            profileDocSnap = await getDoc(profileDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users_profiles/${firebaseUser.uid}`);
          }
          
          if (profileDocSnap && profileDocSnap.exists()) {
            setUserProfile(profileDocSnap.data() as UserProfile);
          } else {
            // First time login or fallback: create default profile in Firestore
            const defaultProfile: UserProfile = {
              fullName: firebaseUser.displayName || "Jane Doe",
              email: firebaseUser.email || "jane@example.com",
              location: "North America",
              ethnicity: "Prefer not to say",
              bloodType: "Unknown",
              allergies: "",
              chronicConditions: "",
              medications: ""
            };
            
            try {
              await setDoc(profileDocRef, {
                ...defaultProfile,
                uid: firebaseUser.uid,
                updatedAt: serverTimestamp()
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `profiles/${firebaseUser.uid}`);
            }
            
            setUserProfile(defaultProfile);
          }
          
          // Force user doc creation in Firestore if it doesn't exist yet but user is active
          if (userDocSnap && !userDocSnap.exists()) {
            try {
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                fullName: firebaseUser.displayName || "Jane Doe",
                email: firebaseUser.email || "",
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
            }
          } else if (userDocSnap && userDocSnap.exists()) {
            // Update last login timestamp
            try {
              await setDoc(userDocRef, {
                ...userDocSnap.data(),
                lastLogin: serverTimestamp()
              }, { merge: true });
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
            }
          }
          
        } catch (error) {
          console.error("Error setting up user documents on auth change:", error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") {
        // If we get an invalid-credential error in the sandbox/testing project,
        // it means the account doesn't exist yet or has different credentials.
        // We attempt to automatically register them to create a seamless demo/test experience.
        try {
          const defaultName = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
          const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
          await register(email, password, formattedName || "Jane Doe");
          return;
        } catch (signupErr) {
          // If signup fails (e.g. because email is indeed registered or password too weak),
          // throw the original credential error to remain standard-compliant.
          throw err;
        }
      }
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    isRegistering.current = true;
    try {
      // 1. Create firebase auth record
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;

      // Update auth profile display name early so onAuthStateChanged or Google logins remain aligned
      try {
        await updateProfile(firebaseUser, { displayName: fullName });
      } catch (err) {
        console.error("Failed to update displayName on auth object:", err);
      }

      // 2. Create the users collection tracking record
      try {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          uid: firebaseUser.uid,
          fullName: fullName,
          email: email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
      }

      // 3. Create the profiles collection clinical record
      const defaultProfile: UserProfile = {
        fullName: fullName,
        email: email,
        location: "North America",
        ethnicity: "Prefer not to say",
        bloodType: "Unknown",
        allergies: "",
        chronicConditions: "",
        medications: ""
      };

      try {
        await setDoc(doc(db, "profiles", firebaseUser.uid), {
          ...defaultProfile,
          uid: firebaseUser.uid,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `profiles/${firebaseUser.uid}`);
      }

      setUserProfile(defaultProfile);
    } finally {
      isRegistering.current = false;
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (profileUpdates: Partial<UserProfile>) => {
    if (!user || !userProfile) throw new Error("No active user session found");
    
    const mergedProfile = {
      ...userProfile,
      ...profileUpdates,
      uid: user.uid,
      updatedAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, "profiles", user.uid), mergedProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `profiles/${user.uid}`);
    }

    // Update the basic user document too, to keep clinical profile and system account fields synchronous
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        await setDoc(userDocRef, {
          ...userData,
          fullName: profileUpdates.fullName || userProfile.fullName,
          lastLogin: serverTimestamp() // needed to satisfy security rule: incoming().lastLogin == action timestamp
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }

    // Also update auth displayName
    if (profileUpdates.fullName) {
      try {
        await updateProfile(user, { displayName: profileUpdates.fullName });
      } catch (err) {
        console.error("Failed to update display name in Auth:", err);
      }
    }

    setUserProfile({
      ...userProfile,
      ...profileUpdates
    });
  };

  const setUserProfileStateDirectly = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      login, 
      register, 
      loginWithGoogle,
      logout, 
      resetPassword, 
      updateUserProfile, 
      setUserProfileStateDirectly 
    }}>
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
