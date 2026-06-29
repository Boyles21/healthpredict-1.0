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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import firebaseConfig from "../../firebase-applet-config.json";

export interface UserProfile {
  fullName: string;
  email: string;
  location: string;
  ethnicity: string;
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  medications: string;
  role?: "admin" | "user";
  disabled?: boolean;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
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
          let isOffline = false;
          
          try {
            userDocSnap = await getDoc(userDocRef);
            profileDocSnap = await getDoc(profileDocRef);
          } catch (err: any) {
            const isPermissionError = err?.code === 'permission-denied' || 
                                      err?.message?.toLowerCase().includes('permission') ||
                                      err?.message?.toLowerCase().includes('insufficient');
            if (isPermissionError) {
              handleFirestoreError(err, OperationType.GET, `users_profiles/${firebaseUser.uid}`);
            } else {
              console.warn("Firestore offline/unavailable or network error, attempting local cache fallback:", err);
              isOffline = true;
            }
          }
          
          const isAdminEmail = firebaseUser.email === "boluajisebutu45000@gmail.com" || firebaseUser.email === "anochieglory1@gmail.com";
          let dbRole: "admin" | "user" = isAdminEmail ? "admin" : "user";
          let isDisabled = false;

          // Force user doc creation in Firestore if it doesn't exist yet but user is active
          if (userDocSnap && !userDocSnap.exists()) {
            try {
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                fullName: firebaseUser.displayName || "Jane Doe",
                email: firebaseUser.email || "",
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                role: dbRole,
                disabled: false
              });
            } catch (err: any) {
              const isPermissionError = err?.code === 'permission-denied' || 
                                        err?.message?.toLowerCase().includes('permission') ||
                                        err?.message?.toLowerCase().includes('insufficient');
              if (isPermissionError) {
                handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
              } else {
                console.warn("Firestore offline while creating user doc:", err);
              }
            }
          } else if (userDocSnap && userDocSnap.exists()) {
            const uData = userDocSnap.data();
            dbRole = uData.role || (isAdminEmail ? "admin" : "user");
            isDisabled = !!uData.disabled;
            
            // Auto update role to admin if it's the bootstrapped administrator
            if (isAdminEmail && uData.role !== "admin") {
              dbRole = "admin";
            }

            // Update last login timestamp and enforce admin role if needed
            try {
              await updateDoc(userDocRef, {
                role: dbRole,
                lastLogin: serverTimestamp()
              });
            } catch (err: any) {
              const isPermissionError = err?.code === 'permission-denied' || 
                                        err?.message?.toLowerCase().includes('permission') ||
                                        err?.message?.toLowerCase().includes('insufficient');
              if (isPermissionError) {
                handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
              } else {
                console.warn("Firestore offline while updating user doc:", err);
              }
            }
          }

          if (isDisabled) {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            alert("This account has been suspended by the administrator.");
            return;
          }
          
          if (profileDocSnap && profileDocSnap.exists()) {
            const pData = profileDocSnap.data();
            const profile = {
              ...(pData as UserProfile),
              role: dbRole,
              disabled: isDisabled,
            };
            setUserProfile(profile);
            localStorage.setItem(`health_predict_profile_cache_${firebaseUser.uid}`, JSON.stringify(profile));
          } else {
            // Attempt to retrieve from local cache first if we are offline or have network issues
            let cachedProfile: UserProfile | null = null;
            try {
              const cached = localStorage.getItem(`health_predict_profile_cache_${firebaseUser.uid}`);
              if (cached) {
                cachedProfile = JSON.parse(cached);
              }
            } catch (e) {
              console.error("Failed to parse cached profile", e);
            }

            if (cachedProfile) {
              setUserProfile(cachedProfile);
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
                medications: "",
                role: dbRole,
                disabled: isDisabled,
              };
              
              if (!isOffline) {
                try {
                  await setDoc(profileDocRef, {
                    fullName: defaultProfile.fullName,
                    email: defaultProfile.email,
                    location: defaultProfile.location,
                    ethnicity: defaultProfile.ethnicity,
                    bloodType: defaultProfile.bloodType,
                    allergies: defaultProfile.allergies,
                    chronicConditions: defaultProfile.chronicConditions,
                    medications: defaultProfile.medications,
                    uid: firebaseUser.uid,
                    updatedAt: serverTimestamp()
                  });
                } catch (err: any) {
                  const isPermissionError = err?.code === 'permission-denied' || 
                                            err?.message?.toLowerCase().includes('permission') ||
                                            err?.message?.toLowerCase().includes('insufficient');
                  if (isPermissionError) {
                    handleFirestoreError(err, OperationType.CREATE, `profiles/${firebaseUser.uid}`);
                  } else {
                    console.warn("Firestore offline while saving profile:", err);
                  }
                }
              }
              
              setUserProfile(defaultProfile);
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
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        // If we get an invalid-credential error in the sandbox/testing project,
        // it means the account doesn't exist yet or has different credentials.
        // We attempt to automatically register them to create a seamless demo/test experience.
        try {
          const defaultName = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
          const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
          await register(email, password, formattedName || "Jane Doe");
          return;
        } catch (signupErr: any) {
          // If signup fails because email is indeed registered or password too weak,
          // throw an informative error so the user knows what to do instead of a cryptic one.
          if (signupErr.code === "auth/email-already-in-use" || signupErr.message?.includes("email-already-in-use")) {
            const friendlyErr = new Error("This email is already registered. If you signed up with Google, please use 'Continue with Google'. Otherwise, please check your password or use 'Forgot Password'.");
            (friendlyErr as any).code = "auth/invalid-credential";
            throw friendlyErr;
          }
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
      const isAdminEmail = email === "boluajisebutu45000@gmail.com" || email === "anochieglory1@gmail.com";
      const dbRole: "admin" | "user" = isAdminEmail ? "admin" : "user";
      try {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          uid: firebaseUser.uid,
          fullName: fullName,
          email: email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: dbRole,
          disabled: false
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
        medications: "",
        role: dbRole,
        disabled: false
      };

      try {
        await setDoc(doc(db, "profiles", firebaseUser.uid), {
          fullName: defaultProfile.fullName,
          email: defaultProfile.email,
          location: defaultProfile.location,
          ethnicity: defaultProfile.ethnicity,
          bloodType: defaultProfile.bloodType,
          allergies: defaultProfile.allergies,
          chronicConditions: defaultProfile.chronicConditions,
          medications: defaultProfile.medications,
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

  const loginAsDemo = async () => {
    const dbId = (firebaseConfig.firestoreDatabaseId || "default").replace(/[^a-zA-Z0-9]/g, "");
    const demoEmail = `demo_${dbId}@healthpredict.org`;
    const demoPassword = "demoPassword123";

    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        try {
          await register(demoEmail, demoPassword, "Demo User");
        } catch (regErr: any) {
          if (regErr.code === "auth/email-already-in-use") {
            throw new Error("This demo account exists with a different security code. Please use a standard email signup.");
          }
          throw regErr;
        }
      } else {
        throw err;
      }
    }
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
        await updateDoc(userDocRef, {
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
      loginAsDemo,
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
