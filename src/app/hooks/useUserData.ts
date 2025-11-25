import { useEffect, useCallback } from 'react';
import useUserState from '../state/user-state';
import useKidsState from '../state/kids-state';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook that provides access to user data, kids data, and related actions
 * This hook combines the authentication context with Zustand state stores
 */
export function useUserData() {
  const { currentUser, firebaseUser } = useAuth();
  
  // Get user-related state and actions from our Zustand store
  const { 
    userData,
    isNewUser,
    isLoading: isLoadingUser,
    isFetchingUserData,
    error: userError,
    fetchUserData, 
    updateUserInFirestore, 
  } = useUserState();
  
  // Get kids-related state from our Zustand store
  const { 
    kids, 
    isLoading: isLoadingKids,
    error: kidsError,
    lastFetched: kidsLastFetched,
    fetchKids,
    deleteKid
  } = useKidsState();
  
  // Auto-fetch user and kids data
  useEffect(() => {
    // Fetch user data if we have a firebase user but no local user data yet
    if (firebaseUser && !userData && !isFetchingUserData) {
      fetchUserData(firebaseUser);
    }

    // Fetch kids data if user is loaded and kids data is stale or missing
    const shouldFetchKids =
      userData?.uid &&
      (!kidsLastFetched || Date.now() - kidsLastFetched > 5 * 60 * 1000); // 5-minute cache

    if (shouldFetchKids) {
      fetchKids(userData.uid);
    }
  }, [firebaseUser, userData, isFetchingUserData, kidsLastFetched, fetchUserData, fetchKids]);
  
  // Memoize refreshKids to prevent infinite loops
  const refreshKids = useCallback(() => {
    if (userData?.uid) {
      fetchKids(userData.uid);
    } else {
      console.warn("refreshKids called without userData.uid");
    }
  }, [userData?.uid, fetchKids]);
  
  // Memoize refreshUserData to prevent unnecessary re-renders
  const refreshUserData = useCallback(() => {
    if (firebaseUser) {
      fetchUserData(firebaseUser);
    }
  }, [firebaseUser, fetchUserData]);
  
  // Return a combined object with all user and kids data and actions
  return {
    // User and auth data
    user: currentUser,
    firebaseUser,
    userData,
    isNewUser,
    isLoading: isLoadingUser || isLoadingKids || isFetchingUserData,
    error: userError || kidsError,
    
    // Kids data
    kids,
    hasKids: kids.length > 0,
    kidsLoaded: kidsLastFetched !== null,
    
    // Actions
    updateUser: updateUserInFirestore,
    refreshUserData: firebaseUser ? refreshUserData : undefined,
    refreshKids,
    deleteKid: (kidId: string) => deleteKid(kidId),
  };
}

export default useUserData; 