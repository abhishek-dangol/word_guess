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
  selectedSet: string;
}

export interface GameSession {
  timestamp: number;
  teamSettings: {
    team1Name: string;
    team1Players: string[];
    team2Name: string;
    team2Players: string[];
  };
  gameSettings: {
    selectedCategories: string[];
    selectedSet: string;
  };
  settings: {
    maxSkips: number;
    roundDuration: number;
  };
}
