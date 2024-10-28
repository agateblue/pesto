<script>
  export let show = false
  export let value
</script>
  
<input {value} type={show ? 'text' : 'password'} {...$$restProps} on:input={(e) => {value = e.target.value}} />

<button type="button" on:click="{ () => show = !show }">{show ? 'Hide' : 'Show'}</button>
