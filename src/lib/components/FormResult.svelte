<script lang="ts">
  import type { LogMessage } from "$lib/ui";

  interface Props {
    messages: LogMessage[];
    forEl?: string;
  }
  let {messages, forEl = ''} = $props()
</script>

<output for={forEl}>
  <ul>
    {#each messages as message}
      <li>
        <span class={`message message__${message.type}`}>
          {message.type}:
        </span>
        {message.text}
      </li>
    {/each}
  </ul>
</output>