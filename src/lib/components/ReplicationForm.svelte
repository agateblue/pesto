<script lang="ts">
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import {type WebRTCReplication} from '$lib/db'
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    submit: { replication: WebRTCReplication };
  }>();

  export let replication: WebRTCReplication
</script>


<form on:submit|preventDefault={(e) => dispatch('submit', {replication})}>
  <div class="form__field">
    <label for="signaling-server">Signaling server</label>
    <input type="text" bind:value={replication.signalingServer}>
  </div>
  <div class="form__field">
    <label for="signaling-server">Room ID</label>
    <PasswordInput bind:value={replication.room} />
    <p>Anyone with this room identifier can access your data. Treat it like a password.</p>
  </div>
  <div class="flex__row flex__justify-end">
    <button type="submit"> Save </button>
  </div>
</form>