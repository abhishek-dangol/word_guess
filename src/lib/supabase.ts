import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key exists:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Please check your environment variables.",
  );
}

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection immediately
supabase
  .from("carddata")
  .select("count")
  .then(({ data, error }) => {
    if (error) {
      console.error("Supabase connection test failed:", error);
    } else {
      console.log("Supabase connection test successful:", data);
    }
  });

// Type definition for the scores table
export interface Score {
  id: string;
  score: number;
  skips: number;
  created_at: string;
}
