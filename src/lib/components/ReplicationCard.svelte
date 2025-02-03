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
    <strong>{$_('Mode :', '')}</strong>
    {$_('WebRTC :', '')} <br />
    <strong>{$_('Serveur de mise en relation :', '')}</strong>
    {replication.signalingServer} <br />
  {/if}
  {#if replication.type === 'couchdb'}
    <strong>{$_('Mode :', '')}</strong>
    {replication.type === 'couchdb'
      ? $_('CouchDB :', '')
      : $_('CouchDB (avec compatibilité Tempo)', '')} <br />
    <strong>{$_('URL du serveur :', '')}</strong>
    {replication.server} <br />
    <strong>{$_('Base de données :', '')}</strong>
    {replication.database} <br />
    <strong>{$_("Nom d'utilisateur·ice :", '')}</strong>
    {replication.username} <br />
    <strong>{$_('Mot de passe :', '')}</strong>
    {$_('[masqué]', '')}<br />
  {/if}
  <strong>{$_('Envoyer les données locales :', '')}</strong>
  {replication.push ? $_('Oui', '') : $_('Non', '')} <br />
  <strong>{$_('Télécharger les données distantes :', '')}</strong>
  {replication.pull ? $_('Oui', '') : $_('Non', '')} <br />

  <div>
    <DialogForm
      anchorClass="button__link"
      anchorText={$_('Éditer', '')}
      title={$_('Modifier la synchronisation', '')}
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
      anchorText={$_('Supprimer…', '')}
      title={$_('Supprimer cette synchronisation ?', '')}
      onsubmit={(e: SubmitEvent) => {
        e.preventDefault();
        dispatch('delete', {});
      }}
    >
      <p>
        {$_(
          "La synchronisation des données avec d'autres appareils sera interrompue. Les données actuellement stockées sur votre appareils seront conservées.",
          ''
        )}
      </p>
    </DialogForm>
  </div>
</div>
