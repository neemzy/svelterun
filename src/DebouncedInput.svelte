<input type="text" {placeholder} on:input={event => emit(event.target.value)} />

<script>
import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();

export let minLength = 0;
export let delay = 0;
export let placeholder = "";

let debouncer;
let debouncing = false;

function emit(value) {
  if (value.length < minLength) {
    return;
  }

  if (debouncing) {
    window.clearTimeout(debouncer);
  }

  debouncing = true;

  debouncer = window.setTimeout(() => {
    dispatch("input", { value });

    debouncing = false;
  }, delay);
}
</script>
