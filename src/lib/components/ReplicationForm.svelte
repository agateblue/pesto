<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import {type WebRTCReplication} from '$lib/db'
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    submit: { replication: WebRTCReplication };
  }>();

  interface Props {
    replication: WebRTCReplication;
  }

  let { replication = $bindable() }: Props = $props();
</script>


<form class="flow" onsubmit={preventDefault((e) => dispatch('submit', {replication}))}>
  <div class="form__field">
    <label for="signaling-server">Signaling server</label>
    <input type="text" bind:value={replication.signalingServer}>
  </div>
  <div class="form__field">
    <label for="signaling-server">Room ID</label>
    <PasswordInput bind:value={replication.room} />
    <p>Anyone with this room identifier can access your data. Treat it like a password.</p>
  </div>
  <!-- <div class="form__field">
    <input id="push" name="push" type="checkbox" bind:checked={replication.push}>
    <label for="push">Push local changes</label>
  </div>
  <div class="form__field">
    <input id="pull" name="pull" type="checkbox" bind:checked={replication.pull}>
    <label for="pull">Pull remote changes</label>
  </div> -->
  <div class="flex__row flex__justify-end">
    <button type="submit"> Save </button>
  </div>
</form>