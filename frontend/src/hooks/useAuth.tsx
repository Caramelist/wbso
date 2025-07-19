'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole, SubscriptionTier } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Auth Provider
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');

  // Create or update user profile in Firestore
  const createUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update existing user's last login
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        photoURL: firebaseUser.photoURL,
        displayName: firebaseUser.displayName,
      });
      return userSnap.data() as User;
    } else {
      // Create new user profile
      const newUser: Omit<User, 'uid'> = {
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        role: 'individual' as UserRole,
        subscription: 'free' as SubscriptionTier,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        settings: {
          language: 'nl',
          notifications: {
            email: true,
            browser: true,
            applicationUpdates: true,
            teamUpdates: true,
          },
          ui: {
            theme: 'auto',
            compactMode: false,
          },
        },
      };

      await setDoc(userRef, newUser);
      
      // Return the created user with uid
      return {
        uid: firebaseUser.uid,
        ...newUser,
      } as User;
    }
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { uid: firebaseUser.uid, ...userSnap.data() } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (): Promise<void> => {
    if (!auth) {
      toast.error('Authentication not available in demo mode');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      if (firebaseUser) {
        const userProfile = await createUserProfile(firebaseUser);
        setUser(userProfile);
        
        toast.success(`Welcome ${userProfile.displayName || userProfile.email}!`);
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      setError(error.message || 'Failed to sign in with Google');
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    if (!auth) {
      toast.error('Authentication not available in demo mode');
      return;
    }

    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      toast.success('Successfully signed out');
    } catch (error: any) {
      console.error('Error signing out:', error);
      setError(error.message || 'Failed to sign out');
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (!db) {
      toast.error('Database not available in demo mode');
      return;
    }
    if (!user) throw new Error('No user logged in');
    
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      setError(error.message || 'Failed to update profile');
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data from Firestore
  const refreshUser = async (): Promise<void> => {
    if (!firebaseUser) return;
    
    try {
      const userProfile = await fetchUserProfile(firebaseUser);
      if (userProfile) {
        setUser(userProfile);
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      setError(error.message || 'Failed to refresh user data');
    }
  };

  // Listen to Firebase Auth state changes
  useEffect(() => {
    // If Firebase is not available (development mode without config), just set loading to false
    if (!auth) {
      console.log('🔥 Firebase Auth not available - running in demo mode');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      
      try {
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          const userProfile = await fetchUserProfile(firebaseUser);
          
          if (userProfile) {
            setUser(userProfile);
          } else {
            // User exists in Firebase Auth but not in Firestore
            const newUserProfile = await createUserProfile(firebaseUser);
            setUser(newUserProfile);
          }
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      } catch (error: any) {
        console.error('Auth state change error:', error);
        setError(error.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    signInWithGoogle,
    logout,
    updateUserProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth; 