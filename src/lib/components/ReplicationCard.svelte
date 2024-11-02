<script lang="ts">
  import ReplicationForm from './ReplicationForm.svelte';
  import { type AnyReplication } from '$lib/db';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    submit: { replication: AnyReplication };
    delete: {};
  }>();

  interface Props {
    replication: AnyReplication;
    [key: string]: any;
  }

  let { replication = $bindable(), ...rest }: Props = $props();
  let edit = $state(false);
</script>

<div {...rest}>
  {#if edit}
    <ReplicationForm
      replication={{ ...replication }}
      on:submit={(e) => {
        replication = { ...e.detail.replication };
        dispatch('submit', { replication });
        edit = false;
      }}
    />
  {:else}
    {#if replication.type === 'webrtc'}
      <strong>Type:</strong> WebRTC <br />
      <strong>Signaling server:</strong>
      {replication.signalingServer} <br />
    {/if}
    {#if replication.type === 'couchdb'}
      <strong>Type:</strong> CouchDB <br />
      <strong>Server URL:</strong>
      {replication.server} <br />
      <strong>Database:</strong>
      {replication.database} <br />
      <strong>Username:</strong>
      {replication.username} <br />
      <strong>Password:</strong> [hidden] <br />
    {/if}
    <strong>Push local data:</strong>
    {replication.push ? 'Yes' : 'No'} <br />
    <strong>Pull remote data:</strong>
    {replication.pull ? 'Yes' : 'No'} <br />
  {/if}

  <div>
    <button
      type="button"
      class="button__link"
      onclick={() => {
        edit = !edit;
      }}
    >
      Edit
    </button>
    <button
      type="button"
      class="button__link"
      onclick={() => {
        if (
          confirm('Delete synchronisation? Your data will be kept but not synchronised anymore.')
        ) {
          dispatch('delete', {});
        }
      }}
    >
      Delete…
    </button>
  </div>
</div>
