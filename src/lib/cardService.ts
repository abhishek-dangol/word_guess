import { supabase } from "./supabase";
import type { CardData } from "../types/game";

export async function getRandomCard(
  categories: string[],
): Promise<CardData | null> {
  try {
    console.log("Attempting to fetch card from Supabase...");

    // Get total count first for selected categories
    const { count } = await supabase
      .from("carddata")
      .select("*", { count: "exact", head: true })
      .in("category", categories);

    if (!count) {
      console.error("No cards found in selected categories");
      return null;
    }

    // Get a random record using offset
    const randomIndex = Math.floor(Math.random() * count);
    const { data, error } = await supabase
      .from("carddata")
      .select("*")
      .in("category", categories)
      .range(randomIndex, randomIndex)
      .single();

    if (error) {
      console.error("Error fetching card:", error.message);
      console.error("Error details:", error);
      return null;
    }

    if (!data) {
      console.error("No data returned from Supabase");
      return null;
    }

    console.log("Raw data from Supabase:", data);

    // Parse the hintwords string into an array
    const hintwordsArray =
      typeof data.hintwords === "string"
        ? JSON.parse(data.hintwords)
        : data.hintwords;

    const card: CardData = {
      cardnumber: data.cardnumber,
      tabooword: data.tabooword,
      hintwords: hintwordsArray,
      category: data.category,
    };

    console.log("Processed card:", card);
    return card;
  } catch (error) {
    console.error("Error in getRandomCard:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
}
