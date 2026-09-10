const HEADER_ROW = 'Player,Team,League,Position,Age,Performance Index,Minutes played,Possessions won per 90,Defensive duels per 90,Aerial duels per 90,Sliding tackles per 90,Sliding tackles (PAdj),Shots blocked per 90,Interceptions per 90,Interceptions (PAdj),Successful attacking actions per 90,Goals per 90,Non-penalty goals per 90,xG per 90,Headed goals per 90,Shots per 90,Assists per 90,Crosses per 90,Crosses to box per 90,Dribbles attempted per 90,Offensive duels per 90,Touches in box per 90,Progressive carries per 90,Accelerations per 90,Fouls suffered per 90,Passes per 90,Forward passes per 90,Short passes per 90,Long passes per 90,Average pass length (m),xA per 90,Shot assists per 90,Key passes per 90,Passes to final third per 90,Passes to penalty box per 90,Through passes per 90,Deep completions per 90,Progressive passes per 90,Shots conceded per 90,Clean sheets,xG conceded per 90,Prevented goals per 90,Exits per 90,Defensive duels won %,Aerial duels won %,Shots on target %,Goal conversion %,Cross accuracy %,Dribble success rate %,Offensive duels won %,Pass completion %,Forward pass completion %,Short pass completion %,Long pass accuracy %,Pass completion (to final third) %,Pass completion (to penalty box) %,Through pass completion %,Progressive pass accuracy %,Save percentage %,Free kicks per 90,Direct free kicks per 90,Direct free kicks oT %,Corners per 90,Penalties attempted,Penalty success rate %,Matches played,Duels per 90,Duels won %,Possession +/-,Forward pass ratio,xA per 100 passes,Chance creation ratio,Inaccurate passes %,Goals + Assists per 90,NPG+A per 90,xG+xA per 90,xG/Shot,Goals - xG per 90,Goals per xG,Assists - xA per 90,Assists per xA,Successful dribbles per 90,Shots on target per 90,Accurate crosses per 90,Offensive duels won per 90,Defensive duels won per 90,Aerial duels won per 90,Passes completed per 90,Forward passes completed per 90,Short passes completed per 90,Long passes completed per 90,Accurate passes to final third per 90,Accurate passes to pen box per 90,Through passes completed per 90,Progressive passes completed per 90,Misplaced passes per 90,Saves per 90,Possessions lost per 90,Possessions won - lost per 90,Progressive actions per 90,Duels won per 90,Minutes per match,Backward pass ratio,Penalties scored,npxG per 90,npxG/Shot,npxG+xA per 90,Touches per 90,Progressive action rate,Progressive passes (PAdj),Ball-carrying frequency,xG per 100 touches,Shot frequency,Dribbles per 100 touches,Goals per 100 touches,Passes received per 90,Backward passes per 90,Pre-assists per 90';

const NON_CONVERTIBLE_COLUMNS = new Set([5, 6, 11, 14, 34, 44, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 66, 68, 69, 70, 72, 73, 74, 75, 76, 81, 83, 85, 106, 107, 108, 110, 113, 114, 115, 116, 117, 118, 119]);
const TWO_DECIMAL_TOTAL = new Set([18, 35, 45, 46, 80, 82, 84, 109, 111]);
const MINMAX_BAR_COLUMNS = new Set([46, 73, 82, 84, 103]);
const GOAL_CONVERSION_INDEX = 51;
const PERFORMANCE_INDEX = 5;
const MINUTES_INDEX = 6;
const VIRTUAL_BUFFER = 12;
const METRIC_A_COLOR = 'rgba(52, 152, 219, 0.9)';
const METRIC_B_COLOR = 'rgba(46, 204, 113, 0.9)';
const MATCH_BAR_COLOR = 'rgba(230, 126, 34, 0.92)';

const INDIVIDUAL_POSITIONS = [
    { value: 'Goalkeeper', i18n: 'positions.goalkeeper', label: 'Goalkeeper' },
    { value: 'Centre-back', i18n: 'positions.centreback', label: 'Centre-back' },
    { value: 'Full-back', i18n: 'positions.fullback', label: 'Full-back' },
    { value: 'Midfielder', i18n: 'positions.midfielder', label: 'Midfielder' },
    { value: 'Winger', i18n: 'positions.winger', label: 'Winger' },
    { value: 'Striker', i18n: 'positions.striker', label: 'Striker' }
];
const ALL_POSITIONS = INDIVIDUAL_POSITIONS.map(position => position.value);

const TOP_5 = ['Premier League', 'Bundesliga', 'La Liga', 'Ligue 1', 'Serie A'];
const TOP_7 = ['Premier League', 'Bundesliga', 'La Liga', 'Ligue 1', 'Serie A', 'Eredivisie', 'Liga Portugal'];
const SECOND_DIVISIONS = ['Championship', 'Segunda Division', 'Serie B', 'Bundesliga 2', 'Ligue 2', 'Liga Portugal 2', 'Eerste Divisie'];
const SOUTH_AMERICA = ['Brazil Serie A', 'Argentina Primera', 'Uruguay Primera', 'Colombia', 'Chile', 'Paraguay', 'Ecuador'];
const SCANDINAVIA = ['Norway Eliteserien', 'Denmark Superliga', 'Sweden Allsvenskan'];
const EASTERN_EUROPE = ['Czech Fortuna Liga', 'Serbia SuperLiga', 'Croatia HNL', 'Russia', 'Ukraine', 'Poland', 'Slovenia', 'Romania', 'Bulgaria', 'Hungary', 'Slovakia'];
const GULF = ['Saudi Pro League', 'UAE', 'Qatar'];
const AFRICA = ['South Africa', 'Egypt', 'Morocco'];
const ALL_LEAGUES = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'Liga Portugal', 'Eredivisie', 'Belgium Pro League', 'Scotland Premiership', 'Austrian Bundesliga', 'Swiss Super League', 'Süper Lig', 'Denmark Superliga', 'Sweden Allsvenskan', 'Norway Eliteserien', 'Ukraine', 'Russia', 'Poland', 'Croatia HNL', 'Serbia SuperLiga', 'Czech Fortuna Liga', 'Bulgaria', 'Hungary', 'Slovakia', 'Slovenia', 'Romania', 'Greece', 'Cyprus', 'Israel', 'Saudi Pro League', 'UAE', 'Qatar', 'J1 League', 'K League 1', 'MLS', 'LigaMX', 'Brazil Serie A', 'Argentina Primera', 'Uruguay Primera', 'Chile', 'Colombia', 'Ecuador', 'Paraguay', 'Egypt', 'Morocco', 'South Africa', 'Australia', 'Championship', 'Segunda Division', 'Serie B', 'Bundesliga 2', 'Ligue 2', 'Eerste Divisie', 'Liga Portugal 2', 'League One'];
const FIRST_DIVISIONS = ALL_LEAGUES.filter(league => !SECOND_DIVISIONS.includes(league) && league !== 'League One');
const NO_TOP_7 = ALL_LEAGUES.filter(league => !TOP_7.includes(league));

const INDIVIDUAL_LEAGUES = [
    { value: 'Premier League', i18n: 'leagues.premierLeague', icon: 'emojione:flag-for-united-kingdom', label: 'Premier League' },
    { value: 'La Liga', i18n: 'leagues.laLiga', icon: 'emojione:flag-for-spain', label: 'La Liga' },
    { value: 'Bundesliga', i18n: 'leagues.bundesliga', icon: 'emojione:flag-for-germany', label: 'Bundesliga' },
    { value: 'Serie A', i18n: 'leagues.serieA', icon: 'emojione:flag-for-italy', label: 'Serie A' },
    { value: 'Ligue 1', i18n: 'leagues.ligue1', icon: 'emojione:flag-for-france', label: 'Ligue 1' },
    { value: 'Liga Portugal', i18n: 'leagues.ligaPortugal', icon: 'emojione:flag-for-portugal', label: 'Liga Portugal' },
    { value: 'Eredivisie', i18n: 'leagues.eredivisie', icon: 'emojione:flag-for-netherlands', label: 'Eredivisie' },
    { value: 'Belgium Pro League', i18n: 'leagues.belgium', icon: 'emojione:flag-for-belgium', label: 'Belgium' },
    { value: 'Scotland Premiership', i18n: 'leagues.scotland', icon: '', label: 'Scotland', scotland: true },
    { value: 'Austrian Bundesliga', i18n: 'leagues.austria', icon: 'emojione:flag-for-austria', label: 'Austria' },
    { value: 'Swiss Super League', i18n: 'leagues.switzerland', icon: 'emojione:flag-for-switzerland', label: 'Switzerland' },
    { value: 'Süper Lig', i18n: 'leagues.turkey', icon: 'emojione:flag-for-turkey', label: 'Türkiye' },
    { value: 'Denmark Superliga', i18n: 'leagues.denmark', icon: 'emojione:flag-for-denmark', label: 'Denmark' },
    { value: 'Sweden Allsvenskan', i18n: 'leagues.sweden', icon: 'emojione:flag-for-sweden', label: 'Sweden' },
    { value: 'Norway Eliteserien', i18n: 'leagues.norway', icon: 'emojione:flag-for-norway', label: 'Norway' },
    { value: 'Ukraine', i18n: 'leagues.ukraine', icon: 'emojione:flag-for-ukraine', label: 'Ukraine' },
    { value: 'Russia', i18n: 'leagues.russia', icon: 'emojione:flag-for-russia', label: 'Russia' },
    { value: 'Poland', i18n: 'leagues.poland', icon: 'emojione:flag-for-poland', label: 'Poland' },
    { value: 'Croatia HNL', i18n: 'leagues.croatia', icon: 'emojione:flag-for-croatia', label: 'Croatia' },
    { value: 'Serbia SuperLiga', i18n: 'leagues.serbia', icon: 'emojione:flag-for-serbia', label: 'Serbia' },
    { value: 'Czech Fortuna Liga', i18n: 'leagues.czech', icon: 'emojione:flag-for-czechia', label: 'Czech Republic' },
    { value: 'Bulgaria', i18n: 'leagues.bulgaria', icon: 'emojione:flag-for-bulgaria', label: 'Bulgaria' },
    { value: 'Hungary', i18n: 'leagues.hungary', icon: 'emojione:flag-for-hungary', label: 'Hungary' },
    { value: 'Slovakia', i18n: 'leagues.slovakia', icon: 'emojione:flag-for-slovakia', label: 'Slovakia' },
    { value: 'Slovenia', i18n: 'leagues.slovenia', icon: 'emojione:flag-for-slovenia', label: 'Slovenia' },
    { value: 'Romania', i18n: 'leagues.romania', icon: 'emojione:flag-for-romania', label: 'Romania' },
    { value: 'Greece', i18n: 'leagues.greece', icon: 'emojione:flag-for-greece', label: 'Greece' },
    { value: 'Cyprus', i18n: 'leagues.cyprus', icon: 'emojione:flag-for-cyprus', label: 'Cyprus' },
    { value: 'Israel', i18n: 'leagues.israel', icon: 'emojione:flag-for-israel', label: 'Israel' },
    { value: 'Saudi Pro League', i18n: 'leagues.saudiArabia', icon: 'emojione:flag-for-saudi-arabia', label: 'Saudi Arabia' },
    { value: 'UAE', i18n: 'leagues.uae', icon: 'emojione:flag-for-united-arab-emirates', label: 'UAE' },
    { value: 'Qatar', i18n: 'leagues.qatar', icon: 'emojione:flag-for-qatar', label: 'Qatar' },
    { value: 'J1 League', i18n: 'leagues.japan', icon: 'emojione:flag-for-japan', label: 'Japan' },
    { value: 'K League 1', i18n: 'leagues.korea', icon: 'emojione:flag-for-south-korea', label: 'Korea' },
    { value: 'MLS', i18n: 'leagues.usa', icon: 'emojione:flag-for-united-states', label: 'MLS' },
    { value: 'LigaMX', i18n: 'leagues.mexico', icon: 'emojione:flag-for-mexico', label: 'Mexico' },
    { value: 'Brazil Serie A', i18n: 'leagues.brazil', icon: 'emojione:flag-for-brazil', label: 'Brazil Serie A' },
    { value: 'Argentina Primera', i18n: 'leagues.argentina', icon: 'emojione:flag-for-argentina', label: 'Argentina Primera' },
    { value: 'Uruguay Primera', i18n: 'leagues.uruguay', icon: 'emojione:flag-for-uruguay', label: 'Uruguay Primera' },
    { value: 'Chile', i18n: 'leagues.chile', icon: 'emojione:flag-for-chile', label: 'Chile' },
    { value: 'Colombia', i18n: 'leagues.colombia', icon: 'emojione:flag-for-colombia', label: 'Colombia' },
    { value: 'Ecuador', i18n: 'leagues.ecuador', icon: 'emojione:flag-for-ecuador', label: 'Ecuador' },
    { value: 'Paraguay', i18n: 'leagues.paraguay', icon: 'emojione:flag-for-paraguay', label: 'Paraguay' },
    { value: 'Egypt', i18n: 'leagues.egypt', icon: 'emojione:flag-for-egypt', label: 'Egypt' },
    { value: 'Morocco', i18n: 'leagues.morocco', icon: 'emojione:flag-for-morocco', label: 'Morocco' },
    { value: 'South Africa', i18n: 'leagues.southAfrica', icon: 'emojione:flag-for-south-africa', label: 'South Africa' },
    { value: 'Australia', i18n: 'leagues.australia', icon: 'emojione:flag-for-australia', label: 'Australia' },
    { value: 'Championship', i18n: 'leagues.championship', icon: 'emojione:flag-for-united-kingdom', label: 'Championship' },
    { value: 'Segunda Division', i18n: 'leagues.segundaDivision', icon: 'emojione:flag-for-spain', label: 'Spain Segunda' },
    { value: 'Serie B', i18n: 'leagues.serieB', icon: 'emojione:flag-for-italy', label: 'Serie B' },
    { value: 'Bundesliga 2', i18n: 'leagues.bundesliga2', icon: 'emojione:flag-for-germany', label: '2. Bundesliga' },
    { value: 'Ligue 2', i18n: 'leagues.ligue2', icon: 'emojione:flag-for-france', label: 'Ligue 2' },
    { value: 'Eerste Divisie', i18n: 'leagues.eersteDivisie', icon: 'emojione:flag-for-netherlands', label: 'Eerste Divisie' },
    { value: 'Liga Portugal 2', i18n: 'leagues.ligaPortugal2', icon: 'emojione:flag-for-portugal', label: 'Liga Portugal 2' },
    { value: 'League One', i18n: 'leagues.leagueOne', icon: 'emojione:flag-for-united-kingdom', label: 'League One' }
];

const LEAGUE_PRESETS = [
    { value: 'All Leagues', i18n: 'leagues.allLeagues', icon: 'emojione:globe-showing-europe-africa', label: 'All Leagues', leagues: ALL_LEAGUES },
    { value: 'All First Divisions', i18n: 'leagues.firstDivisions', icon: 'emojione:globe-showing-europe-africa', label: 'All First Divisions', leagues: FIRST_DIVISIONS },
    { value: 'Top 7 Leagues', i18n: 'leagues.top7', icon: 'emojione:flag-for-flag-european-union', label: 'Top 7 Leagues', leagues: TOP_7 },
    { value: 'Top 5 Leagues', i18n: 'leagues.top5', icon: 'emojione:flag-for-flag-european-union', label: 'Top 5 Leagues', leagues: TOP_5 },
    { value: 'No Top 7', i18n: 'leagues.noTop7', icon: 'emojione:globe-showing-europe-africa', label: 'Outside Top 7', leagues: NO_TOP_7 },
    { value: 'South America', i18n: 'leagues.southAmerica', icon: 'emojione:globe-showing-americas', label: 'South America', leagues: SOUTH_AMERICA },
    { value: 'Scandinavia', i18n: 'leagues.scandinavia', icon: 'emojione:globe-showing-europe-africa', label: 'Scandinavia', leagues: SCANDINAVIA },
    { value: 'Eastern Europe', i18n: 'leagues.easternEurope', icon: 'emojione:globe-showing-europe-africa', label: 'Eastern Europe', leagues: EASTERN_EUROPE },
    { value: 'Gulf', i18n: 'leagues.gulf', icon: 'emojione:globe-showing-asia-australia', label: 'Gulf', leagues: GULF },
    { value: 'Africa', i18n: 'leagues.africa', icon: 'emojione:globe-showing-europe-africa', label: 'Africa', leagues: AFRICA },
    { value: '2nd Divisions', i18n: 'leagues.2ndDivisions', icon: 'emojione:globe-showing-europe-africa', label: '2nd Divisions', leagues: SECOND_DIVISIONS }
];

const customMetricOrder = [
    { text: "Performance Index", i18n: "metrics.performanceIndex" },
    { text: "Minutes played", i18n: "metrics.minutesPlayed" },
    { text: "Matches played", i18n: "metrics.matchesPlayed" },
    { text: "Minutes per match", i18n: "metrics.minutesPerMatch" },
    { text: "CATEGORY: Goal Scoring", i18n: "categories.goalScoring" },
    { text: "Goals per 90", i18n: "metrics.goalsPerNinety" },
    { text: "Non-penalty goals per 90", i18n: "metrics.nonPenaltyGoals" },
    { text: "xG per 90", i18n: "metrics.xgPerNinety" },
    { text: "xG/Shot", i18n: "metrics.xgPerShot" },
    { text: "npxG per 90", i18n: "metrics.npxgPerNinety" },
    { text: "npxG/Shot", i18n: "metrics.npxgPerShot" },
    { text: "Goals per 100 touches", i18n: "metrics.goalsPerTouches" },
    { text: "xG per 100 touches", i18n: "metrics.xgPerTouches" },
    { text: "Shot frequency", i18n: "metrics.shotFrequency" },
    { text: "Shots per 90", i18n: "metrics.shotsPerNinety" },
    { text: "Shots on target %", i18n: "metrics.shotsOnTarget" },
    { text: "Shots on target per 90", i18n: "metrics.shotsOnTargetPerNinety" },
    { text: "Goal conversion %", i18n: "metrics.goalConversion" },
    { text: "Goals - xG per 90", i18n: "metrics.goalsMinusXg" },
    { text: "Goals per xG", i18n: "metrics.goalsPerXg" },
    { text: "Headed goals per 90", i18n: "metrics.headedGoals" },
    { text: "Touches in box per 90", i18n: "metrics.touchesInBox" },
    { text: "CATEGORY: Goal Creation", i18n: "categories.goalCreation" },
    { text: "Assists per 90", i18n: "metrics.assistsPerNinety" },
    { text: "xA per 90", i18n: "metrics.xaPerNinety" },
    { text: "xA per 100 passes", i18n: "metrics.xaPerPasses" },
    { text: "Goals + Assists per 90", i18n: "metrics.goalsAndAssists" },
    { text: "NPG+A per 90", i18n: "metrics.npGoalsAndAssists" },
    { text: "xG+xA per 90", i18n: "metrics.xgAndXa" },
    { text: "npxG+xA per 90", i18n: "metrics.npxgAndXa" },
    { text: "Key passes per 90", i18n: "metrics.keyPasses" },
    { text: "Chance creation ratio", i18n: "metrics.chanceCreation" },
    { text: "Assists - xA per 90", i18n: "metrics.assistsMinusXa" },
    { text: "Assists per xA", i18n: "metrics.assistsPerXa" },
    { text: "Shot assists per 90", i18n: "metrics.shotAssists" },
    { text: "Pre-assists per 90", i18n: "metrics.preAssists" },
    { text: "Crosses per 90", i18n: "metrics.crosses" },
    { text: "Cross accuracy %", i18n: "metrics.crossAccuracy" },
    { text: "Accurate crosses per 90", i18n: "metrics.accurateCrosses" },
    { text: "Crosses to box per 90", i18n: "metrics.crossesToBox" },
    { text: "Deep completions per 90", i18n: "metrics.deepCompletions" },
    { text: "CATEGORY: Dribbling and Ball-Carrying", i18n: "categories.dribbling" },
    { text: "Dribbles attempted per 90", i18n: "metrics.dribblesAttempted" },
    { text: "Dribble success rate %", i18n: "metrics.dribbleSuccess" },
    { text: "Successful dribbles per 90", i18n: "metrics.successfulDribbles" },
    { text: "Dribbles per 100 touches", i18n: "metrics.dribblesPerTouches" },
    { text: "Successful attacking actions per 90", i18n: "metrics.attackingActions" },
    { text: "Offensive duels per 90", i18n: "metrics.offensiveDuels" },
    { text: "Offensive duels won %", i18n: "metrics.offensiveDuelsWon" },
    { text: "Offensive duels won per 90", i18n: "metrics.offensiveDuelsWonPerNinety" },
    { text: "Progressive carries per 90", i18n: "metrics.progressiveCarries" },
    { text: "Ball-carrying frequency", i18n: "metrics.ballCarrying" },
    { text: "Accelerations per 90", i18n: "metrics.accelerations" },
    { text: "Fouls suffered per 90", i18n: "metrics.foulsSuffered" },
    { text: "CATEGORY: Passing", i18n: "categories.passing" },
    { text: "Passes per 90", i18n: "metrics.passes" },
    { text: "Pass completion %", i18n: "metrics.passCompletion" },
    { text: "Passes completed per 90", i18n: "metrics.passesCompleted" },
    { text: "Forward passes per 90", i18n: "metrics.forwardPasses" },
    { text: "Forward pass completion %", i18n: "metrics.forwardPassCompletion" },
    { text: "Forward passes completed per 90", i18n: "metrics.forwardPassesCompleted" },
    { text: "Short passes per 90", i18n: "metrics.shortPasses" },
    { text: "Short pass completion %", i18n: "metrics.shortPassCompletion" },
    { text: "Short passes completed per 90", i18n: "metrics.shortPassesCompleted" },
    { text: "Long passes per 90", i18n: "metrics.longPasses" },
    { text: "Long pass accuracy %", i18n: "metrics.longPassAccuracy" },
    { text: "Long passes completed per 90", i18n: "metrics.longPassesCompleted" },
    { text: "Progressive passes per 90", i18n: "metrics.progressivePasses" },
    { text: "Progressive pass accuracy %", i18n: "metrics.progressivePassAccuracy" },
    { text: "Progressive passes completed per 90", i18n: "metrics.progressivePassesCompleted" },
    { text: "Progressive passes (PAdj)", i18n: "metrics.progressivePassesAdj" },
    { text: "Passes to final third per 90", i18n: "metrics.passesToFinalThird" },
    { text: "Pass completion (to final third) %", i18n: "metrics.passCompletionFinalThird" },
    { text: "Accurate passes to final third per 90", i18n: "metrics.accuratePassesFinalThird" },
    { text: "Passes to penalty box per 90", i18n: "metrics.passesToBox" },
    { text: "Pass completion (to penalty box) %", i18n: "metrics.passCompletionToBox" },
    { text: "Accurate passes to pen box per 90", i18n: "metrics.accuratePassesToBox" },
    { text: "Through passes per 90", i18n: "metrics.throughPasses" },
    { text: "Through pass completion %", i18n: "metrics.throughPassCompletion" },
    { text: "Through passes completed per 90", i18n: "metrics.throughPassesCompleted" },
    { text: "Average pass length (m)", i18n: "metrics.averagePassLength" },
    { text: "Backward passes per 90", i18n: "metrics.backwardPasses" },
    { text: "Misplaced passes per 90", i18n: "metrics.misplacedPasses" },
    { text: "Forward pass ratio", i18n: "metrics.forwardPassRatio" },
    { text: "Backward pass ratio", i18n: "metrics.backwardPassRatio" },
    { text: "CATEGORY: Possession", i18n: "categories.possession" },
    { text: "Passes received per 90", i18n: "metrics.passesReceived" },
    { text: "Touches per 90", i18n: "metrics.touches" },
    { text: "Possessions lost per 90", i18n: "metrics.possessionsLost" },
    { text: "Possessions won - lost per 90", i18n: "metrics.possessionsBalance" },
    { text: "Possession +/-", i18n: "metrics.possessionPlusMinus" },
    { text: "Duels per 90", i18n: "metrics.duels" },
    { text: "Duels won %", i18n: "metrics.duelsWon" },
    { text: "Duels won per 90", i18n: "metrics.duelsWonPerNinety" },
    { text: "Progressive actions per 90", i18n: "metrics.progressiveActions" },
    { text: "Progressive action rate", i18n: "metrics.progressiveActionRate" },
    { text: "CATEGORY: Defending", i18n: "categories.defending" },
    { text: "Defensive duels per 90", i18n: "metrics.defensiveDuels" },
    { text: "Defensive duels won %", i18n: "metrics.defensiveDuelsWon" },
    { text: "Defensive duels won per 90", i18n: "metrics.defensiveDuelsWonPerNinety" },
    { text: "Sliding tackles per 90", i18n: "metrics.slidingTackles" },
    { text: "Sliding tackles (PAdj)", i18n: "metrics.slidingTacklesAdj" },
    { text: "Interceptions per 90", i18n: "metrics.interceptions" },
    { text: "Interceptions (PAdj)", i18n: "metrics.interceptionsAdj" },
    { text: "Possessions won per 90", i18n: "metrics.possessionsWon" },
    { text: "Aerial duels per 90", i18n: "metrics.aerialDuels" },
    { text: "Aerial duels won %", i18n: "metrics.aerialDuelsWon" },
    { text: "Aerial duels won per 90", i18n: "metrics.aerialDuelsWonPerNinety" },
    { text: "Shots blocked per 90", i18n: "metrics.shotsBlocked" },
    { text: "CATEGORY: Goalkeeping", i18n: "categories.goalkeeping" },
    { text: "Saves per 90", i18n: "metrics.saves" },
    { text: "Save percentage %", i18n: "metrics.savePercentage" },
    { text: "Prevented goals per 90", i18n: "metrics.preventedGoals" },
    { text: "Shots conceded per 90", i18n: "metrics.shotsConceded" },
    { text: "xG conceded per 90", i18n: "metrics.xgConceded" },
    { text: "Clean sheets", i18n: "metrics.cleanSheets" },
    { text: "Exits per 90", i18n: "metrics.exits" },
    { text: "CATEGORY: Set Pieces", i18n: "categories.setPieces" },
    { text: "Free kicks per 90", i18n: "metrics.freeKicks" },
    { text: "Direct free kicks per 90", i18n: "metrics.directFreeKicks" },
    { text: "Direct free kicks oT %", i18n: "metrics.directFreeKicksOnTarget" },
    { text: "Corners per 90", i18n: "metrics.corners" },
    { text: "Penalties attempted", i18n: "metrics.penaltiesAttempted" },
    { text: "Penalties scored", i18n: "metrics.penaltiesScored" },
    { text: "Penalty success rate %", i18n: "metrics.penaltySuccessRate" }
];

let isPastSeason = false;
let originalDataArray = [];
let currentDataArray = originalDataArray;
const columnIndexMap = {};
HEADER_ROW.split(',').forEach((name, index) => {
    columnIndexMap[name] = index;
});

let isToggled = false;
let isAscending = false;
let selectedLeagues = new Set(['Premier League']);
let selectedPositions = new Set(['Goalkeeper']);
let selectedMetricIndexes = [MINUTES_INDEX];
let thresholdMetricValue = String(MINUTES_INDEX);
let thresholdAsTotal = false;
let filteredEntries = [];
let barStats = { max: 1, min: 0, useMinMax: false };
let lastVirtualRange = { start: -1, end: -1 };
let virtualRaf = 0;
let searchDebounce = 0;
let thresholdDebounce = 0;
let searchMatchIndexes = [];
let activeMatchIndex = 0;

const playerTable = document.getElementById('playerTable');
const metricSelect = document.getElementById('metric');
const positionSelect = document.getElementById('position');
const leagueSelect = document.getElementById('league');
const ageInput = document.getElementById('age');
const toggleSortButton = document.getElementById('toggleSort');
const resultContainer = document.querySelector('.result-container');

function parseCsv(text) {
    const lines = text.split('\n');
    const rows = new Array(lines.length);
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        rows[count++] = line.split(',');
    }
    rows.length = count;
    return rows;
}

function minMax(values) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value < min) min = value;
        if (value > max) max = value;
    }
    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 1;
    return { min, max };
}

function setsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const value of a) {
        if (!b.has(value)) return false;
    }
    return true;
}

function columnCanConvert(index) {
    return index > 4 && !NON_CONVERTIBLE_COLUMNS.has(index);
}

function isValuePresent(row, colIndex) {
    if (row[colIndex] === '' || row[colIndex] === undefined) return false;
    const goals = parseFloat(row[16]);
    const xg = parseFloat(row[18]);
    const assists = parseFloat(row[21]);
    const xa = parseFloat(row[35]);
    const shots = parseFloat(row[20]);
    if (colIndex === 82 && goals === 0 && xg === 0) return false;
    if (colIndex === 83 && (goals === 0 || xg === 0)) return false;
    if (colIndex === 84 && assists === 0 && xa === 0) return false;
    if (colIndex === 85 && (xa === 0 || assists === 0)) return false;
    if ((colIndex === 81 || colIndex === 110) && (xg === 0 || shots === 0)) return false;
    return true;
}

function getMetricValue(row, colIndex, asTotal) {
    const raw = parseFloat(row[colIndex]);
    if (!Number.isFinite(raw)) return NaN;
    if (!asTotal || !columnCanConvert(colIndex)) return raw;
    const minutes = parseFloat(row[MINUTES_INDEX]);
    if (!minutes) return NaN;
    return raw * minutes / 90;
}

function formatMetricValue(value, colIndex, asTotal) {
    if (!Number.isFinite(value)) return '';
    if (colIndex === GOAL_CONVERSION_INDEX) return value.toFixed(2);
    if (asTotal) {
        if (TWO_DECIMAL_TOTAL.has(colIndex)) return value.toFixed(2);
        return String(Math.round(value));
    }
    if (Number.isInteger(value)) return String(value);
    const rounded = Math.round(value * 1000) / 1000;
    return String(rounded);
}

function formatCombinedValue(v1, idx1, v2, idx2, asTotal) {
    const sum = v1 + v2;
    if (!Number.isFinite(sum)) return '';
    const needsDecimals = idx1 === GOAL_CONVERSION_INDEX || idx2 === GOAL_CONVERSION_INDEX
        || TWO_DECIMAL_TOTAL.has(idx1) || TWO_DECIMAL_TOTAL.has(idx2)
        || !asTotal;
    if (needsDecimals) return (Math.round(sum * 100) / 100).toFixed(2);
    return String(Math.round(sum));
}

function getMetricDef(index) {
    return customMetricOrder.find(metric => !metric.text.startsWith('CATEGORY: ') && columnIndexMap[metric.text] === index);
}

function getMetricLabel(index, asTotal) {
    const metric = getMetricDef(index);
    if (!metric) return '';
    const useTotal = asTotal === undefined ? isToggled : asTotal;
    const per90 = (window.currentTranslations && window.currentTranslations.common && window.currentTranslations.common.per90)
        ? window.currentTranslations.common.per90
        : ' per 90';
    let text = metric.text.replace('CATEGORY: ', '');
    if (typeof getTranslatedText === 'function' && metric.i18n) {
        const translated = getTranslatedText(metric.i18n, text);
        if (translated) text = translated;
    }
    if (useTotal) {
        if (per90 && text.endsWith(per90)) text = text.slice(0, -per90.length);
        else text = text.replace(' per 90', '');
    } else if (metric.text.includes(' per 90') && !text.includes(per90.trim())) {
        text += per90;
    }
    return text;
}

function closeOpenDropdowns(exceptTrigger) {
    document.querySelectorAll('.custom-select-trigger.open').forEach(openTrigger => {
        if (openTrigger !== exceptTrigger) {
            openTrigger.classList.remove('open');
            if (openTrigger.nextElementSibling) openTrigger.nextElementSibling.style.display = 'none';
        }
    });
}

function toggleDropdown(trigger, options) {
    const isOpen = trigger.classList.contains('open');
    closeOpenDropdowns(trigger);
    trigger.classList.toggle('open', !isOpen);
    options.style.display = isOpen ? 'none' : 'block';
    return !isOpen;
}

function clearTriggerFlags(trigger) {
    const existingScotlandFlag = trigger.querySelector('.scotland-flag-icon');
    if (existingScotlandFlag) existingScotlandFlag.remove();
}

function setTriggerIcon(trigger, iconName, scotland) {
    clearTriggerFlags(trigger);
    let icon = trigger.querySelector('iconify-icon');
    const span = trigger.querySelector('span');
    if (scotland) {
        if (icon) icon.style.display = 'none';
        const flag = document.createElement('div');
        flag.className = 'scotland-flag-icon';
        trigger.insertBefore(flag, span);
        trigger.classList.add('has-icon');
        return;
    }
    if (!icon) {
        icon = document.createElement('iconify-icon');
        icon.setAttribute('width', '18');
        icon.setAttribute('height', '18');
        trigger.insertBefore(icon, span);
    }
    icon.setAttribute('icon', iconName);
    icon.style.display = 'inline-block';
    trigger.classList.add('has-icon');
}

function appendLeagueFlag(parent, league) {
    if (league.scotland) {
        const flag = document.createElement('div');
        flag.className = 'scotland-flag-icon';
        parent.appendChild(flag);
        return;
    }
    if (league.icon) {
        const icon = document.createElement('iconify-icon');
        icon.setAttribute('icon', league.icon);
        icon.setAttribute('width', '18');
        icon.setAttribute('height', '18');
        parent.appendChild(icon);
    }
}

function makeOptionCheck() {
    const check = document.createElement('span');
    check.className = 'option-check';
    return check;
}

function clickedCheck(e) {
    return !!(e.target && e.target.closest && e.target.closest('.option-check'));
}

function closeSelector(triggerId, optionsId) {
    const trigger = document.getElementById(triggerId);
    const options = document.getElementById(optionsId);
    if (trigger) trigger.classList.remove('open');
    if (options) options.style.display = 'none';
}

function translatedItemLabel(item) {
    return typeof getTranslatedText === 'function'
        ? getTranslatedText(item.i18n, item.label)
        : item.label;
}

function joinSelectedLabels(catalog, selectedSet) {
    const byValue = {};
    catalog.forEach(item => { byValue[item.value] = item; });
    const labels = [];
    selectedSet.forEach(value => {
        const item = byValue[value];
        if (item) labels.push(translatedItemLabel(item));
    });
    return labels.join(' + ');
}

function buildLeagueOptions() {
    const options = document.getElementById('league-select-options');
    options.innerHTML = '';
    options.classList.add('multi-select');

    LEAGUE_PRESETS.forEach(preset => {
        const option = document.createElement('div');
        option.className = 'custom-select-option league-preset';
        option.setAttribute('data-value', preset.value);
        option.appendChild(makeOptionCheck());
        appendLeagueFlag(option, preset);
        const span = document.createElement('span');
        span.setAttribute('data-i18n', preset.i18n);
        span.textContent = preset.label;
        option.appendChild(span);
        option.addEventListener('click', function (e) {
            e.stopPropagation();
            selectedLeagues = new Set(preset.leagues);
            onLeaguesChanged();
            if (!clickedCheck(e)) {
                closeSelector('league-select-trigger', 'league-select-options');
            }
        });
        options.appendChild(option);
    });

    const divider = document.createElement('div');
    divider.className = 'league-options-divider';
    options.appendChild(divider);

    INDIVIDUAL_LEAGUES.forEach(league => {
        const option = document.createElement('div');
        option.className = 'custom-select-option league-option';
        option.setAttribute('data-value', league.value);
        option.appendChild(makeOptionCheck());
        appendLeagueFlag(option, league);
        const span = document.createElement('span');
        span.setAttribute('data-i18n', league.i18n);
        span.textContent = league.label;
        option.appendChild(span);
        option.addEventListener('click', function (e) {
            e.stopPropagation();
            if (clickedCheck(e)) {
                if (selectedLeagues.has(league.value)) {
                    if (selectedLeagues.size === 1) return;
                    selectedLeagues.delete(league.value);
                } else {
                    selectedLeagues.add(league.value);
                }
                onLeaguesChanged();
                return;
            }
            selectedLeagues = new Set([league.value]);
            onLeaguesChanged();
            closeSelector('league-select-trigger', 'league-select-options');
        });
        options.appendChild(option);
    });

    updateLeagueTrigger();
}

function onLeaguesChanged() {
    if (selectedMetricIndexes.includes(PERFORMANCE_INDEX) && (selectedLeagues.size !== 1 || selectedPositions.size !== 1)) {
        selectedMetricIndexes = selectedMetricIndexes.filter(index => index !== PERFORMANCE_INDEX);
        if (!selectedMetricIndexes.length) selectedMetricIndexes = [MINUTES_INDEX];
        isAscending = false;
        syncMetricSelect();
        updateMetricTrigger();
        updateMetricChecks();
    }
    updateLeagueTrigger();
    handleSelectorsChange();
    filterTable();
}

function updateLeagueTrigger() {
    const trigger = document.getElementById('league-select-trigger');
    const span = trigger.querySelector('span');
    const matchingPreset = LEAGUE_PRESETS.find(preset => setsEqual(selectedLeagues, new Set(preset.leagues)));

    if (matchingPreset) {
        setTriggerIcon(trigger, matchingPreset.icon);
        span.textContent = typeof getTranslatedText === 'function'
            ? getTranslatedText(matchingPreset.i18n, matchingPreset.label)
            : matchingPreset.label;
        span.setAttribute('data-i18n', matchingPreset.i18n);
    } else if (selectedLeagues.size === 1) {
        const value = selectedLeagues.values().next().value;
        const league = INDIVIDUAL_LEAGUES.find(item => item.value === value);
        if (league) {
            setTriggerIcon(trigger, league.icon, league.scotland);
            span.textContent = typeof getTranslatedText === 'function'
                ? getTranslatedText(league.i18n, league.label)
                : league.label;
            span.setAttribute('data-i18n', league.i18n);
        }
    } else {
        setTriggerIcon(trigger, 'emojione:globe-showing-europe-africa');
        span.textContent = joinSelectedLabels(INDIVIDUAL_LEAGUES, selectedLeagues);
        span.removeAttribute('data-i18n');
    }

    document.querySelectorAll('#league-select-options .custom-select-option').forEach(option => {
        const value = option.getAttribute('data-value');
        if (option.classList.contains('league-preset')) {
            const preset = LEAGUE_PRESETS.find(item => item.value === value);
            option.classList.toggle('checked', !!(preset && setsEqual(selectedLeagues, new Set(preset.leagues))));
        } else {
            option.classList.toggle('checked', selectedLeagues.has(value));
        }
    });
}

function setupLeagueSelector() {
    const trigger = document.getElementById('league-select-trigger');
    const options = document.getElementById('league-select-options');
    trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const opened = toggleDropdown(trigger, options);
        if (opened) {
            const checked = options.querySelector('.custom-select-option.checked');
            if (checked) checked.scrollIntoView({ block: 'nearest' });
        }
    });
}

function buildPositionOptions() {
    const options = document.getElementById('position-select-options');
    options.innerHTML = '';
    options.classList.add('multi-select');

    const allOption = document.createElement('div');
    allOption.className = 'custom-select-option position-preset';
    allOption.setAttribute('data-value', 'All');
    allOption.appendChild(makeOptionCheck());
    const allSpan = document.createElement('span');
    allSpan.setAttribute('data-i18n', 'positions.all');
    allSpan.textContent = 'All positions';
    allOption.appendChild(allSpan);
    allOption.addEventListener('click', function (e) {
        e.stopPropagation();
        selectedPositions = new Set(ALL_POSITIONS);
        onPositionsChanged();
        if (!clickedCheck(e)) {
            closeSelector('position-select-trigger', 'position-select-options');
        }
    });
    options.appendChild(allOption);

    const divider = document.createElement('div');
    divider.className = 'league-options-divider';
    options.appendChild(divider);

    INDIVIDUAL_POSITIONS.forEach(position => {
        const option = document.createElement('div');
        option.className = 'custom-select-option position-option';
        option.setAttribute('data-value', position.value);
        option.appendChild(makeOptionCheck());
        const span = document.createElement('span');
        span.setAttribute('data-i18n', position.i18n);
        span.textContent = position.label;
        option.appendChild(span);
        option.addEventListener('click', function (e) {
            e.stopPropagation();
            if (clickedCheck(e)) {
                if (selectedPositions.has(position.value)) {
                    if (selectedPositions.size === 1) return;
                    selectedPositions.delete(position.value);
                } else {
                    selectedPositions.add(position.value);
                }
                onPositionsChanged();
                return;
            }
            selectedPositions = new Set([position.value]);
            onPositionsChanged();
            closeSelector('position-select-trigger', 'position-select-options');
        });
        options.appendChild(option);
    });

    updatePositionTrigger();
}

function onPositionsChanged() {
    if (selectedMetricIndexes.includes(PERFORMANCE_INDEX) && (selectedLeagues.size !== 1 || selectedPositions.size !== 1)) {
        selectedMetricIndexes = selectedMetricIndexes.filter(index => index !== PERFORMANCE_INDEX);
        if (!selectedMetricIndexes.length) selectedMetricIndexes = [MINUTES_INDEX];
        isAscending = false;
        syncMetricSelect();
        updateMetricTrigger();
        updateMetricChecks();
    }
    positionSelect.value = selectedPositions.size === 1
        ? selectedPositions.values().next().value
        : (setsEqual(selectedPositions, new Set(ALL_POSITIONS)) ? 'All' : '');
    updatePositionTrigger();
    handleSelectorsChange();
    filterTable();
}

function updatePositionTrigger() {
    const trigger = document.getElementById('position-select-trigger');
    const span = trigger.querySelector('span');
    const allSelected = setsEqual(selectedPositions, new Set(ALL_POSITIONS));

    if (allSelected) {
        span.textContent = typeof getTranslatedText === 'function'
            ? getTranslatedText('positions.all', 'All positions')
            : 'All positions';
        span.setAttribute('data-i18n', 'positions.all');
    } else if (selectedPositions.size === 1) {
        const value = selectedPositions.values().next().value;
        const position = INDIVIDUAL_POSITIONS.find(item => item.value === value);
        if (position) {
            span.textContent = typeof getTranslatedText === 'function'
                ? getTranslatedText(position.i18n, position.label)
                : position.label;
            span.setAttribute('data-i18n', position.i18n);
        }
    } else {
        span.textContent = joinSelectedLabels(INDIVIDUAL_POSITIONS, selectedPositions);
        span.removeAttribute('data-i18n');
    }

    document.querySelectorAll('#position-select-options .custom-select-option').forEach(option => {
        const value = option.getAttribute('data-value');
        if (value === 'All') {
            option.classList.toggle('checked', allSelected);
        } else {
            option.classList.toggle('checked', selectedPositions.has(value));
        }
    });
}

function setupPositionSelector() {
    const trigger = document.getElementById('position-select-trigger');
    const options = document.getElementById('position-select-options');
    trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const opened = toggleDropdown(trigger, options);
        if (opened) {
            const checked = options.querySelector('.custom-select-option.checked');
            if (checked) checked.scrollIntoView({ block: 'nearest' });
        }
    });
}

function rebuildHiddenMetricSelect() {
    metricSelect.innerHTML = '';
    customMetricOrder.forEach(metric => {
        const option = document.createElement('option');
        if (metric.text.startsWith('CATEGORY: ')) {
            option.textContent = metric.text.replace('CATEGORY: ', '');
            option.disabled = true;
            option.setAttribute('data-i18n', metric.i18n);
        } else {
            const index = columnIndexMap[metric.text];
            if (index !== undefined) {
                option.value = index;
                option.textContent = isToggled ? metric.text.replace(' per 90', '') : metric.text;
                option.setAttribute('data-i18n', metric.i18n);
            }
        }
        metricSelect.appendChild(option);
    });
    syncMetricSelect();
}

function syncMetricSelect() {
    metricSelect.value = String(selectedMetricIndexes[0]);
}

function updateMetricOptions() {
    const metricOptions = document.getElementById('metric-select-list') || document.getElementById('metric-select-options');
    metricOptions.innerHTML = '';
    rebuildHiddenMetricSelect();

    customMetricOrder.forEach(metric => {
        const option = document.createElement('div');
        if (metric.text.startsWith('CATEGORY: ')) {
            option.className = 'metric-category-header';
            option.innerHTML = `<span data-i18n="${metric.i18n}">${metric.text.replace('CATEGORY: ', '')}</span>`;
        } else {
            const index = columnIndexMap[metric.text];
            if (index === undefined) return;
            option.className = 'custom-select-option';
            option.setAttribute('data-value', index);
            option.appendChild(makeOptionCheck());
            const span = document.createElement('span');
            span.setAttribute('data-i18n', metric.i18n);
            span.textContent = isToggled ? metric.text.replace(' per 90', '') : metric.text;
            option.appendChild(span);
            option.addEventListener('click', function (e) {
                if (option.style.pointerEvents === 'none') return;
                const onCheck = e.target.closest('.option-check');
                if (onCheck) {
                    e.stopPropagation();
                    toggleCombinedMetric(index);
                    return;
                }
                selectSoleMetric(index);
                const metricTrigger = document.getElementById('metric-select-trigger');
                const metricDropdown = document.getElementById('metric-select-options');
                metricTrigger.classList.remove('open');
                metricDropdown.style.display = 'none';
            });
        }
        metricOptions.appendChild(option);
    });

    if (typeof getPreferredLanguage === 'function' && typeof applyLanguage === 'function') {
        applyLanguage(getPreferredLanguage());
    }
    updateMetricTrigger();
    updateMetricChecks();
    const metricSearch = document.getElementById('metricSearch');
    filterMetricOptions(metricSearch ? metricSearch.value : '');
}

function selectSoleMetric(index) {
    selectedMetricIndexes = [index];
    isAscending = false;
    syncMetricSelect();
    updateMetricTrigger();
    updateMetricChecks();
    handleSelectorsChange();
    filterTable();
}

function toggleCombinedMetric(index) {
    const existing = selectedMetricIndexes.indexOf(index);
    if (existing !== -1) {
        if (selectedMetricIndexes.length === 1) return;
        selectedMetricIndexes.splice(existing, 1);
    } else if (selectedMetricIndexes.length >= 2) {
        selectedMetricIndexes[1] = index;
    } else {
        selectedMetricIndexes.push(index);
    }
    if (selectedMetricIndexes.includes(PERFORMANCE_INDEX) && (selectedLeagues.size !== 1 || selectedPositions.size !== 1)) {
        selectedMetricIndexes = selectedMetricIndexes.filter(value => value !== PERFORMANCE_INDEX);
        if (!selectedMetricIndexes.length) selectedMetricIndexes = [index === PERFORMANCE_INDEX ? MINUTES_INDEX : index];
    }
    isAscending = false;
    syncMetricSelect();
    updateMetricTrigger();
    updateMetricChecks();
    handleSelectorsChange();
    filterTable();
}

function updateMetricTrigger() {
    const trigger = document.getElementById('metric-select-trigger');
    const span = trigger.querySelector('span');
    if (selectedMetricIndexes.length === 2) {
        span.textContent = `${getMetricLabel(selectedMetricIndexes[0])} + ${getMetricLabel(selectedMetricIndexes[1])}`;
        span.removeAttribute('data-i18n');
    } else {
        const metric = getMetricDef(selectedMetricIndexes[0]);
        span.textContent = getMetricLabel(selectedMetricIndexes[0]);
        if (metric) span.setAttribute('data-i18n', metric.i18n);
    }
    updateMetricLegend();
}

function updateMetricChecks() {
    document.querySelectorAll('#metric-select-options .custom-select-option').forEach(option => {
        const value = parseInt(option.getAttribute('data-value'), 10);
        option.classList.toggle('checked', selectedMetricIndexes.includes(value));
        option.classList.toggle('selected', selectedMetricIndexes[0] === value && selectedMetricIndexes.length === 1);
    });
}

function filterMetricOptions(query) {
    filterDropdownMetrics('metric-select-list', query);
}

function filterThresholdMetricOptions(query) {
    filterDropdownMetrics('threshold-metric-list', query);
}

function filterDropdownMetrics(listId, query) {
    const list = document.getElementById(listId);
    if (!list) return;
    const q = (query || '').trim().toLowerCase();
    Array.from(list.children).forEach(el => {
        if (el.classList.contains('metric-category-header')) return;
        el.hidden = !!(q && el.textContent.toLowerCase().indexOf(q) === -1);
    });
    Array.from(list.children).forEach(el => {
        if (!el.classList.contains('metric-category-header')) return;
        let next = el.nextElementSibling;
        let any = !q;
        while (next && !next.classList.contains('metric-category-header')) {
            if (!next.hidden) any = true;
            next = next.nextElementSibling;
        }
        el.hidden = !!(q && !any);
    });
}

function updateMetricLegend() {
    const legend = document.getElementById('metricLegend');
    if (selectedMetricIndexes.length !== 2) {
        legend.hidden = true;
        legend.innerHTML = '';
        return;
    }
    legend.hidden = false;
    legend.innerHTML = '';
    selectedMetricIndexes.forEach((index, i) => {
        const item = document.createElement('span');
        item.className = 'legend-item';
        const swatch = document.createElement('span');
        swatch.className = 'legend-swatch';
        swatch.style.backgroundColor = i === 0 ? '#3498db' : '#2ecc71';
        item.appendChild(swatch);
        item.appendChild(document.createTextNode(getMetricLabel(index)));
        legend.appendChild(item);
    });
}

function buildThresholdMetricOptions() {
    const dropdown = document.getElementById('threshold-metric-options');
    const options = document.getElementById('threshold-metric-list') || dropdown;
    options.innerHTML = '';

    const current = document.createElement('div');
    current.className = 'custom-select-option';
    current.setAttribute('data-value', '__current__');
    current.innerHTML = '<span data-i18n="filters.currentMetric">Current metric</span>';
    options.appendChild(current);

    customMetricOrder.forEach(metric => {
        if (metric.text.startsWith('CATEGORY: ')) {
            const header = document.createElement('div');
            header.className = 'metric-category-header';
            header.innerHTML = `<span data-i18n="${metric.i18n}">${metric.text.replace('CATEGORY: ', '')}</span>`;
            options.appendChild(header);
            return;
        }
        const index = columnIndexMap[metric.text];
        if (index === undefined) return;
        const option = document.createElement('div');
        option.className = 'custom-select-option';
        option.setAttribute('data-value', String(index));
        const span = document.createElement('span');
        span.setAttribute('data-i18n', metric.i18n);
        span.textContent = getMetricLabel(index, thresholdAsTotal);
        option.appendChild(span);
        options.appendChild(option);
    });

    options.querySelectorAll('.custom-select-option').forEach(option => {
        option.addEventListener('click', function () {
            thresholdMetricValue = option.getAttribute('data-value');
            options.querySelectorAll('.custom-select-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            updateThresholdTriggerText();
            document.getElementById('threshold-metric-trigger').classList.remove('open');
            dropdown.style.display = 'none';
            filterTable();
        });
    });

    const minutesOption = options.querySelector(`[data-value="${MINUTES_INDEX}"]`);
    if (minutesOption) minutesOption.classList.add('selected');
    updateThresholdTriggerText();
    const thresholdSearch = document.getElementById('thresholdMetricSearch');
    filterThresholdMetricOptions(thresholdSearch ? thresholdSearch.value : '');
}

function setupThresholdSelector() {
    const trigger = document.getElementById('threshold-metric-trigger');
    const options = document.getElementById('threshold-metric-options');
    trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDropdown(trigger, options);
        if (trigger.classList.contains('open')) {
            const thresholdSearch = document.getElementById('thresholdMetricSearch');
            if (thresholdSearch) setTimeout(function () { thresholdSearch.focus(); }, 0);
        }
    });
}

function getThresholdColumnIndexes() {
    if (thresholdMetricValue === '__current__') return selectedMetricIndexes.slice();
    return [parseInt(thresholdMetricValue, 10)];
}

function thresholdNeedsMode() {
    return getThresholdColumnIndexes().some(columnCanConvert);
}

function updateThresholdModeButtons() {
    const per90 = document.getElementById('thresholdPer90');
    const total = document.getElementById('thresholdTotal');
    if (!per90 || !total) return;
    per90.classList.toggle('active', !thresholdAsTotal);
    total.classList.toggle('active', thresholdAsTotal);
}

function updateThresholdTriggerText() {
    const triggerSpan = document.querySelector('#threshold-metric-trigger span');
    if (!triggerSpan) return;
    if (thresholdMetricValue === '__current__') {
        triggerSpan.textContent = typeof getTranslatedText === 'function'
            ? getTranslatedText('filters.currentMetric', 'Current metric')
            : 'Current metric';
        triggerSpan.setAttribute('data-i18n', 'filters.currentMetric');
        return;
    }
    const index = parseInt(thresholdMetricValue, 10);
    const metric = getMetricDef(index);
    triggerSpan.textContent = getMetricLabel(index, thresholdAsTotal);
    if (metric) triggerSpan.setAttribute('data-i18n', metric.i18n);
}

function refreshThresholdMetricLabels() {
    const list = document.getElementById('threshold-metric-list');
    if (list) {
        list.querySelectorAll('.custom-select-option[data-value]').forEach(option => {
            const value = option.getAttribute('data-value');
            if (value === '__current__') return;
            const index = parseInt(value, 10);
            const span = option.querySelector('span');
            const metric = getMetricDef(index);
            if (!span || !metric) return;
            span.textContent = getMetricLabel(index, thresholdAsTotal);
            span.setAttribute('data-i18n', metric.i18n);
        });
    }
    updateThresholdTriggerText();
    updateThresholdModeButtons();
}

function setThresholdAsTotal(asTotal) {
    thresholdAsTotal = !!asTotal;
    refreshThresholdMetricLabels();
    filterTable();
}

function getThresholdValue(row) {
    const indexes = getThresholdColumnIndexes();
    const asTotal = thresholdNeedsMode() ? thresholdAsTotal : false;
    let sum = 0;
    for (let i = 0; i < indexes.length; i++) {
        const value = getMetricValue(row, indexes[i], asTotal);
        if (!Number.isFinite(value)) return NaN;
        sum += value;
    }
    return sum;
}

async function loadData() {
    const loading = document.getElementById('tableLoading');
    loading.hidden = false;
    loading.textContent = typeof getTranslatedText === 'function'
        ? getTranslatedText('filters.loading', 'Loading…')
        : 'Loading…';
    const dataUrl = isPastSeason
        ? 'https://datamb.football/database/OLDINDEX.csv'
        : 'https://datamb.football/database/INDEX.csv';
    try {
        const response = await fetch(dataUrl, { cache: 'no-cache' });
        if (!response.ok) {
            alert('Failed to load ' + (isPastSeason ? 'past season' : 'current season') + ' data. Status: ' + response.status);
            return;
        }
        const text = await response.text();
        originalDataArray = parseCsv(HEADER_ROW + '\n' + text);
        currentDataArray = originalDataArray;
    } catch (error) {
        alert('Error loading ' + (isPastSeason ? 'past season' : 'current season') + ' data: ' + error.message);
    } finally {
        loading.hidden = true;
    }
}

function toggleSortOrder() {
    isAscending = !isAscending;
    filterTable();
}

function toggleData() {
    isToggled = !isToggled;
    const toggleButton = document.getElementById('toggleMetrics');
    if (toggleButton) toggleButton.classList.toggle('active', isToggled);
    const toggleTooltip = document.querySelector('.metrics-toggle-button .btn-tooltip-text');
    if (toggleTooltip) {
        const key = isToggled ? 'toggles.switchToPer90' : 'toggles.switchToTotal';
        const fallback = isToggled ? 'Switch to per 90' : 'Switch to total';
        toggleTooltip.textContent = typeof getTranslatedText === 'function' ? getTranslatedText(key, fallback) : fallback;
        toggleTooltip.setAttribute('data-i18n', key);
    }
    updateMetricOptions();
    handleSelectorsChange();
    filterTable();
}

function initPastSeasonButton() {
    const pastSeasonBtn = document.getElementById('pastSeasonBtn');
    if (!pastSeasonBtn) return;
    pastSeasonBtn.addEventListener('click', async function () {
        isPastSeason = !isPastSeason;
        const pastSeasonTooltip = document.querySelector('.past-season-button .btn-tooltip-text');
        if (isPastSeason) {
            this.classList.add('active');
            const translatedText = getTranslatedText('toggles.switchToCurrentSeason', 'Switch to current season');
            pastSeasonTooltip.textContent = translatedText;
            pastSeasonTooltip.setAttribute('data-i18n', 'toggles.switchToCurrentSeason');
        } else {
            this.classList.remove('active');
            const translatedText = getTranslatedText('toggles.switchToPastSeason', 'Switch to past season');
            pastSeasonTooltip.textContent = translatedText;
            pastSeasonTooltip.setAttribute('data-i18n', 'toggles.switchToPastSeason');
        }
        await loadData();
        filterTable();
    });
}

function getRowHeight() {
    return window.matchMedia('(max-width: 717px)').matches ? 33 : 36;
}

function filterTable(options) {
    if (!originalDataArray.length) return;
    options = options || {};
    const resetScroll = options.resetScroll !== false;
    const followSearch = !!options.followSearch;
    const ageLimit = ageInput.value === '' ? null : parseInt(ageInput.value, 10) + 1;
    const searchInput = document.getElementById('playerSearch');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const thresholdInput = document.getElementById('thresholdMin');
    const thresholdMin = thresholdInput ? parseFloat(thresholdInput.value) : NaN;
    const hasThreshold = Number.isFinite(thresholdMin);
    const metricIndexes = selectedMetricIndexes;
    const asTotal = isToggled;
    const combinePositions = selectedPositions.size !== 1;
    const uniquePlayers = combinePositions ? new Set() : null;
    const result = [];

    for (let i = 1; i < originalDataArray.length; i++) {
        const row = originalDataArray[i];
        if (!row || !row[0]) continue;
        if (!selectedLeagues.has(row[2])) continue;
        if (!selectedPositions.has(row[3])) continue;
        if (combinePositions) {
            const key = row[0] + '\0' + row[1];
            if (uniquePlayers.has(key)) continue;
            uniquePlayers.add(key);
        }
        if (ageLimit !== null && parseFloat(row[4]) > ageLimit) continue;

        let sortVal = 0;
        let skip = false;
        const values = [];
        for (let m = 0; m < metricIndexes.length; m++) {
            const index = metricIndexes[m];
            if (!isValuePresent(row, index)) {
                skip = true;
                break;
            }
            const value = getMetricValue(row, index, asTotal);
            if (!Number.isFinite(value)) {
                skip = true;
                break;
            }
            values.push(value);
            sortVal += value;
        }
        if (skip) continue;
        if (hasThreshold) {
            const thresholdValue = getThresholdValue(row);
            if (!Number.isFinite(thresholdValue) || thresholdValue < thresholdMin) continue;
        }

        const display = metricIndexes.length === 2
            ? formatCombinedValue(values[0], metricIndexes[0], values[1], metricIndexes[1], asTotal)
            : (asTotal || metricIndexes[0] === GOAL_CONVERSION_INDEX)
                ? formatMetricValue(values[0], metricIndexes[0], asTotal)
                : row[metricIndexes[0]];

        const matched = !!(search && (row[0] + ' ' + row[1]).toLowerCase().indexOf(search) !== -1);

        result.push({
            row,
            sortVal,
            display,
            v1: values[0],
            v2: values[1] || 0,
            matched
        });
    }

    result.sort((a, b) => isAscending ? a.sortVal - b.sortVal : b.sortVal - a.sortVal);

    let previousValue = null;
    let previousRank = 0;
    const matches = [];
    for (let i = 0; i < result.length; i++) {
        if (result[i].sortVal !== previousValue) {
            previousRank = i + 1;
            previousValue = result[i].sortVal;
        }
        result[i].rank = previousRank;
        result[i].index = i;
        if (result[i].matched) matches.push(i);
    }

    filteredEntries = result;
    searchMatchIndexes = matches;
    const stats = minMax(result.map(entry => entry.sortVal));
    const primary = metricIndexes[0];
    barStats = {
        max: stats.max,
        min: stats.min,
        useMinMax: metricIndexes.length > 1
            ? stats.min < 0
            : MINMAX_BAR_COLUMNS.has(primary) || stats.min < 0
    };
    lastVirtualRange = { start: -1, end: -1 };

    if (followSearch && matches.length) {
        if (activeMatchIndex >= matches.length) activeMatchIndex = 0;
        renderVirtual(false);
        scrollToRow(matches[activeMatchIndex]);
    } else {
        renderVirtual(resetScroll);
    }
}

function scrollToRow(index) {
    const rowHeight = getRowHeight();
    const view = resultContainer.clientHeight || 600;
    const y = index * rowHeight - Math.min(110, view * 0.28);
    const maxScroll = Math.max(0, filteredEntries.length * rowHeight - view);
    resultContainer.scrollTop = Math.max(0, Math.min(y, maxScroll));
    lastVirtualRange = { start: -1, end: -1 };
    renderVirtual(false);
}

function cycleSearchMatch(direction) {
    if (!searchMatchIndexes.length) return;
    activeMatchIndex = (activeMatchIndex + direction + searchMatchIndexes.length) % searchMatchIndexes.length;
    lastVirtualRange = { start: -1, end: -1 };
    scrollToRow(searchMatchIndexes[activeMatchIndex]);
}

function barWidthFor(entry) {
    const value = entry.sortVal;
    if (barStats.useMinMax) {
        const range = barStats.max - barStats.min;
        if (range === 0) return 100;
        return Math.max(((value - barStats.min) / range) * 100, 1.5);
    }
    if (value === 0) return 0;
    if (selectedMetricIndexes.length === 1 && selectedMetricIndexes[0] === PERFORMANCE_INDEX) {
        return value * 100 / 99;
    }
    if (!barStats.max) return 0;
    return Math.max((value / barStats.max) * 100, 1.5);
}

function rankColor(index, total) {
    const rakim = ((total - index) / total) * 100;
    let red, green, blue;
    if (isAscending) {
        red = Math.round(255 * (1 - Math.pow(((100 - rakim) / 100), 1.3)));
        green = Math.round(100 - rakim);
        blue = Math.round(255 * Math.pow(((100 - rakim) / 100), 1.3));
    } else {
        red = Math.round(255 * (1 - Math.pow((rakim / 100), 1.3)));
        green = Math.round(rakim);
        blue = Math.round(255 * Math.pow((rakim / 100), 1.3));
    }
    return `rgba(${red}, ${green}, ${blue}, 0.835)`;
}

function createRow(entry, total) {
    const rowEl = document.createElement('div');
    rowEl.className = 'player-row';
    if (entry.matched) rowEl.classList.add('is-match');
    if (entry.matched && searchMatchIndexes[activeMatchIndex] === entry.index) {
        rowEl.classList.add('is-active-match');
    }

    const nameCell = document.createElement('div');
    nameCell.className = 'player-name';
    nameCell.appendChild(document.createTextNode(entry.rank + '. ' + entry.row[0] + ' '));
    const meta = document.createElement('span');
    meta.className = 'smaller-text';
    meta.textContent = '(' + entry.row[1] + ', ' + Math.round(entry.row[4]) + ')';
    nameCell.appendChild(meta);

    const valueCell = document.createElement('div');
    valueCell.className = 'player-value';
    valueCell.textContent = entry.display;

    const barCell = document.createElement('div');
    barCell.className = 'player-bar';
    const bar = document.createElement('div');
    bar.className = 'rank-bar';
    const width = barWidthFor(entry);
    const split = selectedMetricIndexes.length === 2 && entry.v1 >= 0 && entry.v2 >= 0 && (entry.v1 + entry.v2) > 0;
    const isActiveMatch = rowEl.classList.contains('is-active-match');

    if (split) {
        bar.classList.add('split');
        const sum = entry.v1 + entry.v2;
        const fillA = document.createElement('div');
        fillA.className = 'rank-bar-fill';
        fillA.style.width = (width * (entry.v1 / sum)) + '%';
        fillA.style.backgroundColor = isActiveMatch ? MATCH_BAR_COLOR : METRIC_A_COLOR;
        const fillB = document.createElement('div');
        fillB.className = 'rank-bar-fill';
        fillB.style.width = (width * (entry.v2 / sum)) + '%';
        fillB.style.backgroundColor = isActiveMatch ? 'rgba(211, 84, 0, 0.92)' : METRIC_B_COLOR;
        bar.appendChild(fillA);
        bar.appendChild(fillB);
    } else {
        const fill = document.createElement('div');
        fill.className = 'rank-bar-fill';
        fill.style.width = width + '%';
        fill.style.backgroundColor = (entry.matched || isActiveMatch)
            ? MATCH_BAR_COLOR
            : rankColor(entry.index, total);
        bar.appendChild(fill);
    }

    barCell.appendChild(bar);
    rowEl.appendChild(nameCell);
    rowEl.appendChild(valueCell);
    rowEl.appendChild(barCell);
    return rowEl;
}

function renderVirtual(resetScroll) {
    if (resetScroll) resultContainer.scrollTop = 0;
    playerTable.style.display = selectedMetricIndexes.length ? '' : 'none';
    const total = filteredEntries.length;
    const rowHeight = getRowHeight();

    if (!total) {
        playerTable.style.paddingTop = '0px';
        playerTable.style.paddingBottom = '0px';
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = typeof getTranslatedText === 'function'
            ? getTranslatedText('filters.noPlayers', 'No players found')
            : 'No players found';
        playerTable.replaceChildren(empty);
        return;
    }

    const viewHeight = resultContainer.clientHeight || 600;
    const start = Math.max(0, Math.floor(resultContainer.scrollTop / rowHeight) - VIRTUAL_BUFFER);
    const visibleCount = Math.ceil(viewHeight / rowHeight) + VIRTUAL_BUFFER * 2;
    const end = Math.min(total, start + visibleCount);

    if (!resetScroll && start === lastVirtualRange.start && end === lastVirtualRange.end) return;
    lastVirtualRange = { start, end };

    const fragment = document.createDocumentFragment();
    for (let i = start; i < end; i++) {
        fragment.appendChild(createRow(filteredEntries[i], total));
    }
    playerTable.style.paddingTop = (start * rowHeight) + 'px';
    playerTable.style.paddingBottom = ((total - end) * rowHeight) + 'px';
    playerTable.replaceChildren(fragment);
}

function onResultScroll() {
    if (virtualRaf) return;
    virtualRaf = requestAnimationFrame(function () {
        virtualRaf = 0;
        renderVirtual(false);
    });
}

function handleSelectorsChange() {
    const metricSelector = document.querySelector('.metric-selector');
    const isPerformanceIndex = selectedMetricIndexes.includes(PERFORMANCE_INDEX);
    const isCombinationLeague = selectedLeagues.size !== 1;
    const isCombinationPosition = selectedPositions.size !== 1;
    const sortMetrics = [43, 45, 82, 83, 84, 85];

    if (selectedMetricIndexes.some(index => sortMetrics.includes(index))) {
        toggleSortButton.style.display = 'inline-block';
        metricSelector.classList.add('with-toggle');
    } else {
        toggleSortButton.style.display = 'none';
        metricSelector.classList.remove('with-toggle');
    }

    document.querySelectorAll('#league-select-options .league-preset').forEach(option => {
        const disabled = isPerformanceIndex;
        option.style.opacity = disabled ? '0.5' : '1';
        option.style.pointerEvents = disabled ? 'none' : 'auto';
    });

    document.querySelectorAll('#position-select-options .custom-select-option').forEach(option => {
        const disabled = option.getAttribute('data-value') === 'All' && isPerformanceIndex;
        option.style.opacity = disabled ? '0.5' : '1';
        option.style.pointerEvents = disabled ? 'none' : 'auto';
    });

    document.querySelectorAll('#metric-select-options .custom-select-option').forEach(option => {
        const isPi = option.getAttribute('data-value') === String(PERFORMANCE_INDEX);
        const disabled = isPi && (isCombinationLeague || isCombinationPosition);
        option.style.opacity = disabled ? '0.5' : '1';
        option.style.pointerEvents = disabled ? 'none' : 'auto';
    });

    const performanceIndexOption = metricSelect.querySelector('option[value="5"]');
    if (performanceIndexOption) performanceIndexOption.disabled = isCombinationLeague || isCombinationPosition;

    if (isPerformanceIndex && (isCombinationLeague || isCombinationPosition)) {
        selectedMetricIndexes = [20];
        syncMetricSelect();
        updateMetricTrigger();
        updateMetricChecks();
        filterTable();
    }
}

function updateMetricCustomSelector() {
    updateMetricTrigger();
    updateMetricChecks();
}

function debounceFilter(key, wait) {
    clearTimeout(key === 'search' ? searchDebounce : thresholdDebounce);
    const handle = setTimeout(function () {
        if (key === 'search') filterTable({ resetScroll: false, followSearch: true });
        else filterTable();
    }, wait);
    if (key === 'search') searchDebounce = handle;
    else thresholdDebounce = handle;
}

function initIndexApp() {
    positionSelect.value = 'Goalkeeper';
    ageInput.value = '';
    selectedLeagues = new Set(['Premier League']);
    selectedPositions = new Set(['Goalkeeper']);
    selectedMetricIndexes = [MINUTES_INDEX];
    thresholdMetricValue = String(MINUTES_INDEX);

    buildLeagueOptions();
    setupLeagueSelector();
    buildPositionOptions();
    setupPositionSelector();
    updateMetricOptions();
    buildThresholdMetricOptions();
    setupThresholdSelector();

    if (typeof getPreferredLanguage === 'function' && typeof applyLanguage === 'function') {
        applyLanguage(getPreferredLanguage());
    }

    toggleSortButton.addEventListener('click', toggleSortOrder);
    ageInput.addEventListener('input', filterTable);

    const searchInput = document.getElementById('playerSearch');
    searchInput.addEventListener('input', function () {
        activeMatchIndex = 0;
        debounceFilter('search', 120);
    });
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!searchMatchIndexes.length) {
                filterTable({ resetScroll: false, followSearch: true });
                return;
            }
            cycleSearchMatch(e.shiftKey ? -1 : 1);
        }
    });

    const metricSearch = document.getElementById('metricSearch');
    if (metricSearch) {
        metricSearch.addEventListener('click', function (e) { e.stopPropagation(); });
        metricSearch.addEventListener('input', function () {
            filterMetricOptions(this.value);
        });
        metricSearch.addEventListener('keydown', function (e) {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                const first = document.querySelector('#metric-select-list .custom-select-option:not([hidden])');
                if (first) first.click();
            }
        });
    }
    const thresholdSearch = document.getElementById('thresholdMetricSearch');
    if (thresholdSearch) {
        thresholdSearch.addEventListener('click', function (e) { e.stopPropagation(); });
        thresholdSearch.addEventListener('input', function () {
            filterThresholdMetricOptions(this.value);
        });
        thresholdSearch.addEventListener('keydown', function (e) {
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                const first = document.querySelector('#threshold-metric-list .custom-select-option:not([hidden])');
                if (first) first.click();
            }
        });
    }

    const thresholdMinField = document.getElementById('thresholdMinField');
    const thresholdMinInput = document.getElementById('thresholdMin');
    function syncThresholdMinField() {
        const empty = !thresholdMinInput.value.trim();
        thresholdMinField.classList.toggle('is-empty', empty);
    }
    thresholdMinField.addEventListener('click', function () {
        thresholdMinInput.focus();
    });
    thresholdMinInput.addEventListener('input', function () {
        syncThresholdMinField();
        debounceFilter('threshold', 150);
    });
    thresholdMinInput.addEventListener('blur', syncThresholdMinField);
    syncThresholdMinField();
    const thresholdMode = document.getElementById('thresholdMode');
    if (thresholdMode) {
        thresholdMode.addEventListener('click', function (e) { e.stopPropagation(); });
        thresholdMode.addEventListener('mousedown', function (e) { e.stopPropagation(); });
    }
    document.getElementById('thresholdPer90').addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setThresholdAsTotal(false);
    });
    document.getElementById('thresholdTotal').addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        setThresholdAsTotal(true);
    });

    const toggleButtonElement = document.getElementById('toggleMetrics');
    if (toggleButtonElement) toggleButtonElement.addEventListener('click', toggleData);
    initPastSeasonButton();
    resultContainer.addEventListener('scroll', onResultScroll, { passive: true });
    window.addEventListener('resize', function () {
        lastVirtualRange = { start: -1, end: -1 };
        renderVirtual(false);
    });

    handleSelectorsChange();
    loadData().then(filterTable);
}

metricSelect.addEventListener('change', function () {
    const next = parseInt(metricSelect.value, 10);
    if (!Number.isFinite(next)) return;
    if (selectedMetricIndexes.length === 1) selectedMetricIndexes = [next];
    else selectedMetricIndexes[0] = next;
    isAscending = false;
    filterTable();
});
