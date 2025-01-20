export interface TeamSettings {
  team1Name: string;
  team2Name: string;
  playersPerTeam: number;
  team1Players: string[];
  team2Players: string[];
}

export interface CardData {
  cardnumber: number;
  tabooword: string;
  hintwords: string[];
  category: string;
  set: string;
}

export interface GameSettings {
  teamSettings: TeamSettings;
  selectedCategories: string[];
}
