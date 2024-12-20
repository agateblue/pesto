<script lang="ts">
  import { preventDefault } from 'svelte/legacy';
  import cloneDeep from 'lodash/cloneDeep';
  import PasswordInput from '$lib/components/PasswordInput.svelte';
  import { type AnyReplication } from '$lib/db';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    submit: { replication: AnyReplication };
  }>();

  interface Props {
    replication: AnyReplication;
  }

  let { replication = $bindable() }: Props = $props();
  replication = cloneDeep(replication);
</script>

{#if replication.type === 'webrtc'}
  <div class="form__field">
    <label for="webrtc-signaling-server">Signaling server</label>
    <input
      type="text"
      id="webrtc-signaling-server"
      name="webrtc-signaling-server"
      bind:value={replication.signalingServer}
      required
    />
  </div>
  <div class="form__field">
    <label for="webrtc-room-id">Room ID</label>
    <PasswordInput
      required
      name="webrtc-room-id"
      id="webrtc-room-id"
      bind:value={replication.room}
    />
    <p>Anyone with this room identifier can access your data. Treat it like a password.</p>
  </div>
{/if}
{#if replication.type === 'couchdb' || replication.type === 'couchdb-tempo'}
  {#if replication.type === 'couchdb-tempo'}
    <p>
      <strong
        >Warning: this synchronisation mode is designed to help you transition from Tempo to Pesto.</strong
      >
    </p>
    <p>
      Since Tempo does not support all Pesto features, writing data from Pesto to Tempo is disabled.
      This means:
    </p>
    <ul>
      <li>Changes done on Tempo documents will be synchronized from Tempo to Pesto</li>
      <li>Changes done on Pesto documents won't be synchronized from Pesto to Tempo</li>
    </ul>
    <p>It is also less performant and should be disabled when you switch definitely to Pesto.</p>
  {/if}
  <div class="form__field">
    <label for="couchdb-server">Server URL</label>
    <input
      name="couchdb-server"
      id="couchdb-url"
      type="url"
      bind:value={replication.server}
      required
    />
  </div>
  <div class="form__field">
    <label for="couchdb-database">Database name</label>
    <input
      name="couchdb-database"
      id="couchdb-database"
      bind:value={replication.database}
      required
    />
  </div>
  <div class="form__field">
    <label for="couchdb-username">Username</label>
    <input
      name="couchdb-username"
      id="couchdb-username"
      bind:value={replication.username}
      required
    />
  </div>
  <div class="form__field">
    <label for="couchdb-password">Password</label>
    <PasswordInput
      name="couchdb-password"
      id="couchdb-password"
      bind:value={replication.password}
      required
    />
  </div>
{/if}
<div class="form__field">
  <input id="push" name="push" type="checkbox" bind:checked={replication.push} />
  <label for="push">Push local changes</label>
</div>
<div class="form__field">
  <input id="pull" name="pull" type="checkbox" bind:checked={replication.pull} />
  <label for="pull">Pull remote changes</label>
</div>
