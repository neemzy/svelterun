{#each games as game}
  <button class:button-outline="{selectedGameID === game.id}" on:click={() => selectGame(game.id)}>{game.names.international}</button>
  &nbsp;
{/each}

<button class="button-black" on:click={() => loadMoreGames()}>Load more...</button>

{#if categoriesLoaded}
  <hr />

  {#each selectedGame.categories as category}
    <button class:button-outline="{selectedCategoryID === category.id}" on:click={() => selectCategory(category.id)}>{category.name}</button>
    &nbsp;
  {/each}

  {#if leaderboardLoaded}
    <table>
      <thead>
        <tr>
          <th class="center">#</th>
          <th>Player</th>
          <th class="right">Time</th>
          <th class="right">Date</th>
          <th class="center">Video</th>
        </tr>
      </thead>
      <tbody>
        {#each selectedCategory.leaderboard.runs as run}
          <tr>
            <td class="center">{formatPlace(run.place)}</td>
            <td>{run.player}</td>
            <td class="right">{formatDuration(run.time * 1000)}</td>
            <td class="right">{ago(new Date(run.date))}</td>
            <td class="center">{#if run.video}<a href={run.video} target="_blank">📹</a>{/if}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
{/if}

<script>
import "milligram/dist/milligram.min.css";
import { onMount } from "svelte";
import formatDuration from "format-duration";
import ago from "s-ago";
import client from "./client";

let games = [];
let page = 1;
let selectedGameID = null;
let selectedCategoryID = null;

$: selectedGame = games.find(({ id }) => id === selectedGameID);
$: categoriesLoaded = selectedGame && "categories" in selectedGame;
$: selectedCategory = categoriesLoaded ? selectedGame.categories.find(({ id }) => id === selectedCategoryID) : undefined;
$: leaderboardLoaded = selectedCategory && "leaderboard" in selectedCategory;

$: if (selectedGame && !("categories" in selectedGame)) {
  client.getCategories(selectedGameID).then(categories => {
    selectedGame.categories = categories;
  });
}

$: if (selectedCategory && !("leaderboard" in selectedCategory)) {
  client.getLeaderboard(selectedGameID, selectedCategoryID).then(leaderboard => {
    selectedCategory.leaderboard = leaderboard;
  });
}

async function loadMoreGames() {
  games = [...games, ...await client.getGames(++page)];
}

function selectGame(id) {
  selectedGameID = selectedGameID === id ? null : id;
  selectedCategoryID = null;
}

function selectCategory(id) {
  selectedCategoryID = selectedCategoryID === id ? null : id;
}

function formatPlace(place) {
  switch (place) {
    case 1:
      return "🥇";

    case 2:
      return "🥈";

    case 3:
      return "🥉";
  }

  return place;
}

onMount(async () => {
  games = await client.getGames();
});
</script>

<style>
.center {
  text-align: center;
}

.right {
  text-align: right;
}

.button-black {
  background-color: black;
  border-color: black;
}
</style>
