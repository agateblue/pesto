<script lang="ts">
  import ReplicationForm from './ReplicationForm.svelte';
  import DialogForm from './DialogForm.svelte';
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
  replication = { ...replication };
</script>

<div {...rest}>
  {#if replication.type === 'webrtc'}
    <strong>Type:</strong> WebRTC <br />
    <strong>Signaling server:</strong>
    {replication.signalingServer} <br />
  {/if}
  {#if replication.type === 'couchdb' || replication.type === 'couchdb-tempo'}
    <strong>Type:</strong>
    {replication.type === 'couchdb' ? 'CouchDB' : 'CouchDB (With Tempo compatibility)'} <br />
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

  <div>
    <DialogForm
      anchorClass="button__link"
      anchorText="Edit"
      title="Edit synchronisation"
      onsubmit={async (e: SubmitEvent) => {
        e.preventDefault();
        replication = { ...replication };
        dispatch('submit', { replication: { ...replication } });
      }}
    >
      <ReplicationForm bind:replication />
    </DialogForm>
    <DialogForm
      anchorClass="button__link"
      anchorText="Delete..."
      title="Delete this synchronisation?"
      onsubmit={(e: SubmitEvent) => {
        e.preventDefault();
        dispatch('delete', {});
      }}
    >
      <p>
        Data synchronization with other devices will stop. Data currently stored on your device
        won't be deleted.
      </p>
    </DialogForm>
  </div>
</div>
