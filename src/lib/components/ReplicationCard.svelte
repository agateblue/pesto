<script lang="ts">
  import { _, _n } from '$lib/i18n/index.svelte';
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
  
    <strong>{$_("Type:", "Name")}</strong> {$_("WebRTC:", "")} <br />
    <strong>{$_("Signaling server:", "")}</strong>
    {replication.signalingServer} <br />
  {/if}
  {#if replication.type === 'couchdb' || replication.type === 'couchdb-tempo'}
    <strong>{$_("Type:", "Name")}</strong>
    {replication.type === 'couchdb' ? $_("CouchDB:", "") : $_("CouchDB (With Tempo compatibility):", "")} <br />
    <strong>{$_("Server URL:", "")}</strong>
    {replication.server} <br />
    <strong>{$_("Database:", "")}</strong>
    {replication.database} <br />
    <strong>{$_("Username:", "")}</strong>
    {replication.username} <br />
    <strong>{$_("Password:", "")}</strong> {$_("[hidden]", "")}<br />
  {/if}
  <strong>{$_("Push local data:", "")}</strong>
  {replication.push ? $_("Yes", "") : $_("No", "")} <br />
  <strong>{$_("Pull remote data:", "")}</strong>
  {replication.pull ? $_("Yes", "") : $_("No", "")} <br />

  <div>
    <DialogForm
      anchorClass="button__link"
      anchorText={$_("Edit", "Verb")}
      title={$_("Edit synchronisation", "")}
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
      anchorText={$_("Delete…", "")}
      title={$_("Delete this synchronisation?", "")}
      onsubmit={(e: SubmitEvent) => {
        e.preventDefault();
        dispatch('delete', {});
      }}
    >
      <p>
        {$_("Data synchronization with other devices will stop. Data currently stored on your device won't be deleted.", "")}
      </p>
    </DialogForm>
  </div>
</div>
