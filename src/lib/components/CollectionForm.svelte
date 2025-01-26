<script lang="ts">
  import { type DocumentDocument } from '$lib/db';
  interface Props {
    collection: DocumentDocument;
  }

  let {
    collection = $bindable(),
  }: Props = $props();

</script>

<div class="form__field">
  <label for="collection-name">
    Collection name
  </label>
  <input type="text" id="collection-name" name="collection-name" bind:value={collection.title}>
</div>

<div class="form__field">
  <label for="collection-query">
    Collection query
  </label>
  <input type="text" id="collection-query" name="collection-query" bind:value={collection.data.query}>
  <p class="form__help">
    Automatically include notes matching this query in the collection.
  </p>
</div>