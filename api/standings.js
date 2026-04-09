export default async function handler(req, res) {
  try {

    const response = await fetch(
      "https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&standingsTypes=regularSeason",
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const data = await response.json();

    if (!data.records) {
      return res.status(200).json([]);
    }

    let formatted = [];

    data.records.forEach(div => {

      if (!div.teamRecords) return;

      const league = div.league.id === 103 ? "AL" : "NL";
      const division = div.division.name.split(" ").pop();

      div.teamRecords.forEach(team => {

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
    console.error("FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch standings" });
  }
}
