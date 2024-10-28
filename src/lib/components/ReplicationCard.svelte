<script lang="ts">
  import ReplicationForm from './ReplicationForm.svelte';
  import {type WebRTCReplication} from '$lib/db'
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    submit: { replication: WebRTCReplication };
    delete: {};
  }>();

  export let replication: WebRTCReplication
  let edit = false
</script>

<div {...$$restProps}>
  {#if edit}
    <ReplicationForm replication={{...replication}} on:submit={(e) => {
      replication = {...e.detail.replication}
      dispatch('submit', {replication})
      edit = false
    }} />
  {:else}
    {#if replication.type === 'webrtc'}
      <strong>Type:</strong> WebRTC <br>
      <strong>Signaling server:</strong> {replication.signalingServer} <br>
    {/if}
  {/if}

  <div>
    <button
      type="button"
      class="button__link"
      on:click={() => {edit = !edit}}
    >
      Edit
    </button>
    <button
      type="button"
      class="button__link"
      on:click={() => {
        if (confirm('Delete synchronisation? Your data will be kept but not synchronised anymore.')) {
          dispatch('delete', {})
        }
      }}
    >
      Delete…
    </button>
  </div>
</div>