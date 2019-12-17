<DebouncedInput minLength={3} delay={300} placeholder="Search for games..." on:input={event => search(event.detail.value)} />

{#if loading}
  <div class="spinner"></div>
{:else if noResults}
  <div class="center">Woops, no results were found! Check your query.</div>
{:else}
  {#each games as game}
    <button class:button-outline="{selectedGameID === game.id}" on:click={() => selectGame(game.id)}>{game.names.international}</button>
    &nbsp;
  {/each}

  {#if categoriesLoaded}
    <hr />

    {#each selectedGame.categories as category}
      <button class:button-outline="{selectedCategoryID === category.id}" on:click={() => selectCategory(category.id)}>{category.name}</button>
      &nbsp;
    {/each}
  {/if}

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
import formatDuration from "format-duration";
import ago from "s-ago";
import DebouncedInput from "./DebouncedInput.svelte";
import client from "./client";

let query = "";
let games = [];
let selectedGameID = null;
let selectedCategoryID = null;
let loading = false;

$: noResults = query.length > 0 && games.length === 0;
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

async function search(value) {
  query = value;
  selectedGameID = null;
  selectedCategoryID = null;
  loading = true;
  games = await client.getGames(query);
  loading = false;
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
</script>

<style>
.center {
  text-align: center;
}

.right {
  text-align: right;
}

.spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.spinner::before,
.spinner::after {
  content: "";
  position: absolute;
  border: 4px solid #333333;
  opacity: 1;
  border-radius: 50%;
  animation: ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.spinner::after {
  animation-delay: -0.5s;
}

@keyframes ripple {
  0% {
    top: 36px;
    left: 36px;
    width: 0;
    height: 0;
    opacity: 1;
  }

  100% {
    top: 0px;
    left: 0px;
    width: 72px;
    height: 72px;
    opacity: 0;
  }
}
</style>
