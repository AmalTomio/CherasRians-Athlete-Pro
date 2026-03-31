export const SPORT_META = {
  football: {
    categories: ["U-15", "U-18"],
    positions: [
      "Goal Keeper (GK)",
      "Left Back (LB)",
      "Left Wing Back (LWB)",
      "Center Back (CB)",
      "Right Back (RB)",
      "Right Wing Back (RWB)",
      "Center Defensive Midfielder (CDM)",
      "Center Midfielder (CM)",
      "Left Midfielder (LM)",
      "Right Midfielder (RM)",
      "Centre Attacking Midfielder (CAM)",
      "Right Wing (RW)",
      "Left Wing (LW)",
      "Center Forward (CF)",
      "Second Striker (SS)",
      "Striker (ST)",
    ],
  },

  sepak_takraw: {
    categories: ["U-15", "U-18"],
    positions: ["Tekong", "Feeder", "Killer"],
  },

  volleyball: {
    categories: ["U-15", "U-18"],
    positions: [
      "Setter",
      "Libero",
      "Outsider Hitter",
      "Opposite Hitter",
      "Middle Blocker",
      "Serve Specialist",
    ],
  },

  badminton: {
    categories: ["U-15", "U-18"],
    positions: [], // no real "position", uses category instead
    badmintonCategories: [
      "Men Single",
      "Men Double",
      "Women Single",
      "Women Double",
      "Mixed Double",
    ],
  },

  netball: {
    categories: ["U-15", "U-18"],
    positions: [
      "Goal Shooter",
      "Goal Attack",
      "Wing Attack",
      "Centre",
      "Wing Defence",
      "Goal Defence",
      "Goal Keeper",
    ],
  },
};

export const SPORT_STATS = {
  football: ["goals", "assists", "tackles"],
  volleyball: ["kills", "blocks", "aces"],
  badminton: ["points", "errors"],
  netball: ["goals", "interceptions"],
  sepak_takraw: ["spikes", "serves", "blocks"],
};

export const SPORT_DRILLS = {
  football: [
    "Cone Dribbling",
    "Close Control Dribbling",
    "1v1 Dribbling",
    "Short Passing",
    "One-Touch Passing",
    "Triangle Passing",
    "Wall Pass",
    "Shooting Practice",
    "Finishing",
    "Volley Shooting",
    "1v1 Defending",
    "Shuttle Run",
  ],

  volleyball: [
    "Forearm Passing",
    "Wall Passing",
    "Setting Practice",
    "Partner Setting",
    "Spiking Approach",
    "Hit & Recover",
    "Serving Practice",
    "Target Serving",
    "Blocking Footwork",
    "Defense Digging",
    "Reaction Drill",
  ],

  sepak_takraw: [
    "Ball Control",
    "Inside Passing",
    "Outside Passing",
    "Head Passing",
    "Serve Practice",
    "Target Serving",
    "Feeding Drill",
    "Spike Drill",
    "Blocking Drill",
    "Receiving Drill",
    "Reaction Drill",
  ],

  netball: [
    "Chest Pass",
    "Bounce Pass",
    "Overhead Pass",
    "Wall Passing",
    "Shooting Close",
    "Long Shot",
    "Footwork",
    "Dodging",
    "Marking",
    "Interception",
    "3-Pass Game",
    "Shuttle Run",
  ],
};