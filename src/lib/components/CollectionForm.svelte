<script lang="ts">
  import { type DocumentDocument } from '$lib/db';
  import 'emoji-picker-element';

  interface Props {
    collection: DocumentDocument;
  }

  let {
    collection = $bindable(),
  }: Props = $props();

</script>

<div class="form__field">
  <label for="collection-name">
    Name
  </label>
  <input type="text" id="collection-name" name="collection-name" bind:value={collection.title}>
</div>
<div class="form__field">
  <label for="collection-icon">Icon:  {collection.data.emoji || '📋️'}</label>
  <emoji-picker 
    onemoji-click={(e) => {collection.data.emoji = e.detail.unicode}}
    style="width: 100%"
  ></emoji-picker>
</div>
<div class="form__field">
  <label for="collection-query">
    Query
  </label>
  <textarea
    class="autoresize"
    id="collection-query" name="collection-query" bind:value={collection.data.query}>
  </textarea>
  <p class="form__help">
    Automatically include notes matching this query in the collection.
  </p>
</div>