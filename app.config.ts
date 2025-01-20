import "dotenv/config";

export default {
  expo: {
    name: "Word Guess Game",
    slug: "word-guess-game",
    // ... other expo config ...
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
