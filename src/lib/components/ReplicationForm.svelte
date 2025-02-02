<script lang="ts">
  import { _, _n } from '$lib/i18n/index.svelte';
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
    <label for="webrtc-signaling-server">{$_("Serveur de mise en relation", "")}</label>
    <input
      type="text"
      id="webrtc-signaling-server"
      name="webrtc-signaling-server"
      bind:value={replication.signalingServer}
      required
    />
  </div>
  <div class="form__field">
    <label for="webrtc-room-id">{$_("Identifiant de salon", "")}</label>
    <PasswordInput
      required
      name="webrtc-room-id"
      id="webrtc-room-id"
      bind:value={replication.room}
    />
    <p>{$_("N'importe qui disposant de cette identifiant de salon pourra accéder à vos données. Protégez le comme un mot de passe.", "")}</p>
  </div>
{/if}
{#if replication.type === 'couchdb' || replication.type === 'couchdb-tempo'}
  {#if replication.type === 'couchdb-tempo'}
    <p>
      <strong
        >{$_("Avertissement : ce mode de synchronisation est conçu pour vous permettre de migrer de Tempo à Pesto.", "")}</strong
      >
    </p>
    <p>
      {$_("Comme Tempo ne prend pas en charge toutes les fonctionnalités de Pesto, l'écriture de données de Pesto vers Tempo est désactivée. Cela signifie que :", "")}
      
    </p>
    <ul>
      <li>{$_("Les changements effectués sur Tempo seront répercutés de Tempo vers Pesto", "")}</li>
      <li>{$_("Les changements effectués sur Pesto ne seront pas répercutés de Pesto vers Tempo", "")}</li>
    </ul>
    <p>{$_("C'est moins performant et devrait être désactivé lorsque vous basculez entièrement sur Pesto.", "")}</p>
  {/if}
  <div class="form__field">
    <label for="couchdb-server">{$_("Serveur", "")} URL</label>
    <input
      name="couchdb-server"
      id="couchdb-url"
      type="url"
      bind:value={replication.server}
      required
    />
  </div>
  <div class="form__field">
    <label for="couchdb-database">{$_("Base de données", "")} name</label>
    <input
      name="couchdb-database"
      id="couchdb-database"
      bind:value={replication.database}
      required
    />
  </div>
  <div class="form__field">
    <label for="couchdb-username">{$_("Nom d'utilisateur·ice", "")}</label>
    <input
      name="couchdb-username"
      id="couchdb-username"
      bind:value={replication.username}
      required
    />
  </div>
  <div class="form__field">
    <label for="couchdb-password">{$_("Mot de passe", "")}</label>
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
  <label for="push">{$_("Envoyer les changements locaux", "")}</label>
</div>
<div class="form__field">
  <input id="pull" name="pull" type="checkbox" bind:checked={replication.pull} />
  <label for="pull">{$_("Télécharger les changements distants", "")}</label>
</div>
