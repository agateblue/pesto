<script lang="ts">
  import { preventDefault } from 'svelte/legacy';
  import cloneDeep from 'lodash/cloneDeep'
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import {type AnyReplication} from '$lib/db'
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    submit: { replication: AnyReplication };
  }>();

  interface Props {
    replication: AnyReplication;
  }

  let { replication = $bindable() }: Props = $props();
  replication = cloneDeep(replication)
</script>


<form class="flow" onsubmit={preventDefault((e) => dispatch('submit', {replication}))}>

  {#if replication.type === 'webrtc'}
    <div class="form__field">
      <label for="webrtc-signaling-server">Signaling server</label>
      <input type="text" id="webrtc-signaling-server" name="webrtc-signaling-server" bind:value={replication.signalingServer}>
    </div>
    <div class="form__field">
      <label for="webrtc-room-id">Room ID</label>
      <PasswordInput name="webrtc-room-id" id="webrtc-room-id" bind:value={replication.room} />
      <p>Anyone with this room identifier can access your data. Treat it like a password.</p>
    </div>
  {/if}
  {#if replication.type === 'couchdb'}
    <div class="form__field">
      <label for="couchdb-server">Server URL</label>
      <input name="couchdb-server" id="couchdb-url" type="url" bind:value={replication.server}>
    </div>
    <div class="form__field">
      <label for="couchdb-database">Database name</label>
      <input name="couchdb-database" id="couchdb-database" bind:value={replication.database}>
    </div>
    <div class="form__field">
      <label for="couchdb-database">Username</label>
      <input name="couchdb-username" id="couchdb-username" bind:value={replication.username}>
    </div>
    <div class="form__field">
      <label for="couchdb-password">Password</label>
      <PasswordInput name="couchdb-password" id="couchdb-password" bind:value={replication.password} />
    </div>
  {/if}
  <div class="form__field">
    <input id="push" name="push" type="checkbox" bind:checked={replication.push}>
    <label for="push">Push local changes</label>
  </div>
  <div class="form__field">
    <input id="pull" name="pull" type="checkbox" bind:checked={replication.pull}>
    <label for="pull">Pull remote changes</label>
  </div>
  <div class="flex__row flex__justify-end">
    <button type="submit"> Save </button>
  </div>
</form>