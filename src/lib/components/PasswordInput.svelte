<script>
  /**
   * @typedef {Object} Props
   * @property {boolean} [show]
   * @property {any} value
   */

  /** @type {Props & { [key: string]: any }} */
  let { show = $bindable(false), value = $bindable(), ...rest } = $props();
</script>

<input
  {value}
  type={show ? 'text' : 'password'}
  {...rest}
  oninput={(e) => {
    value = e.target.value;
  }}
/>

<button type="button" onclick={() => (show = !show)}>{show ? 'Hide' : 'Show'}</button>
