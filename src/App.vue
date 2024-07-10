<template>
  <router-view />
</template>

<script setup lang="ts">
defineOptions({
  name: 'App',
});
</script>

<style>
h1:first-child,
h2:first-child,
h3:first-child,
h4:first-child,
h5:first-child,
h6:first-child,
p:first-child,
ul:first-child,
ol:first-child {
  margin-top: 0;
}

h1:last-child,
h2:last-child,
h3:last-child,
h4:last-child,
h5:last-child,
h6:last-child,
p:last-child,
ul:last-child,
ol:last-child {
  margin-bottom: 0;
}
.width-sm {
  max-width: 600px;
}
.width-md {
  max-width: 800px;
}
</style>
