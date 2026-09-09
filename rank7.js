function showSpinner() {
    spinner.style.display = 'block';
  }
  
  function hideSpinner() {
    spinner.style.display = 'none';
  }
  
  // Session storage for position-specific metric selections
  let positionMetricStorage = {};
  
  function saveMetricsForPosition(position, metrics) {
    positionMetricStorage[position] = [...metrics];
  }
  
  function getMetricsForPosition(position) {
    return positionMetricStorage[position] || null;
  }
  
  function getCurrentSelectedMetrics(playerPosition, metricsToInclude, exclusionMapping, userExclusions) {
    const selectedMetrics = new Set();
    Object.keys(metricsToInclude).forEach(metric => {
      const isExcluded = exclusionMapping[playerPosition]?.includes(metric) || userExclusions.has(metric);
      if (!isExcluded) {
        selectedMetrics.add(metric);
      }
    });
    return selectedMetrics;
  }
  
  function applyStoredMetrics(position, metricsToInclude, exclusionMapping, userExclusions) {
    const storedMetrics = getMetricsForPosition(position);
    if (storedMetrics) {
      // Clear current user exclusions
      userExclusions.clear();
  
      // Apply stored selections
      Object.keys(metricsToInclude).forEach(metric => {
        const shouldBeIncluded = storedMetrics.includes(metric);
        const isDefaultExcluded = exclusionMapping[position]?.includes(metric);
  
        if (!shouldBeIncluded && !isDefaultExcluded) {
          // Metric was unchecked by user
          userExclusions.add(metric);
        } else if (shouldBeIncluded && isDefaultExcluded) {
          // Metric was checked by user but is default excluded, remove from exclusionMapping
          const index = exclusionMapping[position]?.indexOf(metric);
          if (index !== -1) {
            exclusionMapping[position].splice(index, 1);
          }
        }
      });
      return true;
    }
    return false;
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    var selectElement = document.getElementById("sectionSelect");
    var options = {
        "samePositionAndLeague": "vs League and Position, per 90",
        "samePositionAndLeagueWithMinutes": "vs League and Position",
        "position5": "vs Top 5 Leagues and Position, per 90",
        "position5WithMinutes": "vs Top 5 Leagues and Position",
        "position": "vs Top 7 Leagues and Position, per 90",
        "positionWithMinutes": "vs Top 7 Leagues and Position",
        "league": "vs League, per 90",
        "leagueWithMinutes": "vs League",
        "top5": "vs Top 5 Leagues, per 90",
        "top5WithMinutes": "vs Top 5 Leagues",
        "allCsv": "vs Top 7 Leagues, per 90",
        "allCsvWithMinutes": "vs Top 7 Leagues"        
        };
  
    // Function to add options to the select element
    function addOption(key, value) {
      var option = document.createElement("option");
      option.value = key;
      option.text = value;
      option.setAttribute('data-i18n', key);
      selectElement.add(option);
    }
  
    // Populate the select element with options based on your criteria
    function populateOptions(usePer90) {
        selectElement.innerHTML = ""; // Clear existing options        
        if (usePer90) {
        addOption("samePositionAndLeague", options["samePositionAndLeague"]);
        addOption("position5", options["position5"]);
        addOption("position", options["position"]);
        addOption("league", options["league"]);
        addOption("top5", options["top5"]);
        addOption("allCsv", options["allCsv"]);
        } else {
        addOption("samePositionAndLeagueWithMinutes", options["samePositionAndLeagueWithMinutes"]);
        addOption("position5WithMinutes", options["position5WithMinutes"]);
        addOption("positionWithMinutes", options["positionWithMinutes"]);
        addOption("leagueWithMinutes", options["leagueWithMinutes"]);
        addOption("top5WithMinutes", options["top5WithMinutes"]);
        addOption("allCsvWithMinutes", options["allCsvWithMinutes"]);
        }
  
      // Apply translations to the newly added options if translations are available
      if (currentTranslations) {
        selectElement.querySelectorAll('option').forEach(option => {
          const key = option.getAttribute('data-i18n');
          if (key && currentTranslations.options && currentTranslations.options[key]) {
            option.text = currentTranslations.options[key];
            option.textContent = currentTranslations.options[key];
          }
        });
      }
    }
  
    populateOptions(true); // Initially populate with per 90 options
  
    // Keep track of the original selected value
  
    // Toggle button functionality
    var toggleMetrics = document.getElementById("toggleMetrics");
    toggleMetrics.addEventListener("change", function () {
      // Show spinner
      showSpinner();
  
      // Get the current selected value
      var selectedValue = selectElement.value;
  
      // Determine whether the selected metric should be per 90 or not based on the toggle state
      var usePer90 = toggleMetrics.checked;
  
      // Repopulate options based on toggle state
      populateOptions(usePer90);
  
      // Update the selected value to its equivalent based on the toggle state
      if (usePer90) {
        selectedValue = selectedValue.replace("WithMinutes", "");
      } else {
        if (!selectedValue.endsWith("WithMinutes")) {
          selectedValue += "WithMinutes";
        }
      }
  
      // Set the selected value
      selectElement.value = selectedValue;
  
      // Simulate long computation with setTimeout
      setTimeout(() => {
        // Hide spinner
        hideSpinner();
      }, 0); // Adjust the timeout value as needed
    });
  });
  
  const metricColumnMap = {
    'Accelerations': 'accelerations',
    'Cross accuracy %': 'accurateCrossesPercentage',
    'Pass completion (to final third) %': 'accuratePassesToFinalThirdPercentage',
    'Pass completion (to penalty box) %': 'accuratePassesToPenaltyAreaPercentage',
    'Aerial duels': 'aerialDuels',
    'Aerial duels won': 'aerialDuelsWonPerNinety',
    'Aerial duels won %': 'aerialDuelsWonPercentage',
    'Assists': 'assists',
    'Ball carrying frequency': 'ballCarryingFrequency',
    'Chance creation ratio': 'chanceCreationRatio',
    'Clean sheets': 'cleanSheets',
    'Accurate crosses': 'accurateCrossesPerNinety',
    'Crosses': 'crosses',
    'Crosses to box': 'crossesToGoalieBox',
    'Deep completions': 'deepCompletions',
    'Defensive duels': 'defDuels',
    'Defensive duels won': 'defensiveDuelsWonPerNinety',
    'Defensive duels won %': 'defensiveDuelsWonPercentage',
    'Dribble success rate %': 'successfulDribblesPercentage',
    'Dribbles attempted': 'dribbles',
    'Dribbles per 100 touches': 'dribblesPerHundredTouches',
    'Duels': 'duelsPerNinety',
    'Duels won': 'duelsWonPerNinety',
    'Duels won %': 'duelsWonPercentage',
    'Expected assists (xA)': 'xA',
    'Expected goals (xG)': 'xG',
    'Forward pass completion %': 'accurateForwardPassesPercentage',
    'Forward pass ratio': 'forwardPassRatio',
    'Forward passes': 'forwardPasses',
    'Forward passes completed': 'forwardPassesCompletedPerNinety',
    'Fouls suffered': 'foulsSuffered',
    'Goal conversion %': 'goalConversionPercentage',
    'Goals': 'goals',
    'Goals - xG': 'goalsMinusxGPerNinety',
    'Goals + assists': 'goalsAndAssistsPerNinety',
    'Goals conceded': 'goalsAgainstPerNinety',
    'Goals per 100 touches': 'goalsPer100Touches',
    'Headed goals': 'headGoals',
    'Interceptions': 'interceptions',
    'Interceptions (PAdj)': 'pAdjInterceptions',
    'Key passes': 'keyPasses',
    'Line exits': 'exits',
    'Long pass accuracy %': 'accurateLongPassesPercentage',
    'Long passes': 'longPasses',
    'Long passes completed': 'longPassesCompletedPerNinety',
    'Non-penalty goals': 'nonPenaltyGoals',
    'Non-penalty goals + assists': 'npGoalsAndAssistsPerNinety',
    'Non-penalty xG': 'npxGPerNinety',
    'npxG + xA': 'npxGAndxAPerNinety',
    'npxG/Shot': 'npxGPerShot',
    'Offensive duels': 'offensiveDuels',
    'Offensive duels won': 'offensiveDuelsWonPerNinety',
    'Offensive duels won %': 'offensiveDuelsWonPercentage',
    'Accurate passes to final third': 'accuratePassesToFinalThirdPerNinety',
    'Accurate passes to box': 'accuratePassesToPenaltyBoxPerNinety',
    'Pass completion %': 'accuratePassesPercentage',
    'Passes': 'passes',
    'Passes completed': 'passesCompletedPerNinety',
    'Passes to final third': 'passesToFinalThird',
    'Passes to penalty box': 'passesToPenaltyArea',
    'Possession +/-': 'possessionPlusMinus',
    'Possessions won': 'defActions',
    'Possessions won - lost': 'possessionsWonMinusLostPerNinety',
    'Pre-assists': 'preAssistsPerNinety',
    'Prevented goals (PSxG-GA)': 'preventedGoals',
    'Progressive action rate': 'progressiveActionRate',
    'Progressive actions': 'progressiveActionsPerNinety',
    'Progressive carries': 'progressiveRuns',
    'Progressive pass accuracy %': 'accurateProgressivePassesPercentage',
    'Progressive passes': 'progressivePasses',
    'Progressive passes (PAdj)': 'progressivePassesPAdj',
    'Progressive passes completed': 'progressivePassesCompletedPerNinety',
    'Save percentage %': 'saveRatePercentage',
    'Saves': 'savesPerNinety',
    'Short pass completion %': 'accurateShortMediumPassesPercentage',
    'Short passes': 'shortMediumPasses',
    'Short passes completed': 'shortPassesCompletedPerNinety',
    'Shot assists': 'shotAssists',
    'Shot frequency': 'shotFrequency',
    'Shots': 'shots',
    'Shots blocked': 'shotsBlocked',
    'Shots conceded': 'shotsAgainst',
    'Shots on target': 'shotsOnTargetPerNinety',
    'Shots on target %': 'shotsOnTargetPercentage',
    'Sliding tackles': 'slidingTackles',
    'Sliding tackles (PAdj)': 'pAdjSlidingTackles',
    'Successful attacking actions': 'successfulAttackingActions',
    'Successful dribbles': 'successfulDribblesPerNinety',
    'Through passes': 'throughPasses',
    'Through passes completed': 'throughPassesCompletedPerNinety',
    'Touches': 'touchesPerNinety',
    'Touches in box': 'touchesInBox',
    'xA per 100 passes': 'xAPer100Passes',
    'xG + xA': 'xGAndxAPerNinety',
    'xG conceded': 'xGAgainst',
    'xG per 100 touches': 'xGPer100Touches'
  
  };
  
  let pizzaChartInstance = null; // Variable to store the chart instance
  
  // Utility function to format player name with truncation on smaller screens
  function formatPlayerName(player, team, age) {
    const fullName = `${player} (${team}, ${age})`;
  
    // Check if screen is small (768px or less) and name is longer than 31 characters
    if (window.innerWidth <= 768 && fullName.length > 31) {
      // Truncate to 28 characters and add "..."
      return fullName.substring(0, 28) + '...';
    }
  
    return fullName;
  }
  
  // Function to refresh player name display on window resize
  function refreshPlayerNameDisplay() {
    const chartTitleElement = document.getElementById('chartTitle');
    if (chartTitleElement && window.selectedPlayer) {
      // Find the h3 element and update its content
      const h3Element = chartTitleElement.querySelector('h3 b');
      if (h3Element) {
        h3Element.textContent = formatPlayerName(selectedPlayer.player, selectedPlayer.team, selectedPlayer.age);
      }
    }
  }
  
  // Add window resize listener for responsive player name truncation
  window.addEventListener('resize', refreshPlayerNameDisplay);
  function createPizzaChart(rankData, rawValueData = {}) {
    const ctx = document.getElementById('pizzaChart').getContext('2d');

    if (pizzaChartInstance) {
      pizzaChartInstance.destroy();
    }

    const labels = Object.keys(rankData).map(label => translateMetricName(label));
    const data = Object.values(rankData);
    const rawValues = Object.keys(rankData).map(key => rawValueData[key]);

    function getColor(value) {
      const r = Math.round(255 * value);
      const g = Math.round(100 * (1 - value));
      const b = Math.round(255 * (1 - value));
      return `rgba(${r}, ${g}, ${b}, 0.75)`;
    }

    const colors = data.map(value => getColor(value));

    function getCurrentChartColors() {
      if (typeof window.getChartColors === 'function') {
        return window.getChartColors();
      }
      return {
        textColor: '#333333',
        gridColor: 'rgba(0, 0, 0, 0.1)'
      };
    }

    const chartColors = getCurrentChartColors();

    pizzaChartInstance = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: typeof window.isDarkMode === 'function' && window.isDarkMode() ? '#1a1a1a' : '#ffffff',
          borderWidth: 2,
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
            labels: {
              color: chartColors.textColor
            }
          },
          datalabels: {
            display: true,
            color: function (context) {
              if (typeof window.isDarkMode === 'function' && window.isDarkMode()) {
                return '#ffffff';
              }
              return colors[context.dataIndex];
            },
            align: 'end',
            anchor: 'end',
            offset: -5,
            padding: 0,
            font: {
              size: 9,
            },
            formatter: (value, context) => {
              const raw = rawValues[context.dataIndex];
              if (raw === undefined || raw === null || raw === '') {
                return '';
              }
              return raw;
            },
          },
          beforeDraw: (chart) => {
            const { ctx, chartArea } = chart;
            const { top, right, bottom, left, width, height } = chartArea;
            const centerX = (left + right) / 2;
            const centerY = (top + bottom) / 2;
            const radius = Math.min(width, height) / 2;

            const currentColors = typeof window.getChartColors === 'function' ?
              window.getChartColors() : { gridColor: 'rgba(0, 0, 0, 0.5)' };

            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.lineWidth = 2;
            ctx.strokeStyle = currentColors.gridColor;
            ctx.stroke();
            ctx.restore();
          }
        },
        scales: {
          r: {
            min: 0,
            max: 1.04,
            reverse: true,
            angleLines: {
              display: true,
              color: chartColors.gridColor,
              lineWidth: 2
            },
            grid: {
              color: chartColors.gridColor
            },
            ticks: {
              beginAtZero: false,
              display: false,
              color: chartColors.textColor
            },
            pointLabels: {
              display: true,
              centerPointLabels: true,
              color: chartColors.textColor,
              font: {
                size: 10,
                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
              },
              padding: 10,
              callback: function (label) {
                const fixedLength = 20;

                if (label.length > fixedLength) {
                  return label.substring(0, fixedLength);
                }

                const totalPadding = fixedLength - label.length;
                const paddingBefore = Math.floor(totalPadding / 2);
                const paddingAfter = totalPadding - paddingBefore;

                return ' '.repeat(paddingBefore) + label + ' '.repeat(paddingAfter);
              }
            }
          }
        },
        interaction: {
          mode: null
        },
        hover: {
          mode: null
        }
      },
      plugins: [ChartDataLabels]
    });

  }

  function getCurrentMetricValue(parsedData, selectedPlayer, metric) {
    const columnName = metricColumnMap[metric]; // Get the corresponding column name
  
    const excludedColumns = [
      'pAdjSlidingTackles', 'pAdjInterceptions', 'cleanSheets',
      'defensiveDuelsWonPercentage', 'aerialDuelsWonPercentage', 'shotsOnTargetPercentage',
      'goalConversionPercentage', 'accurateCrossesPercentage', 'successfulDribblesPercentage',
      'offensiveDuelsWonPercentage', 'accuratePassesPercentage', 'accurateForwardPassesPercentage',
      'accurateShortMediumPassesPercentage', 'accurateLongPassesPercentage',
      'accuratePassesToFinalThirdPercentage', 'accuratePassesToPenaltyAreaPercentage', 'accurateProgressivePassesPercentage', 'saveRatePercentage',
      'xGPer100Touches', 'goalsPer100Touches', 'xAPer100Passes', 'chanceCreationRatio', 'npxGPerShot',
      'duelsWonPercentage', 'possessionPlusMinus', 'forwardPassRatio',
      'progressiveActionRate', 'progressivePassesPAdj', 'shotFrequency', 'ballCarryingFrequency', 'dribblesPerHundredTouches'
  
    ];
    const decimalColumns = ['xG', 'xA', 'xGAgainst', 'preventedGoals', 'goalsMinusxGPerNinety', 'xGAndxAPerNinety', 'npxGPerNinety', 'npxGAndxAPerNinety'];
  
  
    // Find player data
    const playerData = parsedData.find(p =>
      p.player === selectedPlayer.player &&
      p.position === selectedPlayer.position &&
      p.league === selectedPlayer.league
    );
  
    let value = playerData[columnName];
  
    if (decimalColumns.includes(columnName)) {
      return (value * playerData['minutes'] / 90).toFixed(2);
    }
    else if (excludedColumns.includes(columnName)) {
      return playerData[columnName];
    }
    else {
      return Math.round(value * playerData['minutes'] / 90);
    }
  }
  
  
  function updateCurrentMetricValue(parsedData, selectedPlayer, metric) {
    const columnName = metricColumnMap[metric]; // Get the corresponding column name
  
  
    const playerData = parsedData.find(p => p.player === selectedPlayer.player && p.position === selectedPlayer.position && p.league === selectedPlayer.league);
  
  
  
    // Return the metric value without modification
    return playerData[columnName];
  }
  
  // Main script
  let allData = [];
  
  
  let isFirstFileProcessed = false;
      
  const urls = [
  
  'https://datamb.football/database/CURRENT/TOP72627/GK/GK.xlsx',
  'https://datamb.football/database/CURRENT/TOP72627/CB/CB.xlsx',
  'https://datamb.football/database/CURRENT/TOP72627/FB/FB.xlsx',
  'https://datamb.football/database/CURRENT/TOP72627/CM/CM.xlsx',
  'https://datamb.football/database/CURRENT/TOP72627/FW/FW.xlsx',
  'https://datamb.football/database/CURRENT/TOP72627/ST/ST.xlsx',
  ];
  
  const fetchPromises = urls.map(url => fetch(url).then(response => response.arrayBuffer()));
  
  Promise.all(fetchPromises)
  .then(responses => {
    responses.forEach((data, index) => {
      const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
                          const sheetName = workbook.SheetNames[0];
                          const sheet = workbook.Sheets[sheetName];
                          let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
                          let label;
                          switch (index) {
                              case 0:
                                  label = 'Goalkeeper';
                                  break;
                              case 1:
                                  label = 'Centre-back';
                                  break;
                              case 2:
                                  label = 'Full-back';
                                  break;
                              case 3:
                                  label = 'Midfielder';
                                  break;
                              case 4:
                                  label = 'Winger';
                                  break;
                              case 5:
                                  label = 'Striker';
                                  break;
                              default:
                                  label = 'Unknown';
                                  break;
                          }
  
                          for (let i = 0; i < jsonData.length; i++) {
                              if (index !== 0 && i === 0) continue;
  
                              // Create a copy of the row
                              const originalRow = [...jsonData[i]];
                              
                              // Insert the position label at index 2
                              jsonData[i][2] = label;
                              
                              // Copy the rest of the data, shifted one position
                              for (let j = 3; j < originalRow.length + 1; j++) {
                                  jsonData[i][j] = originalRow[j - 1];
                              }
                          }
  
                          if (!isFirstFileProcessed) {
                              allData.push(...jsonData);
                              isFirstFileProcessed = true;
                          } else {
                              allData.push(...jsonData.slice(1));
                          }
                      });
  
  
const leagues = {
"Premier League": ["Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton", "Chelsea", "Coventry City", "Crystal Palace", "Everton", "Fulham", "Hull City", "Ipswich Town", "Leeds United", "Liverpool", "Manchester City", "Manchester United", "Newcastle United", "Nottingham Forest", "Sunderland", "Tottenham Hotspur"],

"La Liga": ["Athletic Club", "Atlético Madrid", "Barcelona", "Celta de Vigo", "Deportivo Alavés", "Deportivo La Coruña", "Elche", "Espanyol", "Getafe", "Levante", "Málaga", "Osasuna", "Racing Santander", "Rayo Vallecano", "Real Betis", "Real Madrid", "Real Sociedad", "Sevilla", "Valencia", "Villarreal"],

"Serie A": ["Milan", "Juventus", "Atalanta", "Lazio", "Napoli", "Roma", "Sassuolo", "Internazionale", "Lecce", "Torino", "Parma", "Udinese", "Genoa", "Bologna", "Fiorentina", "Cagliari", "Monza", "Como", "Frosinone", "Venezia"],

"Bundesliga": ["Borussia Dortmund", "Stuttgart", "Bayer Leverkusen", "Borussia Mgladbach", "Augsburg", "Union Berlin", "Eintracht Frankfurt", "Bayern München", "Hoffenheim", "Mainz 05", "Werder Bremen", "RB Leipzig", "Köln", "Freiburg", "Hamburger SV", "Schalke 04", "Paderborn", "Elversberg"],

"Ligue 1": ["PSG", "Lille", "Nice", "Lens", "Paris", "Olympique Lyonnais", "Monaco", "Olympique Marseille", "Brest", "Lorient", "Angers SCO", "Le Havre", "Rennes", "Auxerre", "Strasbourg", "Toulouse", "Le Mans", "Troyes"],

"Eredivisie": ["PSV", "Feyenoord", "Sparta Rotterdam", "Twente", "Utrecht", "Groningen", "PEC Zwolle", "NEC", "Fortuna Sittard", "Go Ahead Eagles", "Heerenveen", "Telstar", "AZ", "Excelsior", "Ajax", "Cambuur", "ADO Den Haag", "Willem II"],

"Liga Portugal": ["Porto", "Benfica", "Sporting CP", "Sporting Braga", "Vitória Guimarães", "Gil Vicente", "Alverca", "Moreirense", "Nacional", "Arouca", "Estoril", "Rio Ave", "Santa Clara", "Casa Pia AC", "Famalicão", "Estrela Amadora", "Marítimo", "Académico de Viseu F.C."],
};

    function getTeamLeague(team) {
      for (const [league, teams] of Object.entries(leagues)) {
        if (teams.includes(team)) {
          return league;
        }
      }
      return "Unknown League";
    }
  
    const columnsToDelete = [16, 17, 18, 30, 31, 32, 33, 42, 43, 49, 50, 51, 52, 57, 58, 62, 63, 64, 71, 73, 76, 78, 82, 84, 86, 88, 89, 90, 91, 92, 93, 94, 95, 102, 106, 108, 109, 110, 125, 127, 131, 132, 133];
  
    let teamData = [];
    allData.forEach(row => {
      if (row.length >= 3) {
        const team = row[1];
        const league = getTeamLeague(team);
  
        if (league !== "Unknown League") {
          row.splice(2, 0, league);
          const filteredRow = row.filter((_, index) => !columnsToDelete.includes(index));
          teamData.push(filteredRow);
        }
      }
    });
  
    allData = teamData;
  
    let outputLines = [];
    allData.forEach(row => {
      let rowString = row.join(",");
      outputLines.push(rowString);
    });
    const csvData = outputLines.join("\n");
  const top5 = ["Ligue 1", "Serie A", "Bundesliga", "Premier League", "La Liga"];
    const parsedData = parseCSV(csvData);
  
  
    function parseCSV(csv) {
      const rows = csv.split('\n');
      return rows.map(row => {
        const [
          player,
          team,
          league,
          position,
          age,
          minutes,
          defActions,
          defDuels,
          defensiveDuelsWonPercentage,
          aerialDuels,
          aerialDuelsWonPercentage,
          slidingTackles,
          pAdjSlidingTackles,
          shotsBlocked,
          interceptions,
          pAdjInterceptions,
          successfulAttackingActions,
          goals,
          nonPenaltyGoals,
          xG,
          headGoals,
          shots,
          shotsOnTargetPercentage,
          goalConversionPercentage,
          assists,
          crosses,
          accurateCrossesPercentage,
          crossesToGoalieBox,
          dribbles,
          successfulDribblesPercentage,
          offensiveDuels,
          offensiveDuelsWonPercentage,
          touchesInBox,
          progressiveRuns,
          accelerations,
          foulsSuffered,
          passes,
          accuratePassesPercentage,
          forwardPasses,
          accurateForwardPassesPercentage,
          shortMediumPasses,
          accurateShortMediumPassesPercentage,
          longPasses,
          accurateLongPassesPercentage,
          xA,
          shotAssists,
          preAssistsPerNinety,
          keyPasses,
          passesToFinalThird,
          accuratePassesToFinalThirdPercentage,
          passesToPenaltyArea,
          accuratePassesToPenaltyAreaPercentage,
          throughPasses,
          deepCompletions,
          progressivePasses,
          accurateProgressivePassesPercentage,
          goalsAgainstPerNinety,
          shotsAgainst,
          cleanSheets,
          saveRatePercentage,
          xGAgainst,
          preventedGoals,
          exits,
          duelsPerNinety,
          duelsWonPercentage,
          possessionPlusMinus,
          forwardPassRatio,
          xAPer100Passes,
          chanceCreationRatio,
          goalsAndAssistsPerNinety,
          npGoalsAndAssistsPerNinety,
          xGAndxAPerNinety,
          goalsMinusxGPerNinety,
          successfulDribblesPerNinety,
          shotsOnTargetPerNinety,
          accurateCrossesPerNinety,
          offensiveDuelsWonPerNinety,
          defensiveDuelsWonPerNinety,
          aerialDuelsWonPerNinety,
          passesCompletedPerNinety,
          forwardPassesCompletedPerNinety,
          shortPassesCompletedPerNinety,
          longPassesCompletedPerNinety,
          accuratePassesToFinalThirdPerNinety,
          accuratePassesToPenaltyBoxPerNinety,
          throughPassesCompletedPerNinety,
          progressivePassesCompletedPerNinety,
          savesPerNinety,
          possessionsWonMinusLostPerNinety,
          progressiveActionsPerNinety,
          duelsWonPerNinety,
          npxGPerNinety,
          npxGPerShot,
          npxGAndxAPerNinety,
          touchesPerNinety,
          progressiveActionRate,
          progressivePassesPAdj,
          ballCarryingFrequency,
          xGPer100Touches,
          shotFrequency,
          dribblesPerHundredTouches,
          goalsPer100Touches
        ] = row.split(',');
  
  
        return {
          player: player.trim(),
          team: team.trim(),
          league: league.trim(),
          position: position.trim(),
          age: parseInt(age),
          minutes: parseInt(minutes),
          defActions: parseFloat(defActions),
          defDuels: parseFloat(defDuels),
          defensiveDuelsWonPercentage: parseFloat(defensiveDuelsWonPercentage),
          aerialDuels: parseFloat(aerialDuels),
          aerialDuelsWonPercentage: parseFloat(aerialDuelsWonPercentage),
          slidingTackles: parseFloat(slidingTackles),
          pAdjSlidingTackles: parseFloat(pAdjSlidingTackles),
          shotsBlocked: parseFloat(shotsBlocked),
          interceptions: parseFloat(interceptions),
          pAdjInterceptions: parseFloat(pAdjInterceptions),
          successfulAttackingActions: parseFloat(successfulAttackingActions),
          goals: parseFloat(goals),
          nonPenaltyGoals: parseFloat(nonPenaltyGoals),
          xG: parseFloat(xG),
          headGoals: parseFloat(headGoals),
          shots: parseFloat(shots),
          shotsOnTargetPercentage: parseFloat(shotsOnTargetPercentage),
          goalConversionPercentage: parseFloat(goalConversionPercentage),
          assists: parseFloat(assists),
          crosses: parseFloat(crosses),
          accurateCrossesPercentage: parseFloat(accurateCrossesPercentage),
          crossesToGoalieBox: parseFloat(crossesToGoalieBox),
          dribbles: parseFloat(dribbles),
          successfulDribblesPercentage: parseFloat(successfulDribblesPercentage),
          offensiveDuels: parseFloat(offensiveDuels),
          offensiveDuelsWonPercentage: parseFloat(offensiveDuelsWonPercentage),
          touchesInBox: parseFloat(touchesInBox),
          progressiveRuns: parseFloat(progressiveRuns),
          accelerations: parseFloat(accelerations),
          foulsSuffered: parseFloat(foulsSuffered),
          passes: parseFloat(passes),
          accuratePassesPercentage: parseFloat(accuratePassesPercentage),
          forwardPasses: parseFloat(forwardPasses),
          accurateForwardPassesPercentage: parseFloat(accurateForwardPassesPercentage),
          shortMediumPasses: parseFloat(shortMediumPasses),
          accurateShortMediumPassesPercentage: parseFloat(accurateShortMediumPassesPercentage),
          longPasses: parseFloat(longPasses),
          accurateLongPassesPercentage: parseFloat(accurateLongPassesPercentage),
          xA: parseFloat(xA),
          shotAssists: parseFloat(shotAssists),
          preAssistsPerNinety: parseFloat(preAssistsPerNinety),
          keyPasses: parseFloat(keyPasses),
          passesToFinalThird: parseFloat(passesToFinalThird),
          accuratePassesToFinalThirdPercentage: parseFloat(accuratePassesToFinalThirdPercentage),
          passesToPenaltyArea: parseFloat(passesToPenaltyArea),
          accuratePassesToPenaltyAreaPercentage: parseFloat(accuratePassesToPenaltyAreaPercentage),
          throughPasses: parseFloat(throughPasses),
          deepCompletions: parseFloat(deepCompletions),
          progressivePasses: parseFloat(progressivePasses),
          accurateProgressivePassesPercentage: parseFloat(accurateProgressivePassesPercentage),
          goalsAgainstPerNinety: parseFloat(goalsAgainstPerNinety),
          shotsAgainst: parseFloat(shotsAgainst),
          cleanSheets: parseFloat(cleanSheets),
          saveRatePercentage: parseFloat(saveRatePercentage),
          xGAgainst: parseFloat(xGAgainst),
          preventedGoals: parseFloat(preventedGoals),
          exits: parseFloat(exits),
          duelsPerNinety: parseFloat(duelsPerNinety),
          duelsWonPercentage: parseFloat(duelsWonPercentage),
          possessionPlusMinus: parseFloat(possessionPlusMinus),
          forwardPassRatio: parseFloat(forwardPassRatio),
          xAPer100Passes: parseFloat(xAPer100Passes),
          chanceCreationRatio: parseFloat(chanceCreationRatio),
          goalsAndAssistsPerNinety: parseFloat(goalsAndAssistsPerNinety),
          npGoalsAndAssistsPerNinety: parseFloat(npGoalsAndAssistsPerNinety),
          xGAndxAPerNinety: parseFloat(xGAndxAPerNinety),
          goalsMinusxGPerNinety: parseFloat(goalsMinusxGPerNinety),
          successfulDribblesPerNinety: parseFloat(successfulDribblesPerNinety),
          shotsOnTargetPerNinety: parseFloat(shotsOnTargetPerNinety),
          accurateCrossesPerNinety: parseFloat(accurateCrossesPerNinety),
          offensiveDuelsWonPerNinety: parseFloat(offensiveDuelsWonPerNinety),
          defensiveDuelsWonPerNinety: parseFloat(defensiveDuelsWonPerNinety),
          aerialDuelsWonPerNinety: parseFloat(aerialDuelsWonPerNinety),
          passesCompletedPerNinety: parseFloat(passesCompletedPerNinety),
          forwardPassesCompletedPerNinety: parseFloat(forwardPassesCompletedPerNinety),
          shortPassesCompletedPerNinety: parseFloat(shortPassesCompletedPerNinety),
          longPassesCompletedPerNinety: parseFloat(longPassesCompletedPerNinety),
          accuratePassesToFinalThirdPerNinety: parseFloat(accuratePassesToFinalThirdPerNinety),
          accuratePassesToPenaltyBoxPerNinety: parseFloat(accuratePassesToPenaltyBoxPerNinety),
          throughPassesCompletedPerNinety: parseFloat(throughPassesCompletedPerNinety),
          progressivePassesCompletedPerNinety: parseFloat(progressivePassesCompletedPerNinety),
          savesPerNinety: parseFloat(savesPerNinety),
          possessionsWonMinusLostPerNinety: parseFloat(possessionsWonMinusLostPerNinety),
          progressiveActionsPerNinety: parseFloat(progressiveActionsPerNinety),
          duelsWonPerNinety: parseFloat(duelsWonPerNinety),
          npxGPerNinety: parseFloat(npxGPerNinety),
          npxGPerShot: parseFloat(npxGPerShot),
          npxGAndxAPerNinety: parseFloat(npxGAndxAPerNinety),
          touchesPerNinety: parseFloat(touchesPerNinety),
          progressiveActionRate: parseFloat(progressiveActionRate),
          progressivePassesPAdj: parseFloat(progressivePassesPAdj),
          ballCarryingFrequency: parseFloat(ballCarryingFrequency),
          xGPer100Touches: parseFloat(xGPer100Touches),
          shotFrequency: parseFloat(shotFrequency),
          dribblesPerHundredTouches: parseFloat(dribblesPerHundredTouches),
          goalsPer100Touches: parseFloat(goalsPer100Touches)
        };
      });
    }
  
  
    function getRankSuffix(rank) {
      // Check if rank is "N/A"
      if (rank === "N/A") {
        return ''; // Return empty string for "N/A"
      }
  
      const lastDigit = rank % 10;
      const lastTwoDigits = rank % 100;
      let suffix = 'th';
  
      if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        suffix = 'th';
      } else {
        switch (lastDigit) {
          case 1: suffix = 'st'; break;
          case 2: suffix = 'nd'; break;
          case 3: suffix = 'rd'; break;
          default: suffix = 'th'; break;
        }
      }
  
      // Use global translateRankSuffix function if available
      return window.translateRankSuffix ? window.translateRankSuffix(suffix) : suffix;
    }
  
  
    // Define a global variable to track sorting preference
    let sortEnabled = true;
  
  
    function displaySelectedPlayer() {
      document.getElementById('spinner').style.display = 'block';
      const playerSelect = document.getElementById('playerSelect');
      const selectedIndex = playerSelect.selectedIndex;
      const selectedPlayerName = playerSelect.options[selectedIndex].value;
      const selectedPlayerPosition = playerSelect.options[selectedIndex].getAttribute('data-position'); const selectedPlayerTeam = playerSelect.options[selectedIndex].textContent.split(', ')[2]; // Extract position
      const selectedPlayer = {
        player: selectedPlayerName,
        team: selectedPlayerTeam,
        position: selectedPlayerPosition // Include position in the selectedPlayer object
      };
      displayPlayerRankings(selectedPlayer);
      document.getElementById('spinner').style.display = 'none';
  
    }
  
  
    function calculateRankForMetric(data, metric, transformFn) {
  
      const processedData = data.map(transformFn || (p => p));
  
      // Store the first occurrence of each unique player-team combo
      const uniquePlayers = new Map();
      for (const player of processedData) {
        const key = `${player.player}-${player.team}`;
        if (!uniquePlayers.has(key)) {
          uniquePlayers.set(key, player);
        }
      }
      // Sort unique players by metric (Descending order)
      const sortedData = [...uniquePlayers.values()].sort((a, b) => b[metric] - a[metric]);
  
      // Assign ranks
      let rank = 1, prevValue = null;
      return sortedData.map((player, i) => {
        if (player[metric] === 0) return { player: player.player, team: player.team, rank: "N/A" };
        if (player[metric] !== prevValue) rank = i + 1;
        prevValue = player[metric];
        return { player: player.player, team: player.team, rank };
      });
    }
  
    const RANK_METRIC_CATALOG = [
    { column: "defActions", listName: "Possessions won", pizzaName: "Possessions won", minutesTransform: "round90" },
    { column: "defDuels", listName: "Defensive duels", pizzaName: "Defensive duels", minutesTransform: "round90" },
    { column: "aerialDuels", listName: "Aerial duels", pizzaName: "Aerial duels", minutesTransform: "round90" },
    { column: "slidingTackles", listName: "Sliding tackles", pizzaName: "Tackles", minutesTransform: "round90" },
    { column: "pAdjSlidingTackles", listName: "Sliding tackles (PAdj)", pizzaName: "Tackles (PAdj)", minutesTransform: "none" },
    { column: "shotsBlocked", listName: "Shots blocked", pizzaName: "Shots blocked", minutesTransform: "round90" },
    { column: "interceptions", listName: "Interceptions", pizzaName: "Interceptions", minutesTransform: "round90" },
    { column: "pAdjInterceptions", listName: "Interceptions (PAdj)", pizzaName: "Interceptions (PAdj)", minutesTransform: "none" },
    { column: "successfulAttackingActions", listName: "Successful attacking actions", pizzaName: "Attacking actions", minutesTransform: "round90" },
    { column: "goals", listName: "Goals", pizzaName: "Goals", minutesTransform: "round90" },
    { column: "nonPenaltyGoals", listName: "Non-penalty goals", pizzaName: "Non-penalty goals", minutesTransform: "round90" },
    { column: "xG", listName: "Expected goals (xG)", pizzaName: "Expected goals", minutesTransform: "minutes" },
    { column: "headGoals", listName: "Headed goals", pizzaName: "Headed goals", minutesTransform: "round90" },
    { column: "shots", listName: "Shots", pizzaName: "Shots", minutesTransform: "round90" },
    { column: "assists", listName: "Assists", pizzaName: "Assists", minutesTransform: "round90" },
    { column: "crosses", listName: "Crosses", pizzaName: "Crosses", minutesTransform: "round90" },
    { column: "crossesToGoalieBox", listName: "Crosses to box", pizzaName: "Crosses to box", minutesTransform: "round90" },
    { column: "dribbles", listName: "Dribbles attempted", pizzaName: "Dribbles attempted", minutesTransform: "round90" },
    { column: "offensiveDuels", listName: "Offensive duels", pizzaName: "Offensive duels", minutesTransform: "round90" },
    { column: "touchesInBox", listName: "Touches in box", pizzaName: "Touches in box", minutesTransform: "round90" },
    { column: "progressiveRuns", listName: "Progressive carries", pizzaName: "Progressive carries", minutesTransform: "round90" },
    { column: "accelerations", listName: "Accelerations", pizzaName: "Accelerations", minutesTransform: "round90" },
    { column: "foulsSuffered", listName: "Fouls suffered", pizzaName: "Fouls suffered", minutesTransform: "round90" },
    { column: "passes", listName: "Passes", pizzaName: "Passes", minutesTransform: "round90" },
    { column: "forwardPasses", listName: "Forward passes", pizzaName: "Forward passes", minutesTransform: "round90" },
    { column: "shortMediumPasses", listName: "Short passes", pizzaName: "Short passes", minutesTransform: "round90" },
    { column: "longPasses", listName: "Long passes", pizzaName: "Long passes", minutesTransform: "round90" },
    { column: "xA", listName: "Expected assists (xA)", pizzaName: "Expected assists", minutesTransform: "minutes" },
    { column: "shotAssists", listName: "Shot assists", pizzaName: "Shot assists", minutesTransform: "round90" },
    { column: "keyPasses", listName: "Key passes", pizzaName: "Key passes", minutesTransform: "round90" },
    { column: "passesToFinalThird", listName: "Passes to final third", pizzaName: "Passes to fin 3rd", minutesTransform: "round90" },
    { column: "passesToPenaltyArea", listName: "Passes to penalty box", pizzaName: "Passes to pen box", minutesTransform: "round90" },
    { column: "throughPasses", listName: "Through passes", pizzaName: "Through passes", minutesTransform: "round90" },
    { column: "deepCompletions", listName: "Deep completions", pizzaName: "Deep completions", minutesTransform: "round90" },
    { column: "progressivePasses", listName: "Progressive passes", pizzaName: "Progressive passes", minutesTransform: "round90" },
    { column: "shotsAgainst", listName: "Shots conceded", pizzaName: "Shots conceded", minutesTransform: "round90" },
    { column: "cleanSheets", listName: "Clean sheets", pizzaName: "Clean sheets", minutesTransform: "none" },
    { column: "xGAgainst", listName: "xG conceded", pizzaName: "xG conceded", minutesTransform: "minutes" },
    { column: "preventedGoals", listName: "Prevented goals (PSxG-GA)", pizzaName: "Prevented goals", minutesTransform: "minutes" },
    { column: "exits", listName: "Line exits", pizzaName: "Line exits", minutesTransform: "round90" },
    { column: "defensiveDuelsWonPercentage", listName: "Defensive duels won %", pizzaName: "Defensive duel %", minutesTransform: "none" },
    { column: "aerialDuelsWonPercentage", listName: "Aerial duels won %", pizzaName: "Aerial duel %", minutesTransform: "none" },
    { column: "shotsOnTargetPercentage", listName: "Shots on target %", pizzaName: "SoT %", minutesTransform: "none" },
    { column: "goalConversionPercentage", listName: "Goal conversion %", pizzaName: "Goal conversion", minutesTransform: "none" },
    { column: "accurateCrossesPercentage", listName: "Cross accuracy %", pizzaName: "Cross %", minutesTransform: "none" },
    { column: "successfulDribblesPercentage", listName: "Dribble success rate %", pizzaName: "Dribble success %", minutesTransform: "none" },
    { column: "offensiveDuelsWonPercentage", listName: "Offensive duels won %", pizzaName: "Offensive duel %", minutesTransform: "none" },
    { column: "accuratePassesPercentage", listName: "Pass completion %", pizzaName: "Pass %", minutesTransform: "none" },
    { column: "accurateForwardPassesPercentage", listName: "Forward pass completion %", pizzaName: "Forward pass %", minutesTransform: "none" },
    { column: "accurateShortMediumPassesPercentage", listName: "Short pass completion %", pizzaName: "Short pass %", minutesTransform: "none" },
    { column: "accurateLongPassesPercentage", listName: "Long pass accuracy %", pizzaName: "Long pass %", minutesTransform: "none" },
    { column: "accuratePassesToFinalThirdPercentage", listName: "Pass completion (to final third) %", pizzaName: "Pass to fin 3rd %", minutesTransform: "none" },
    { column: "accuratePassesToPenaltyAreaPercentage", listName: "Pass completion (to penalty box) %", pizzaName: "Pass to pen box %", minutesTransform: "none" },
    { column: "accurateProgressivePassesPercentage", listName: "Progressive pass accuracy %", pizzaName: "Progressive pass %", minutesTransform: "none" },
    { column: "saveRatePercentage", listName: "Save percentage %", pizzaName: "Save %", minutesTransform: "none" },
    { column: "preAssistsPerNinety", listName: "Pre-assists", pizzaName: "Pre-assists", minutesTransform: "round90" },
    { column: "duelsPerNinety", listName: "Duels", pizzaName: "Duels", minutesTransform: "round90" },
    { column: "duelsWonPercentage", listName: "Duels won %", pizzaName: "Duel %", minutesTransform: "none" },
    { column: "possessionPlusMinus", listName: "Possession +/-", pizzaName: "Poss +/-", minutesTransform: "none" },
    { column: "forwardPassRatio", listName: "Forward pass ratio", pizzaName: "Forward pass ratio", minutesTransform: "none" },
    { column: "xAPer100Passes", listName: "xA per 100 passes", pizzaName: "xA per 100 passes", minutesTransform: "none" },
    { column: "chanceCreationRatio", listName: "Chance creation ratio", pizzaName: "Creativity ratio", minutesTransform: "none" },
    { column: "goalsAndAssistsPerNinety", listName: "Goals + assists", pizzaName: "Goals + assists", minutesTransform: "round90" },
    { column: "npGoalsAndAssistsPerNinety", listName: "Non-penalty goals + assists", pizzaName: "NPG+A", minutesTransform: "round90" },
    { column: "xGAndxAPerNinety", listName: "xG + xA", pizzaName: "xG + xA", minutesTransform: "float90" },
    { column: "goalsMinusxGPerNinety", listName: "Goals - xG", pizzaName: "Goals - xG", minutesTransform: "float90" },
    { column: "successfulDribblesPerNinety", listName: "Successful dribbles", pizzaName: "Successful dribbles", minutesTransform: "round90" },
    { column: "shotsOnTargetPerNinety", listName: "Shots on target", pizzaName: "Shots on target", minutesTransform: "round90" },
    { column: "accurateCrossesPerNinety", listName: "Accurate crosses", pizzaName: "Accurate crosses", minutesTransform: "round90" },
    { column: "offensiveDuelsWonPerNinety", listName: "Offensive duels won", pizzaName: "Offensive duels won", minutesTransform: "round90" },
    { column: "defensiveDuelsWonPerNinety", listName: "Defensive duels won", pizzaName: "Defensive duels won", minutesTransform: "round90" },
    { column: "aerialDuelsWonPerNinety", listName: "Aerial duels won", pizzaName: "Aerial duels won", minutesTransform: "round90" },
    { column: "passesCompletedPerNinety", listName: "Passes completed", pizzaName: "Passes completed", minutesTransform: "round90" },
    { column: "forwardPassesCompletedPerNinety", listName: "Forward passes completed", pizzaName: "Fwd passes comp", minutesTransform: "round90" },
    { column: "shortPassesCompletedPerNinety", listName: "Short passes completed", pizzaName: "Short passes comp", minutesTransform: "round90" },
    { column: "longPassesCompletedPerNinety", listName: "Long passes completed", pizzaName: "Long passes comp", minutesTransform: "round90" },
    { column: "accuratePassesToFinalThirdPerNinety", listName: "Accurate passes to final third", pizzaName: null, minutesTransform: "round90" },
    { column: "throughPassesCompletedPerNinety", listName: "Through passes completed", pizzaName: "Through passes comp", minutesTransform: "round90" },
    { column: "progressivePassesCompletedPerNinety", listName: "Progressive passes completed", pizzaName: "Prog passes comp", minutesTransform: "round90" },
    { column: "savesPerNinety", listName: "Saves", pizzaName: "Saves", minutesTransform: "round90" },
    { column: "possessionsWonMinusLostPerNinety", listName: "Possessions won - lost", pizzaName: "Poss won-lost", minutesTransform: "round90" },
    { column: "progressiveActionsPerNinety", listName: "Progressive actions", pizzaName: "Progressive actions", minutesTransform: "round90" },
    { column: "duelsWonPerNinety", listName: "Duels won", pizzaName: "Duels won", minutesTransform: "round90" },
    { column: "npxGPerNinety", listName: "Non-penalty xG", pizzaName: "Non-penalty xG", minutesTransform: "float90" },
    { column: "npxGPerShot", listName: "npxG/Shot", pizzaName: "npxG/Shot", minutesTransform: "none" },
    { column: "npxGAndxAPerNinety", listName: "npxG + xA", pizzaName: "npxG + xA", minutesTransform: "float90" },
    { column: "touchesPerNinety", listName: "Touches", pizzaName: "Touches", minutesTransform: "round90" },
    { column: "progressiveActionRate", listName: "Progressive action rate", pizzaName: "Prog action rate", minutesTransform: "none" },
    { column: "progressivePassesPAdj", listName: "Progressive passes (PAdj)", pizzaName: "Prog passes (PAdj)", minutesTransform: "none" },
    { column: "ballCarryingFrequency", listName: "Ball carrying frequency", pizzaName: "Carrying frequency", minutesTransform: "none" },
    { column: "xGPer100Touches", listName: "xG per 100 touches", pizzaName: "xG per 100T", minutesTransform: "none" },
    { column: "shotFrequency", listName: "Shot frequency", pizzaName: "Shot frequency", minutesTransform: "none" },
    { column: "dribblesPerHundredTouches", listName: "Dribbles per 100 touches", pizzaName: "Dribbles per 100T", minutesTransform: "none" },
    { column: "goalsPer100Touches", listName: "Goals per 100 touches", pizzaName: "Goal per 100T", minutesTransform: "none" }
    ];

    const PIZZA_METRIC_ORDER = [
    "Defensive duels",
    "Defensive duels won",
    "Aerial duels",
    "Aerial duels won",
    "Defensive duel %",
    "Aerial duel %",
    "Possessions won",
    "Tackles",
    "Tackles (PAdj)",
    "Interceptions",
    "Interceptions (PAdj)",
    "Shots blocked",
    "Duels",
    "Duels won",
    "Duel %",
    "Poss won-lost",
    "Poss +/-",
    "Touches",
    "Touches in box",
    "Goals",
    "Non-penalty goals",
    "Expected goals",
    "Headed goals",
    "Shots",
    "SoT %",
    "Shots on target",
    "Goals - xG",
    "Non-penalty xG",
    "Goal per 100T",
    "xG per 100T",
    "Shot frequency",
    "Goal conversion",
    "npxG/Shot",
    "xG + xA",
    "npxG + xA",
    "Goals + assists",
    "NPG+A",
    "Assists",
    "Expected assists",
    "Key passes",
    "Shot assists",
    "xA per 100 passes",
    "Creativity ratio",
    "Deep completions",
    "Crosses",
    "Accurate crosses",
    "Cross %",
    "Crosses to box",
    "Passes",
    "Passes completed",
    "Forward passes",
    "Fwd passes comp",
    "Short passes",
    "Short passes comp",
    "Long passes",
    "Long passes comp",
    "Progressive passes",
    "Prog passes comp",
    "Prog passes (PAdj)",
    "Passes to fin 3rd",
    "Passes to pen box",
    "Through passes",
    "Through passes comp",
    "Pass %",
    "Forward pass %",
    "Short pass %",
    "Progressive pass %",
    "Long pass %",
    "Pass to fin 3rd %",
    "Pass to pen box %",
    "Pre-assists",
    "Forward pass ratio",
    "Progressive actions",
    "Prog action rate",
    "Progressive carries",
    "Carrying frequency",
    "Accelerations",
    "Offensive duels",
    "Offensive duels won",
    "Offensive duel %",
    "Dribbles attempted",
    "Successful dribbles",
    "Dribble success %",
    "Dribbles per 100T",
    "Attacking actions",
    "Fouls suffered",
    "Save %",
    "Saves",
    "Shots conceded",
    "Clean sheets",
    "xG conceded",
    "Prevented goals",
    "Line exits"
    ];

    const POSITION_ORDER = {
      'Goalkeeper': [
        'Prevented goals (PSxG-GA)',
        'Saves',
        'Save percentage %',
        'Clean sheets',
        'Shots conceded',
        'xG conceded',
        'Line exits',
        'Touches',
        'Passes',
        'Passes completed',
        'Pass completion %',
        'Short passes',
        'Short passes completed',
        'Short pass completion %',
        'Long passes',
        'Long passes completed',
        'Long pass accuracy %',
        'Passes to final third',
        'Progressive passes',
        'Pass completion (to final third) %',
        'Progressive pass accuracy %',
        'Through passes',
        'Defensive duels won',
        'Aerial duels won',
        'Possessions won',
        'Interceptions'
      ],
      'Centre-back': [
        'Defensive duels',
        'Defensive duels won',
        'Defensive duels won %',
        'Aerial duels',
        'Aerial duels won',
        'Aerial duels won %',
        'Sliding tackles',
        'Sliding tackles (PAdj)',
        'Interceptions',
        'Interceptions (PAdj)',
        'Shots blocked',
        'Possessions won',
        'Possessions won - lost',
        'Possession +/-',
        'Touches',
        'Passes',
        'Passes completed',
        'Pass completion %',
        'Forward passes',
        'Forward passes completed',
        'Forward pass completion %',
        'Forward pass ratio',
        'Short passes',
        'Short passes completed',
        'Short pass completion %',
        'Long passes',
        'Long passes completed',
        'Long pass accuracy %',
        'Progressive passes',
        'Progressive passes completed',
        'Progressive pass accuracy %',
        'Progressive passes (PAdj)',
        'Passes to final third',
        'Accurate passes to final third',
        'Pass completion (to final third) %',
        'Passes to penalty box',
        'Through passes completed',
        'Progressive carries',
        'Progressive actions',
        'Progressive action rate',
        'Ball carrying frequency',
        'Successful dribbles',
        'Key passes',
        'Assists',
        'Goals',
        'Headed goals'
      ],
      'Full-back': [
        'Defensive duels',
        'Defensive duels won',
        'Defensive duels won %',
        'Aerial duels',
        'Aerial duels won',
        'Aerial duels won %',
        'Sliding tackles',
        'Sliding tackles (PAdj)',
        'Interceptions',
        'Interceptions (PAdj)',
        'Shots blocked',
        'Possessions won',
        'Possessions won - lost',
        'Possession +/-',
        'Duels',
        'Duels won',
        'Duels won %',
        'Touches',
        'Touches in box',
        'Progressive actions',
        'Progressive action rate',
        'Progressive carries',
        'Accelerations',
        'Ball carrying frequency',
        'Dribbles attempted',
        'Successful dribbles',
        'Fouls suffered',
        'Offensive duels',
        'Offensive duels won',
        'Offensive duels won %',
        'Successful attacking actions',
        'Crosses',
        'Accurate crosses',
        'Cross accuracy %',
        'Crosses to box',
        'Deep completions',
        'Assists',
        'Expected assists (xA)',
        'Shot assists',
        'Key passes',
        'xA per 100 passes',
        'Chance creation ratio',
        'Goals',
        'Expected goals (xG)',
        'Goals + assists',
        'xG + xA',
        'Passes',
        'Passes completed',
        'Pass completion %',
        'Forward passes',
        'Forward passes completed',
        'Forward pass completion %',
        'Forward pass ratio',
        'Short passes',
        'Short passes completed',
        'Short pass completion %',
        'Long passes',
        'Long passes completed',
        'Progressive passes',
        'Progressive passes completed',
        'Progressive pass accuracy %',
        'Progressive passes (PAdj)',
        'Passes to final third',
        'Accurate passes to final third',
        'Pass completion (to final third) %',
        'Passes to penalty box',
        'Pass completion (to penalty box) %',
        'Through passes completed'
      ],
      'Midfielder': [
        'Passes',
        'Passes completed',
        'Pass completion %',
        'Forward passes',
        'Forward passes completed',
        'Forward pass completion %',
        'Forward pass ratio',
        'Short passes',
        'Short passes completed',
        'Short pass completion %',
        'Long passes',
        'Long passes completed',
        'Long pass accuracy %',
        'Progressive passes',
        'Progressive passes completed',
        'Progressive pass accuracy %',
        'Progressive passes (PAdj)',
        'Passes to final third',
        'Accurate passes to final third',
        'Pass completion (to final third) %',
        'Passes to penalty box',
        'Pass completion (to penalty box) %',
        'Through passes',
        'Through passes completed',
        'Possession +/-',
        'Possessions won - lost',
        'Possessions won',
        'Defensive duels',
        'Defensive duels won',
        'Defensive duels won %',
        'Aerial duels',
        'Aerial duels won',
        'Aerial duels won %',
        'Sliding tackles',
        'Sliding tackles (PAdj)',
        'Interceptions',
        'Interceptions (PAdj)',
        'Shots blocked',
        'Pre-assists',
        'Assists',
        'Expected assists (xA)',
        'Shot assists',
        'xA per 100 passes',
        'Key passes',
        'Chance creation ratio',
        'Crosses',
        'Accurate crosses',
        'Cross accuracy %',
        'Crosses to box',
        'Deep completions',
        'Goals + assists',
        'Non-penalty goals + assists',
        'xG + xA',
        'npxG + xA',
        'Goals',
        'Non-penalty goals',
        'Expected goals (xG)',
        'Headed goals',
        'Non-penalty xG',
        'Shots',
        'Shots on target',
        'npxG/Shot',
        'Goals - xG',
        'xG per 100 touches',
        'Goals per 100 touches',
        'Duels',
        'Duels won',
        'Duels won %',
        'Touches',
        'Touches in box',
        'Progressive actions',
        'Progressive action rate',
        'Progressive carries',
        'Accelerations',
        'Ball carrying frequency',
        'Dribbles attempted',
        'Successful dribbles',
        'Dribble success rate %',
        'Dribbles per 100 touches',
        'Successful attacking actions',
        'Fouls suffered',
        'Offensive duels',
        'Offensive duels won',
        'Offensive duels won %'
      ],
      'Winger': [
        'Goals + assists',
        'Non-penalty goals + assists',
        'xG + xA',
        'npxG + xA',
        'Assists',
        'Expected assists (xA)',
        'Shot assists',
        'Key passes',
        'xA per 100 passes',
        'Chance creation ratio',
        'Crosses',
        'Accurate crosses',
        'Cross accuracy %',
        'Crosses to box',
        'Deep completions',
        'Goals',
        'Non-penalty goals',
        'Expected goals (xG)',
        'Non-penalty xG',
        'Goals per 100 touches',
        'xG per 100 touches',
        'Headed goals',
        'Shots',
        'Shots on target',
        'Shots on target %',
        'Goal conversion %',
        'Shot frequency',
        'npxG/Shot',
        'Goals - xG',
        'Dribbles attempted',
        'Successful dribbles',
        'Dribble success rate %',
        'Dribbles per 100 touches',
        'Offensive duels',
        'Offensive duels won',
        'Offensive duels won %',
        'Progressive carries',
        'Accelerations',
        'Ball carrying frequency',
        'Fouls suffered',
        'Successful attacking actions',
        'Duels won',
        'Duels won %',
        'Touches in box',
        'Touches',
        'Passes',
        'Passes completed',
        'Pass completion %',
        'Long passes',
        'Progressive passes',
        'Progressive pass accuracy %',
        'Progressive passes (PAdj)',
        'Passes to final third',
        'Passes to penalty box',
        'Pass completion (to penalty box) %',
        'Through passes completed',
        'Progressive actions',
        'Progressive action rate',
        'Possession +/-',
        'Possessions won - lost',
        'Interceptions',
        'Defensive duels won',
        'Aerial duels won',
        'Aerial duels won %',
        'Possessions won'
      ],
      'Striker': [
        'Goals',
        'Non-penalty goals',
        'Goals per 100 touches',
        'Expected goals (xG)',
        'Non-penalty xG',
        'xG per 100 touches',
        'Shots',
        'Shots on target',
        'Shots on target %',
        'Goal conversion %',
        'Shot frequency',
        'npxG/Shot',
        'Goals - xG',
        'Headed goals',
        'Touches in box',
        'Goals + assists',
        'Non-penalty goals + assists',
        'xG + xA',
        'npxG + xA',
        'Assists',
        'Expected assists (xA)',
        'Shot assists',
        'Key passes',
        'xA per 100 passes',
        'Chance creation ratio',
        'Accurate crosses',
        'Successful attacking actions',
        'Progressive carries',
        'Accelerations',
        'Ball carrying frequency',
        'Dribbles attempted',
        'Successful dribbles',
        'Dribbles per 100 touches',
        'Fouls suffered',
        'Touches',
        'Duels won',
        'Duels won %',
        'Offensive duels',
        'Offensive duels won',
        'Offensive duels won %',
        'Passes',
        'Passes completed',
        'Pass completion %',
        'Progressive passes',
        'Progressive pass accuracy %',
        'Through passes completed',
        'Progressive actions',
        'Progressive action rate',
        'Possessions won',
        'Interceptions',
        'Aerial duels',
        'Aerial duels won',
        'Aerial duels won %',
        'Defensive duels won'
      ]
    };

    const EXCLUSION_MAPPING_DEFAULT = {
      'Goalkeeper': [
        'Defensive duels',
        'Tackles',
        'Tackles (PAdj)',
        'Shots blocked',
        'Interceptions',
        'Interceptions (PAdj)',
        'Attacking actions',
        'Goals',
        'Non-penalty goals',
        'Expected goals',
        'Headed goals',
        'Shots',
        'Assists',
        'Crosses',
        'Crosses to box',
        'Dribbles attempted',
        'Offensive duels',
        'Touches in box',
        'Progressive carries',
        'Accelerations',
        'Fouls suffered',
        'Forward passes',
        'Expected assists',
        'Shot assists',
        'Key passes',
        'Passes to fin 3rd',
        'Passes to pen box',
        'Through passes',
        'Deep completions',
        'Progressive passes',
        'Shots conceded',
        'xG conceded',
        'Defensive duel %',
        'Aerial duel %',
        'SoT %',
        'Goal conversion',
        'Cross %',
        'Dribble success %',
        'Offensive duel %',
        'Forward pass %',
        'Pass to fin 3rd %',
        'Pass to pen box %',
        'Progressive pass %',
        'Pre-assists',
        'Duels',
        'Duel %',
        'Poss +/-',
        'Forward pass ratio',
        'xA per 100 passes',
        'Creativity ratio',
        'Goals + assists',
        'NPG+A',
        'xG + xA',
        'Goals - xG',
        'Successful dribbles',
        'Shots on target',
        'Accurate crosses',
        'Offensive duels won',
        'Defensive duels won',
        'Aerial duels',
        'Passes completed',
        'Fwd passes comp',
        'Through passes comp',
        'Prog passes comp',
        'Poss won-lost',
        'Progressive actions',
        'Duels won',
        'Non-penalty xG',
        'npxG/Shot',
        'npxG + xA',
        'Touches',
        'Prog action rate',
        'Prog passes (PAdj)',
        'Carrying frequency',
        'xG per 100T',
        'Shot frequency',
        'Dribbles per 100T',
        'Goal per 100T',
        'Short passes comp', 'Long passes comp', 'Possessions won'
      ],
      'Centre-back': [
        'Long passes comp', 'Short passes comp', 'SoT %', 'Long passes', 'Short passes',
        'Long pass %',
        'Tackles',
        'Shots blocked',
        'Interceptions',
        'Attacking actions',
        'Goals',
        'Non-penalty goals',
        'Expected goals',
        'Headed goals',
        'Shots',
        'Assists',
        'Crosses',
        'Crosses to box',
        'Dribbles attempted',
        'Offensive duels',
        'Touches in box',
        'Accelerations',
        'Fouls suffered',
        'Forward passes',
        'Expected assists',
        'Shot assists',
        'Key passes',
        'Passes to fin 3rd',
        'Passes to pen box',
        'Through passes',
        'Deep completions',
        'Shots conceded',
        'Clean sheets',
        'xG conceded',
        'Prevented goals',
        'Line exits',
        'Goal conversion',
        'Cross %',
        'Dribble success %',
        'Offensive duel %',
        'Forward pass %',
        'Pass to fin 3rd %',
        'Pass to pen box %',
        'Progressive pass %',
        'Save %',
        'Pre-assists',
        'Duels',
        'Duel %',
        'Short pass %',
        'Forward pass ratio',
        'xA per 100 passes',
        'Creativity ratio',
        'Goals + assists',
        'NPG+A',
        'xG + xA',
        'Goals - xG',
        'Successful dribbles',
        'Shots on target',
        'Accurate crosses',
        'Offensive duels won',
        'Defensive duels',
        'Aerial duels',
        'Passes completed',
        'Fwd passes comp',
        'Through passes comp',
        'Prog passes comp',
        'Saves',
        'Poss won-lost',
        'Progressive actions',
        'Duels won',
        'Non-penalty xG',
        'npxG/Shot',
        'npxG + xA',
        'Touches',
        'Prog action rate',
        'Prog passes (PAdj)',
        'Carrying frequency',
        'xG per 100T',
        'Shot frequency',
        'Dribbles per 100T',
        'Goal per 100T'
      ],
      'Full-back': [
        'Short passes', 'Long passes', 'Passes', 'Short pass %', 'Long pass %', 'Aerial duels',
        'Defensive duels',
        'Tackles',
        'Shots blocked',
        'Interceptions',
        'Goals',
        'Non-penalty goals',
        'Expected goals',
        'Headed goals',
        'Shots',
        'Assists',
        'Crosses to box',
        'Dribbles attempted',
        'Offensive duels',
        'Touches in box',
        'Accelerations',
        'Fouls suffered',
        'Forward passes',
        'Shot assists',
        'Key passes',
        'Passes to fin 3rd',
        'Passes to pen box',
        'Through passes',
        'Deep completions',
        'Shots conceded',
        'Clean sheets',
        'xG conceded',
        'Prevented goals',
        'Line exits',
        'SoT %',
        'Goal conversion',
        'Dribble success %',
        'Offensive duel %',
        'Forward pass %',
        'Pass to fin 3rd %',
        'Pass to pen box %',
        'Progressive pass %',
        'Save %',
        'Pre-assists',
        'Duels',
        'Duel %',
        'Poss +/-',
        'Forward pass ratio',
        'xA per 100 passes',
        'Creativity ratio',
        'Goals + assists',
        'NPG+A',
        'xG + xA',
        'Goals - xG',
        'Successful dribbles',
        'Shots on target',
        'Accurate crosses',
        'Offensive duels won',
        'Defensive duels won',
        'Aerial duels won',
        'Passes completed',
        'Fwd passes comp',
        'Short passes comp',
        'Long passes comp',
        'Through passes comp',
        'Prog passes comp',
        'Saves',
        'Poss won-lost',
        'Progressive actions',
        'Attacking actions',
        'Non-penalty xG',
        'npxG/Shot',
        'npxG + xA',
        'Touches',
        'Prog action rate',
        'Prog passes (PAdj)',
        'Carrying frequency',
        'xG per 100T',
        'Shot frequency',
        'Dribbles per 100T',
        'Goal per 100T'
      ]
      ,
      'Midfielder': [
        'Cross %', 'Short pass %', 'Long pass %', 'Prog passes (PAdj)', 'Aerial duels', 'Short passes', 'Long passes',
        'Goals', 'Defensive duels won', 'Possessions won', 'Defensive duels', 'Tackles', 'Shots blocked', 'Interceptions',
        'Non-penalty goals',
        'Expected goals',
        'Headed goals',
        'Shots',
        'Assists',
        'Crosses',
        'Crosses to box',
        'Dribbles attempted',
        'Offensive duels',
        'Touches in box',
        'Accelerations',
        'Fouls suffered',
        'Forward passes',
        'Shot assists',
        'Passes to fin 3rd',
        'Passes to pen box',
        'Through passes',
        'Deep completions',
        'Shots conceded',
        'Clean sheets',
        'xG conceded',
        'Prevented goals',
        'Line exits',
        'SoT %',
        'Goal conversion',
        'Dribble success %',
        'Offensive duel %',
        'Pass to fin 3rd %',
        'Pass to pen box %',
        'Progressive pass %',
        'Save %',
        'Pre-assists',
        'Duels',
        'Duel %',
        'Poss +/-',
        'Forward pass ratio',
        'Creativity ratio',
        'Goals + assists',
        'NPG+A',
        'Expected assists',
        'Goals - xG',
        'Successful dribbles',
        'Shots on target',
        'Accurate crosses',
        'Offensive duels won',
        'Defensive duels won',
        'Aerial duels won',
        'Passes completed',
        'Fwd passes comp',
        'Short passes comp',
        'Long passes comp',
        'Through passes comp',
        'Prog passes comp',
        'Saves',
        'Poss won-lost',
        'Progressive actions',
        'Attacking actions',
        'Non-penalty xG',
        'npxG/Shot',
        'xG + xA',
        'xA per 100 passes',
        'Touches',
        'Prog action rate',
        'Carrying frequency',
        'xG per 100T',
        'Shot frequency',
        'Dribbles per 100T',
        'Goal per 100T'
      ]
      ,
      'Winger': [
        'Possessions won', 'Progressive passes',
        'Poss won-lost',
        'Tackles',
        'Tackles (PAdj)',
        'Shots blocked',
        'Interceptions',
        'Interceptions (PAdj)',
        'Non-penalty goals',
        'Headed goals',
        'Shots',
        'Crosses to box',
        'Offensive duels',
        'Touches in box',
        'Accelerations',
        'Fouls suffered',
        'Forward passes',
        'Shot assists',
        'Passes to fin 3rd',
        'Passes to pen box',
        'Through passes',
        'Deep completions',
        'Shots conceded',
        'Clean sheets',
        'xG conceded',
        'Prevented goals',
        'Line exits',
        'SoT %',
        'Defensive duels won',
        'Offensive duel %',
        'Forward pass %',
        'Pass to fin 3rd %',
        'Pass to pen box %',
        'Progressive pass %',
        'Save %',
        'Pre-assists',
        'Duels',
        'Duel %',
        'Poss +/-',
        'Forward pass ratio',
        'xA per 100 passes',
        'Creativity ratio',
        'NPG+A',
        'xG + xA',
        'Goals - xG',
        'Shots on target',
        'Accurate crosses',
        'Offensive duels won',
        'Defensive duels',
        'Aerial duels won',
        'Passes completed',
        'Fwd passes comp',
        'Short passes comp',
        'Long passes comp',
        'Through passes comp',
        'Prog passes comp',
        'Saves',
        'Goals + assists', 'Long pass %', 'Short pass %', 'Cross %', 'Aerial duel %', 'Defensive duel %', 'Long passes', 'Short passes', 'Passes', 'Aerial duels', 'Dribbles attempted',
        'Progressive actions',
        'Attacking actions',
        'Non-penalty xG',
        'npxG/Shot',
        'npxG + xA',
        'Touches',
        'Prog action rate',
        'Prog passes (PAdj)',
        'Carrying frequency',
        'xG per 100T',
        'Shot frequency',
        'Dribbles per 100T',
        'Goal per 100T'
      ],
      'Striker': [
        'Cross %', 'Pass %', 'Short pass %', 'Long pass %', 'Goals + assists', 'Crosses', 'Progressive carries', 'Passes', 'Short passes', 'Long passes', 'Defensive duel %', 'Progressive passes',
        'Possessions won',
        'Defensive duels',
        'Tackles',
        'Tackles (PAdj)',
        'Shots blocked',
        'Interceptions',
        'Interceptions (PAdj)',
        'Headed goals',
        'Shots',
        'Crosses to box',
        'Offensive duels',
        'Successful dribbles',
        'Dribbles attempted',
        'Touches in box',
        'Accelerations',
        'Fouls suffered',
        'Forward passes',
        'Shot assists',
        'Passes to fin 3rd',
        'Passes to pen box',
        'Through passes',
        'Deep completions',
        'Shots conceded',
        'Clean sheets',
        'xG conceded',
        'Prevented goals',
        'Line exits',
        'Dribble success %',
        'Offensive duel %',
        'Forward pass %',
        'Pass to fin 3rd %',
        'Pass to pen box %',
        'Progressive pass %',
        'Save %',
        'Pre-assists',
        'Duels',
        'Duel %',
        'Poss +/-',
        'Forward pass ratio',
        'xA per 100 passes',
        'Creativity ratio',
        'NPG+A',
        'xG + xA',
        'Goals - xG',
        'Shots on target',
        'Accurate crosses',
        'Offensive duels won',
        'Defensive duels won',
        'Aerial duels won',
        'Passes completed',
        'Fwd passes comp',
        'Short passes comp',
        'Long passes comp',
        'Through passes comp',
        'Prog passes comp',
        'Saves',
        'Poss won-lost',
        'Progressive actions',
        'Attacking actions',
        'Non-penalty xG',
        'SoT %',
        'npxG + xA',
        'Key passes',
        'Prog action rate',
        'Prog passes (PAdj)',
        'Aerial duels',
        'xG per 100T',
        'Shot frequency',
        'Dribbles per 100T',
        'Goal per 100T'
      ]
    };

    const PIZZA_PRESETS = {
    "offensive": [
      "Goals",
      "Non-penalty goals",
      "Expected goals",
      "Non-penalty xG",
      "Shots",
      "Shots on target",
      "SoT %",
      "Goal conversion",
      "npxG/Shot",
      "Goals - xG",
      "Goal per 100T",
      "xG per 100T",
      "Shot frequency",
      "Assists",
      "Expected assists",
      "Key passes",
      "Shot assists",
      "xA per 100 passes",
      "Creativity ratio",
      "Goals + assists",
      "NPG+A",
      "xG + xA",
      "npxG + xA",
      "Crosses",
      "Accurate crosses",
      "Cross %",
      "Crosses to box",
      "Deep completions",
      "Dribbles attempted",
      "Successful dribbles",
      "Dribble success %",
      "Dribbles per 100T",
      "Offensive duels",
      "Offensive duels won",
      "Offensive duel %",
      "Progressive carries",
      "Accelerations",
      "Carrying frequency",
      "Touches in box",
      "Attacking actions",
      "Fouls suffered"
    ],
    "defensive": [
      "Defensive duels",
      "Defensive duels won",
      "Defensive duel %",
      "Aerial duels",
      "Aerial duels won",
      "Aerial duel %",
      "Tackles",
      "Tackles (PAdj)",
      "Interceptions",
      "Interceptions (PAdj)",
      "Shots blocked",
      "Possessions won",
      "Poss won-lost",
      "Poss +/-",
      "Duels",
      "Duels won",
      "Duel %",
      "Save %",
      "Saves",
      "Shots conceded",
      "Clean sheets",
      "xG conceded",
      "Prevented goals",
      "Line exits"
    ],
    "profile": [
      "Goals",
      "Assists",
      "Expected goals",
      "Expected assists",
      "xG + xA",
      "Progressive passes",
      "Prog passes (PAdj)",
      "Progressive carries",
      "Progressive actions",
      "Prog action rate",
      "Touches",
      "Pass %",
      "Defensive duels won",
      "Aerial duels won",
      "Successful dribbles",
      "Key passes"
    ],
    "archetype": [
      "Goals",
      "Non-penalty goals",
      "Expected goals",
      "Shots",
      "Assists",
      "Expected assists",
      "Key passes",
      "Progressive carries",
      "Dribbles attempted",
      "Successful dribbles",
      "Progressive passes",
      "Pass %",
      "Defensive duels won",
      "Interceptions",
      "Aerial duels won",
      "Possessions won",
      "Touches",
      "Touches in box"
    ]
  };

    let showPercentileRanks = false;
    let listHiddenMetrics = new Set();
    let listCustomOrder = null; // null = use position/default order
    let rankRenderContext = null;

    function deepCloneExclusions() {
      const clone = {};
      Object.keys(EXCLUSION_MAPPING_DEFAULT).forEach(pos => {
        clone[pos] = [...EXCLUSION_MAPPING_DEFAULT[pos]];
      });
      return clone;
    }

    function buildMinutesTransform(column, kind) {
      if (kind === 'round90') {
        return p => ({ ...p, [column]: Math.round(p[column] * p.minutes / 90) });
      }
      if (kind === 'float90') {
        return p => ({ ...p, [column]: p[column] * p.minutes / 90 });
      }
      if (kind === 'minutes') {
        return p => ({ ...p, [column]: p[column] * p.minutes });
      }
      return undefined;
    }

    function formatMinutesPlayed(minutes) {
      if (minutes === undefined || minutes === null || isNaN(minutes)) return '';
      return `${Number(minutes).toLocaleString()}'`;
    }

    function formatPercentileLabel(rank, cohortSize) {
      if (rank === 'N/A' || rank === undefined || !cohortSize) return 'N/A';
      const numericRank = parseInt(rank, 10);
      const percentile = Math.max(0, Math.min(100, (1 - (numericRank - 1) / cohortSize) * 100));
      const topPct = (numericRank / cohortSize) * 100;
      const pctRounded = percentile >= 99.5 ? percentile.toFixed(2) : percentile >= 90 ? percentile.toFixed(1) : Math.round(percentile);
      let topStr;
      if (topPct < 0.01) topStr = topPct.toFixed(5);
      else if (topPct < 0.1) topStr = topPct.toFixed(3);
      else if (topPct < 1) topStr = topPct.toFixed(2);
      else if (topPct < 10) topStr = topPct.toFixed(1);
      else topStr = Math.round(topPct).toString();
      const ordinal = (() => {
        const n = Math.round(percentile);
        const lastTwo = n % 100;
        const last = n % 10;
        let suffix = 'th';
        if (lastTwo < 11 || lastTwo > 13) {
          if (last === 1) suffix = 'st';
          else if (last === 2) suffix = 'nd';
          else if (last === 3) suffix = 'rd';
        }
        return window.translateRankSuffix ? window.translateRankSuffix(suffix) : suffix;
      })();
      return `${pctRounded}${ordinal} percentile (top ${topStr}%)`;
    }

    function getSectionConfig(selectedSection, selectedPlayer, cohorts) {
      const { baseFiltered, samePositionAndLeague, samePosition, sameLeague, top5Filtered, samePositionTop5, top5 } = cohorts;
      const configs = {
        samePositionAndLeague: {
          dataset: samePositionAndLeague,
          withMinutes: false,
          filterFn: (p, age) => p.position === selectedPlayer.position && p.league === selectedPlayer.league && (!age || p.age <= age),
          titleArgs: [selectedPlayer.league, null, selectedPlayer.position, true]
        },
        samePositionAndLeagueWithMinutes: {
          dataset: samePositionAndLeague,
          withMinutes: true,
          filterFn: (p, age) => p.position === selectedPlayer.position && p.league === selectedPlayer.league && (!age || p.age <= age),
          titleArgs: [selectedPlayer.league, null, selectedPlayer.position]
        },
        position: {
          dataset: samePosition,
          withMinutes: false,
          filterFn: (p, age) => p.position === selectedPlayer.position && (!age || p.age <= age),
          titleArgs: ['Top 7 League', null, selectedPlayer.position, true]
        },
        positionWithMinutes: {
          dataset: samePosition,
          withMinutes: true,
          filterFn: (p, age) => p.position === selectedPlayer.position && (!age || p.age <= age),
          titleArgs: ['Top 7 League', null, selectedPlayer.position]
        },
        position5: {
          dataset: samePositionTop5,
          withMinutes: false,
          filterFn: (p, age) => p.position === selectedPlayer.position && top5.includes(p.league) && (!age || p.age <= age),
          titleArgs: ['Top 5 League', null, selectedPlayer.position, true]
        },
        position5WithMinutes: {
          dataset: samePositionTop5,
          withMinutes: true,
          filterFn: (p, age) => p.position === selectedPlayer.position && top5.includes(p.league) && (!age || p.age <= age),
          titleArgs: ['Top 5 League', null, selectedPlayer.position]
        },
        top5: {
          dataset: top5Filtered,
          withMinutes: false,
          filterFn: (p, age) => top5.includes(p.league) && (!age || p.age <= age),
          titleArgs: ['Top 5 League', null, 'Player', true]
        },
        top5WithMinutes: {
          dataset: top5Filtered,
          withMinutes: true,
          filterFn: (p, age) => top5.includes(p.league) && (!age || p.age <= age),
          titleArgs: ['Top 5 League', null, 'Player']
        },
        league: {
          dataset: sameLeague,
          withMinutes: false,
          filterFn: (p, age) => p.league === selectedPlayer.league && (!age || p.age <= age),
          titleArgs: [selectedPlayer.league, null, 'Player', true]
        },
        leagueWithMinutes: {
          dataset: sameLeague,
          withMinutes: true,
          filterFn: (p, age) => p.league === selectedPlayer.league && (!age || p.age <= age),
          titleArgs: [selectedPlayer.league, null, 'Player']
        },
        allCsv: {
          dataset: baseFiltered,
          withMinutes: false,
          filterFn: (p, age) => (!age || p.age <= age),
          titleArgs: ['Top 7 League', null, 'Player', true]
        },
        allCsvWithMinutes: {
          dataset: baseFiltered,
          withMinutes: true,
          filterFn: (p, age) => (!age || p.age <= age),
          titleArgs: ['Top 7 League', null, 'Player']
        }
      };
      return configs[selectedSection];
    }

    function computeAllRanks    function computeAllRanks(dataset, withMinutes) {
      const ranksByColumn = {};
      RANK_METRIC_CATALOG.forEach(metric => {
        const transform = withMinutes ? buildMinutesTransform(metric.column, metric.minutesTransform) : undefined;
        ranksByColumn[metric.column] = calculateRankForMetric(dataset, metric.column, transform);
      });
      return ranksByColumn;
    }

    function buildMetricsData(ranksByColumn) {
      return RANK_METRIC_CATALOG.map(metric => ({
        name: metric.listName,
        column: metric.column,
        pizzaName: metric.pizzaName,
        data: ranksByColumn[metric.column]
      }));
    }

    function buildMetricsToInclude(ranksByColumn) {
      const map = {};
      PIZZA_METRIC_ORDER.forEach(pizzaName => {
        const metric = RANK_METRIC_CATALOG.find(m => m.pizzaName === pizzaName);
        if (metric) {
          map[pizzaName] = ranksByColumn[metric.column];
        }
      });
      return map;
    }

    function orderMetricsData(metricsData, position) {
      let ordered = metricsData.slice();
      if (position in POSITION_ORDER) {
        ordered = POSITION_ORDER[position]
          .map(metricName => ordered.find(metric => metric.name === metricName))
          .filter(Boolean);
      }
      if (listCustomOrder && listCustomOrder.length) {
        const byName = Object.fromEntries(ordered.map(m => [m.name, m]));
        const custom = listCustomOrder.map(n => byName[n]).filter(Boolean);
        const remaining = ordered.filter(m => !listCustomOrder.includes(m.name));
        ordered = [...custom, ...remaining];
      }
      return ordered.filter(m => !listHiddenMetrics.has(m.name));
    }

    function findPlayerRank(rankList, selectedPlayer) {
      const row = rankList.find(rank => rank.player === selectedPlayer.player && rank.team === selectedPlayer.team);
      return row ? row.rank : undefined;
    }

    function buildRankBarHtml(metric, selectedPlayer, filteredData, getMetricValueFunction, cohortSize) {
      const playerRank = findPlayerRank(metric.data, selectedPlayer);
      if (playerRank === undefined) {
        return `${translateMetricName(metric.name)} – Not available`;
      }
      const currentValue = getMetricValueFunction(filteredData, selectedPlayer, metric.name);
      const numericRank = playerRank === 'N/A' ? cohortSize : parseInt(playerRank, 10);
      const rankBarWidth = playerRank === 'N/A' ? 0 : 100 - (((numericRank - 1) / cohortSize) * 100);
      const red = Math.round((255 * (1 - Math.pow(rankBarWidth / 100, 2))));
      const green = Math.round(rankBarWidth);
      const blue = Math.round((255 * Math.pow(rankBarWidth / 100, 2)));
      const color = `rgba(${red}, ${green}, ${blue}, 0.75)`;
      const rankLabel = showPercentileRanks
        ? formatPercentileLabel(playerRank, cohortSize)
        : `${playerRank}${getRankSuffix(playerRank)}`;

      return `
        <div class="metric-row" data-metric-name="${metric.name.replace(/"/g, '&quot;')}">
          <div class="metric-row-header">
            <span class="metric-row-label">${translateMetricName(metric.name)} – ${rankLabel}</span>
            <span class="metric-row-actions">
              <button type="button" class="metric-move-btn" data-action="up" title="Move up">▲</button>
              <button type="button" class="metric-move-btn" data-action="down" title="Move down">▼</button>
              <button type="button" class="metric-hide-btn" data-action="hide" title="Hide row">×</button>
            </span>
          </div>
          <div class="rank-bar" onclick="toggleActive(this)">
            <div class="rank-bar-fill" style="width: ${rankBarWidth}%; background-color: ${color}"></div>
            <span class="hover-content">${currentValue}</span>
          </div>
        </div>`;
    }

    function buildPizzaPayload(metricsToInclude, exclusionMapping, userExclusions, playerPosition, selectedPlayer, cohortSize, filteredData, getMetricValueFunction) {
      const metricsToCompute = Object.keys(metricsToInclude).filter(metric =>
        !exclusionMapping[playerPosition]?.includes(metric) && !userExclusions.has(metric)
      );
      const rankData = {};
      const rawValueData = {};
      metricsToCompute.forEach(metric => {
        const data = metricsToInclude[metric];
        const playerData = data.find(rank => rank.player === selectedPlayer.player && rank.team === selectedPlayer.team);
        rankData[metric] = !playerData || playerData.rank === 'N/A' || playerData.rank === '0'
          ? 1
          : playerData.rank === 1
            ? 0
            : playerData.rank / cohortSize;

        const catalogEntry = RANK_METRIC_CATALOG.find(m => m.pizzaName === metric);
        if (catalogEntry) {
          rawValueData[metric] = getMetricValueFunction(filteredData, selectedPlayer, catalogEntry.listName);
        } else {
          rawValueData[metric] = '';
        }
      });
      return { rankData, rawValueData };
    }

    function applyPizzaPreset(presetKey, metricsToInclude, exclusionMapping, userExclusions, playerPosition) {
      const preset = PIZZA_PRESETS[presetKey];
      if (!preset) return;
      const include = new Set(preset);
      userExclusions.clear();
      Object.keys(metricsToInclude).forEach(metric => {
        const shouldInclude = include.has(metric);
        const defaultExcluded = EXCLUSION_MAPPING_DEFAULT[playerPosition]?.includes(metric);
        const idx = exclusionMapping[playerPosition]?.indexOf(metric) ?? -1;
        if (shouldInclude) {
          if (idx !== -1) exclusionMapping[playerPosition].splice(idx, 1);
        } else {
          userExclusions.add(metric);
          if (!defaultExcluded && idx === -1) {
            // keep userExclusions only; exclusionMapping stays for defaults
          }
        }
      });
    }

    function displayPlayerRankings(player) {
      const selectedPlayer = parsedData.find(p => p.player === player.player && p.position === player.position && p.team === player.team);
      if (!selectedPlayer) return;

      const selectedAge = parseInt(document.getElementById('ageSelect').value);
      const toggleMetrics = document.getElementById('toggleMetrics').checked;
      const getMetricValueFunction = toggleMetrics ? updateCurrentMetricValue : getCurrentMetricValue;

      const top5 = ["Ligue 1", "Serie A", "Bundesliga", "Premier League", "La Liga"];
      const baseFiltered = selectedAge ? parsedData.filter(p => p.age <= selectedAge) : parsedData;
      const samePositionAndLeague = baseFiltered.filter(p => p.position === selectedPlayer.position && p.league === selectedPlayer.league);
      const samePosition = baseFiltered.filter(p => p.position === selectedPlayer.position);
      const sameLeague = baseFiltered.filter(p => p.league === selectedPlayer.league);
      const top5Filtered = baseFiltered.filter(p => top5.includes(p.league));
      const samePositionTop5 = baseFiltered.filter(p => p.position === selectedPlayer.position && top5.includes(p.league));

      const sectionSelect = document.getElementById('sectionSelect');
      const selectedSection = sectionSelect.options[sectionSelect.selectedIndex].value;
      let titleSuffix = '';
      if (selectedAge && selectedAge !== '') {
        titleSuffix = ` U${selectedAge}`;
      }

      const sectionConfig = getSectionConfig(selectedSection, selectedPlayer, {
        baseFiltered, samePositionAndLeague, samePosition, sameLeague, top5Filtered, samePositionTop5, top5
      });
      if (!sectionConfig) {
        document.getElementById('results').innerHTML = '';
        return;
      }

      const filteredData = parsedData.filter(p => sectionConfig.filterFn(p, selectedAge));
      const cohortSize = filteredData.length;
      const ranksByColumn = computeAllRanks(sectionConfig.dataset, sectionConfig.withMinutes);
      let metricsData = buildMetricsData(ranksByColumn);
      const metricsToInclude = buildMetricsToInclude(ranksByColumn);
      const exclusionMapping = deepCloneExclusions();
      const playerPosition = selectedPlayer.position;

      metricsData = orderMetricsData(metricsData, playerPosition);

      if (sortEnabled) {
        metricsData.sort((a, b) => {
          const rankA = findPlayerRank(a.data, selectedPlayer);
          const rankB = findPlayerRank(b.data, selectedPlayer);
          const defaultRank = Infinity;
          const numericRankA = rankA === 'N/A' ? defaultRank : parseInt(rankA, 10);
          const numericRankB = rankB === 'N/A' ? defaultRank : parseInt(rankB, 10);
          return numericRankA - numericRankB;
        });
      }

      const hiddenCount = listHiddenMetrics.size;
      const metricsHTML = metricsData.map(metric =>
        buildRankBarHtml(metric, selectedPlayer, filteredData, getMetricValueFunction, cohortSize)
      ).join('');

      const playerResults = `
        <div class="results-toolbar">
          <label class="percentile-toggle">
            <input type="checkbox" id="percentileToggle" ${showPercentileRanks ? 'checked' : ''}>
            <span>Percentiles</span>
          </label>
          ${hiddenCount ? `<button type="button" id="restoreHiddenRows" class="restore-rows-btn">Restore hidden (${hiddenCount})</button>` : ''}
        </div>
        ${metricsHTML}
      `;

      const minutesLabel = formatMinutesPlayed(selectedPlayer.minutes);
      const titleArgs = sectionConfig.titleArgs.slice();
      titleArgs[1] = titleSuffix;
      document.getElementById('chartTitle').innerHTML = `
        <img class="logo-image2" src="https://datamb.football/logopro.png" alt="">
        <h3><b>${formatPlayerName(selectedPlayer.player, selectedPlayer.team, selectedPlayer.age)}</b>${minutesLabel ? ` <span class="minutes-played">${minutesLabel}</span>` : ''}</h3>
        <h1><i>${translateTitle(...titleArgs)}</i></h1>
      `;

      document.getElementById('chartButton').innerHTML = `
        <div class="dropdown">
          <button class="dropbtn"><i class="fa fa-pencil"></i></button>
          <span class="chart-tooltip" data-i18n="buttons.edit_graphs">Edit graphs</span>
          <div id="metric-controls" class="dropdown-content">
            <label style="border-bottom: 1px solid var(--border-color); margin-bottom: 8px; padding-bottom: 8px;">
              <input type="checkbox" id="chartSortingToggle" ${sortEnabled ? 'checked' : ''}>
              <span class="checkbox-label-text" data-i18n="buttons.show_ascending_ranks">Show ascending ranks</span>
            </label>
            <div class="pizza-presets" style="border-bottom: 1px solid var(--border-color); margin-bottom: 8px; padding-bottom: 8px;">
              <button type="button" class="pizza-preset-btn" data-preset="offensive">Offensive</button>
              <button type="button" class="pizza-preset-btn" data-preset="defensive">Defensive</button>
              <button type="button" class="pizza-preset-btn" data-preset="profile">Profile</button>
              <button type="button" class="pizza-preset-btn" data-preset="archetype">Archetype</button>
              <button type="button" class="pizza-preset-btn" data-preset="default">Default</button>
            </div>
            <input type="search" id="metricSearchInput" class="metric-search-input" placeholder="Search metrics..." autocomplete="off">
          </div>
        </div>`;
      if (typeof window.translateNewElements === 'function') window.translateNewElements();

      let userExclusions = new Set();

      function updateChart() {
        const payload = buildPizzaPayload(
          metricsToInclude, exclusionMapping, userExclusions, playerPosition,
          selectedPlayer, cohortSize, filteredData, getMetricValueFunction
        );
        createPizzaChart(payload.rankData, payload.rawValueData);
      }

      function populateMetricControls() {
        const metricControlsDiv = document.getElementById('metric-controls');
        const metricLabels = metricControlsDiv.querySelectorAll('label:not([style*="border-bottom"])');
        metricLabels.forEach(label => label.remove());

        const sortingCheckbox = document.getElementById('chartSortingToggle');
        if (sortingCheckbox && !sortingCheckbox.dataset.listenerAdded) {
          sortingCheckbox.dataset.listenerAdded = 'true';
          sortingCheckbox.addEventListener('change', function () {
            sortEnabled = this.checked;
            displaySelectedPlayer();
          });
        }

        applyStoredMetrics(playerPosition, metricsToInclude, exclusionMapping, userExclusions);

        Object.keys(metricsToInclude).forEach(metric => {
          const isExcluded = exclusionMapping[playerPosition]?.includes(metric) || userExclusions.has(metric);
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.setAttribute('data-metric', metric);
          checkbox.checked = !isExcluded;

          const label = document.createElement('label');
          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(translateMetricName(metric)));
          metricControlsDiv.appendChild(label);

          checkbox.addEventListener('change', function () {
            if (this.checked) {
              userExclusions.delete(metric);
              const index = exclusionMapping[playerPosition]?.indexOf(metric);
              if (index !== -1) exclusionMapping[playerPosition].splice(index, 1);
            } else {
              userExclusions.add(metric);
            }
            const currentMetrics = getCurrentSelectedMetrics(playerPosition, metricsToInclude, exclusionMapping, userExclusions);
            saveMetricsForPosition(playerPosition, [...currentMetrics]);
            updateChart();
          });
        });

        const searchInput = document.getElementById('metricSearchInput');
        if (searchInput && !searchInput.dataset.listenerAdded) {
          searchInput.dataset.listenerAdded = 'true';
          searchInput.addEventListener('input', function () {
            const q = this.value.trim().toLowerCase();
            metricControlsDiv.querySelectorAll('label').forEach(label => {
              if (label.querySelector('#chartSortingToggle')) return;
              if (label.closest('.pizza-presets')) return;
              const text = label.textContent.toLowerCase();
              label.style.display = !q || text.includes(q) ? '' : 'none';
            });
          });
          searchInput.addEventListener('click', e => e.stopPropagation());
        }

        metricControlsDiv.querySelectorAll('.pizza-preset-btn').forEach(btn => {
          if (btn.dataset.listenerAdded) return;
          btn.dataset.listenerAdded = 'true';
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const preset = this.getAttribute('data-preset');
            if (preset === 'default') {
              userExclusions.clear();
              const restored = deepCloneExclusions();
              Object.keys(exclusionMapping).forEach(pos => {
                exclusionMapping[pos] = [...restored[pos]];
              });
            } else {
              applyPizzaPreset(preset, metricsToInclude, exclusionMapping, userExclusions, playerPosition);
            }
            const currentMetrics = getCurrentSelectedMetrics(playerPosition, metricsToInclude, exclusionMapping, userExclusions);
            saveMetricsForPosition(playerPosition, [...currentMetrics]);
            populateMetricControls();
            updateChart();
          });
        });
      }

      function toggleDropdown() {
        document.querySelector('.dropdown').classList.toggle('show');
      }

      document.getElementById('results').innerHTML = playerResults;

      const percentileToggle = document.getElementById('percentileToggle');
      if (percentileToggle) {
        percentileToggle.addEventListener('change', function () {
          showPercentileRanks = this.checked;
          displaySelectedPlayer();
        });
      }
      const restoreBtn = document.getElementById('restoreHiddenRows');
      if (restoreBtn) {
        restoreBtn.addEventListener('click', function () {
          listHiddenMetrics.clear();
          displaySelectedPlayer();
        });
      }

      document.querySelectorAll('.metric-row').forEach(row => {
        const name = row.getAttribute('data-metric-name');
        row.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const action = this.getAttribute('data-action');
            const visibleNames = [...document.querySelectorAll('.metric-row')].map(r => r.getAttribute('data-metric-name'));
            if (action === 'hide') {
              listHiddenMetrics.add(name);
              displaySelectedPlayer();
              return;
            }
            const idx = visibleNames.indexOf(name);
            if (idx === -1) return;
            const next = visibleNames.slice();
            if (action === 'up' && idx > 0) {
              [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            } else if (action === 'down' && idx < next.length - 1) {
              [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
            } else {
              return;
            }
            listCustomOrder = next;
            sortEnabled = false;
            displaySelectedPlayer();
          });
        });
      });

      document.querySelector('.dropbtn').addEventListener('click', toggleDropdown);
      populateMetricControls();
      updateChart();

      rankRenderContext = {
        selectedPlayer, filteredData, cohortSize, metricsToInclude, exclusionMapping, playerPosition, getMetricValueFunction
      };
    }

    function populatePlayerOptions() {
      if (typeof window.translatePosition !== 'function') {
        setTimeout(populatePlayerOptions, 100);
        return;
      }
      const playerSelect = document.getElementById('playerSelect');
      playerSelect.innerHTML = '';
      parsedData.forEach(player => {
        const option = document.createElement('option');
        option.value = player.player;
        option.setAttribute('data-position', player.position);
        option.setAttribute('data-team', player.team);
        option.textContent = `${player.player}, ${window.translatePosition ? window.translatePosition(player.position) : player.position}, ${player.team}`;
        playerSelect.appendChild(option);
      });
      const searchInput = document.getElementById('searchInput');
      const autocompleteList = document.getElementById('autocomplete-list');
  
      function closeAllLists() {
        autocompleteList.innerHTML = '';
      }
  
      function showSuggestions(filteredPlayers) {
        autocompleteList.innerHTML = '';
        if (!filteredPlayers.length) {
          const noResult = document.createElement('div');
          noResult.className = 'autocomplete-item';
          noResult.textContent = 'No results found';
          autocompleteList.appendChild(noResult);
          return;
        }
        filteredPlayers.forEach((player, idx) => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item';
          // Highlight first item by default
          if (idx === 0) {
            item.classList.add('autocomplete-active');
          }
          item.innerHTML = `<strong>${player.player}</strong>, ${window.translatePosition ? window.translatePosition(player.position) : player.position}, ${player.team}`;
          item.addEventListener('click', function (e) {
            e.preventDefault();
            selectPlayer(player);
            closeAllLists();
          });
          autocompleteList.appendChild(item);
        });
      }
  
      function filterPlayers(query) {
        if (!query) return [];
  
        const nameVariations = generateSearchVariations(query);
        const foundResults = new Set();
  
        nameVariations.forEach(nameVariation => {
          const results = parsedData.filter(player => {
            return smartNameMatch(nameVariation, player.player);
          });
          results.forEach(result => foundResults.add(result));
        });
  
        return Array.from(foundResults);
      }
  
      function selectPlayer(player) {
        const playerSelect = document.getElementById('playerSelect');
        for (let i = 0; i < playerSelect.options.length; i++) {
          if (
            playerSelect.options[i].value === player.player &&
            playerSelect.options[i].getAttribute('data-position') === player.position &&
            playerSelect.options[i].getAttribute('data-team') === player.team
          ) {
            playerSelect.selectedIndex = i;
            // Trigger change event
            playerSelect.dispatchEvent(new Event('change'));
            break;
          }
        }
      }
  
      searchInput.addEventListener('input', function () {
        const val = this.value;
        if (!val) {
          closeAllLists();
          return;
        }
        const filtered = filterPlayers(val);
        showSuggestions(filtered);
      });
  
      document.addEventListener('keydown', function (e) {
        if (!autocompleteList || autocompleteList.children.length === 0) return;
  
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowUp':
            e.preventDefault();
  
            const visibleItems = Array.from(autocompleteList.querySelectorAll('.autocomplete-item'));
            const currentIndex = visibleItems.findIndex(item => item.classList.contains('autocomplete-active'));
            let newIndex;
  
            if (e.key === 'ArrowDown') {
              newIndex = currentIndex < visibleItems.length - 1 ? currentIndex + 1 : 0;
            } else {
              newIndex = currentIndex > 0 ? currentIndex - 1 : visibleItems.length - 1;
            }
  
            visibleItems.forEach(item => item.classList.remove('autocomplete-active'));
            visibleItems[newIndex].classList.add('autocomplete-active');
              visibleItems[newIndex].scrollIntoView({ block: 'nearest' });
            break;
  
          case 'Enter':
            e.preventDefault();
            const selectedItem = autocompleteList.querySelector('.autocomplete-active');
            if (selectedItem) {
              selectedItem.click();
            } else if (autocompleteList.children.length === 1) {
              autocompleteList.children[0].click();
            }
            break;
  
          case 'Escape':
            e.preventDefault();
            closeAllLists();
            if (document.activeElement === searchInput) {
              searchInput.blur();
            }
            break;
        }
      });
      document.addEventListener('click', function (e) {
        if (e.target !== searchInput) closeAllLists();
      });
    }  
    const searchInput = document.getElementById('searchInput');
    const playerSelect = document.getElementById('playerSelect');
  
    function removeSpecialChars(str) {
      return str.normalize('NFD')
        .replace(/[\u0300-\u036f\s]/g, '')
        .replace(/Ø/g, 'O')
        .replace(/ø/g, 'o')
        .replace(/ı/g, 'i')
        .replace(/ł/g, 'l')
        .replace(/Ł/g, 'L')
        .replace(/[^\w]/g, '');
    }
  
    function generateSearchVariations(query) {
      const variations = [];
      const words = query.trim().split(/\s+/).filter(w => w.length > 0 && !/^\d+$/.test(w) && !/^\d+\/\d+$/.test(w));
      variations.push(query); 
      if (words.length >= 2) {
        const firstInitial = words[0].charAt(0).toUpperCase();
        const restOfName = words.slice(1).join(' ');
        variations.push(`${firstInitial}. ${restOfName}`);
        variations.push(`${firstInitial} ${restOfName}`);
        variations.push(`${firstInitial}.${restOfName}`);
      } 
      return variations;
    }
    function isInitialMatch(queryWord, nameWord) {
      const cleanQuery = queryWord.replace(/\./g, '');
      if (cleanQuery.length === 1) {
        return cleanQuery.toLowerCase() === nameWord.charAt(0).toLowerCase();
      }
      return false;
    }
    function smartNameMatch(queryName, itemName) {
      const normalizedQuery = removeSpecialChars(queryName.toLowerCase());
      const normalizedItem = removeSpecialChars(itemName.toLowerCase());
  
      if (normalizedItem.includes(normalizedQuery)) {
        return true;
      }
      const queryWords = queryName.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
      const itemWords = itemName.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
  
      if (queryWords.length >= 2 && itemWords.length >= 2) {
        const firstWordMatches = isInitialMatch(queryWords[0], itemWords[0]) ||
          queryWords[0].toLowerCase() === itemWords[0].toLowerCase();
  
        if (firstWordMatches) {
          const restQueryWords = queryWords.slice(1);
          const restItemWords = itemWords.slice(1);
  
          const restQuery = removeSpecialChars(restQueryWords.join(' ').toLowerCase());
          const restItem = removeSpecialChars(restItemWords.join(' ').toLowerCase());
  
          return restItem.includes(restQuery);
        }
      }
      return false;
    }   
  
    searchInput.addEventListener('input', function () {
      const searchText = this.value.trim();
      setTimeout(() => {
        if (searchText === '') {
          for (let i = 0; i < playerSelect.options.length; i++) {
            playerSelect.options[i].style.display = '';
          }
        } else {
          const nameVariations = generateSearchVariations(searchText);
            for (let i = 0; i < playerSelect.options.length; i++) {
            const option = playerSelect.options[i];
            const optionText = option.textContent;
  
            if (i === 0) {
              option.style.display = '';
            } else {
              let matches = false;
              for (const variation of nameVariations) {
                if (smartNameMatch(variation, optionText)) {
                  matches = true;
                  break;
                }
              }
              option.style.display = matches ? '' : 'none';
            }
          }
        }
          if (typeof hideSpinner === 'function') {
          hideSpinner();
        }
      }, 1);
    });
  
    playerSelect.addEventListener('change', function () {
      showSpinner();
  
      const selectedIndex = this.selectedIndex;
      searchInput.value = '';
      const selectedPlayerName = this.options[selectedIndex].value;
      const selectedPlayerPosition = this.options[selectedIndex].textContent.split(', ')[1];
      const selectedPlayerTeam = this.options[selectedIndex].textContent.split(', ')[2];
      const selectedPlayer = {
        player: selectedPlayerName,
        team: selectedPlayerTeam,
        position: selectedPlayerPosition
      };
  
      setTimeout(() => {
        displaySelectedPlayer(selectedPlayer);
          hideSpinner();
      }, 0); 
    });
      document.getElementById('sectionSelect').addEventListener('change', function () {
      showSpinner();
        setTimeout(() => {
        displaySelectedPlayer();
        hideSpinner();
      }, 0); 
    });
      document.getElementById('ageSelect').addEventListener('change', function () {
      showSpinner();
      setTimeout(() => {
        displaySelectedPlayer();
          hideSpinner();
      }, 0);
    });
    document.getElementById('toggleMetrics').addEventListener('change', function () {
      showSpinner();
        setTimeout(() => {
        displaySelectedPlayer();
        hideSpinner();
      }, 0);
    });
});

function toggleActive(element) {
    element.classList.toggle('active');
  }
  
  const resultsDiv = document.getElementById('results');
  const chartContainer = document.getElementById('chartContainer');  
  
  window.onclick = function (event) {
    if (!event.target.closest('.dropdown')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      for (var i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.parentElement.classList.contains('show')) {
          openDropdown.parentElement.classList.remove('show');
        }
      }
    }
  }