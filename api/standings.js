export default async function handler(req, res) {
  try {

    const url = "https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&standingsTypes=regularSeason";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch MLB data");
    }

    const data = await response.json();

    let formatted = [];

    data.records.forEach(div => {

      if (!div.teamRecords) return;

      const league = div.league.id === 103 ? "AL" : "NL";
      const division = div.division.name.split(" ").pop();

      div.teamRecords.forEach(team => {

        if (!team.team) return;

        let lastTen = "-";

        if (team.records && team.records.splitRecords) {
          const lastTenObj = team.records.splitRecords.find(r => r.type === "lastTen");
          if (lastTenObj) {
            lastTen = `${lastTenObj.wins}-${lastTenObj.losses}`;
          }
        }

        formatted.push({
          League: league,
          Division: division,
          Team: team.team.name,
          TeamID: team.team.id,
          W: team.wins,
          L: team.losses,
          PCT: team.winningPercentage,
          GB: team.gamesBack,
          STRK: team.streak?.streakCode || "-",
          L10: lastTen
        });

      });

    });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(formatted);

  } catch (err) {

    console.error("ERROR:", err);

    // fallback SOLO si TODO falla
    res.status(200).json([
      { League:"AL", Division:"East", Team:"Yankees", TeamID:147, W:10, L:5, PCT:".667", GB:"-", STRK:"W2", L10:"7-3" },
      { League:"NL", Division:"West", Team:"Dodgers", TeamID:119, W:12, L:3, PCT:".800", GB:"-", STRK:"W4", L10:"9-1" }
    ]);
  }
}
