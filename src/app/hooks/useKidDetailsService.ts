import { useLanguage } from "@/app/context/LanguageContext";
import { KidDetails } from "@/models";
import { firestoreService } from "@/app/services/firestore.service";
import { processKidDetails, processKidDetailsArray } from "../middleware/kidDetailsMiddleware";
import { useCallback } from "react";

/**
 * A hook that provides KidDetails-related services with automatic name property handling
 * All methods automatically apply the name property based on the current language
 */
export function useKidDetailsService() {
  const { language } = useLanguage();
  
  /**
   * Get a kid's details by ID with name property populated
   */
  const getKid = useCallback(async (kidId: string) => {
    const kidDetails = await firestoreService.getKid(kidId);
    return processKidDetails(kidDetails, language);
  }, [language]);
  
  /**
   * Get all kids for an account with name properties populated
   */
  const getKids = useCallback(async (accountId: string) => {
    const kids = await firestoreService.getKids(accountId);
    return processKidDetailsArray(kids, language);
  }, [language]);
  
  /**
   * Save a kid's details, ensuring name property is set correctly on return
   */
  const saveKid = useCallback(async (kidDetails: KidDetails, avatarUrl?: string) => {
    // Save the kid details
    const kidId = await firestoreService.saveKid(kidDetails, avatarUrl);
    
    // Fetch the updated kid details to get the complete object back
    if (kidId) {
      return getKid(kidId);
    }
    
    return null;
  }, [getKid]);

  return {
    getKid,
    getKids,
    saveKid
  };
} 