const baseURL = "https://www.speedrun.com/api/v1";

async function get(endpoint) {
  return (await (await fetch(baseURL + endpoint)).json()).data;
}

export default {
  getGames(query) {
    return get(`/games?_bulk=yes&max=1000&name=${query}`);
  },

  async getCategories(gameID) {
    return (await get(`/games/${gameID}/categories`)).filter(({ type }) => type === "per-game");
  },

  async getLeaderboard(gameID, categoryID) {
    const leaderboard = await get(`/leaderboards/${gameID}/category/${categoryID}?embed=players`);

    return {
      ...leaderboard,

      runs: leaderboard.runs.filter(({ place }) => place > 0).map(({ place, run }) => ({
        place,
        player: "name" in run.players[0] ? run.players[0].name : leaderboard.players.data.find(({ id }) => id === run.players[0].id).names.international,
        time: run.times.primary_t,
        date: run.date,
        video: run.videos && run.videos.links ? run.videos.links[0].uri : null
      }))
    };
  }
};
