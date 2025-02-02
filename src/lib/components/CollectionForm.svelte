<script lang="ts">
  import { _, _n } from '$lib/i18n/index.svelte';
  import { type DocumentDocument } from '$lib/db';
  import EmojiPicker from './EmojiPicker.svelte';
  interface Props {
    collection: DocumentDocument;
  }

  let {
    collection = $bindable(),
  }: Props = $props();

</script>

<div class="form__field">
  <label for="collection-name">
    {$_("Name")}
  </label>
  <input type="text" id="collection-name" name="collection-name" bind:value={collection.title}>
</div>
<div class="form__field">
  <label for="collection-query">
    {$_("Query")}
  </label>
  <textarea
    class="autoresize"
    id="collection-query" name="collection-query" bind:value={collection.data.query}>
  </textarea>
  <p class="form__help">
    {$_("Automatically include notes matching this query in the collection.")} 
  </p>
</div>
<div class="form__field">
  <label for="collection-icon">{$_("Icon:")} {collection.data.emoji || '📋️'}</label>
  <EmojiPicker 
    onemoji-click={(e) => {collection.data.emoji = e.detail.unicode}}
    style="width: 100%"
  ></EmojiPicker>
</div>