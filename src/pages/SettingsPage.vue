<script setup lang="ts">
import { useProfilesStore } from 'src/stores/profiles';
const profiles = useProfilesStore();

// function enable(id: string, target: HTMLInputElement) {
//   profiles.enable(id, target.checked);
// }
</script>

<template>
  <q-page class="column items-center justify-start">
    <q-card class="width-sm q-mt-md">
      <q-card-section>
        <h1 class="text-h4">Pesto settings</h1>
        <q-separator></q-separator>
        <h2 class="text-h6">Profiles</h2>
        <p>
          In Pesto, data such as diary entries and todos is linked to a specific
          profile. Each profile can be optionally synchronized with other
          devices, for instance your laptop and your smartphone.
        </p>
        <q-list bordered separator>
          <q-item v-for="profile in profiles.available" :key="profile.id">
            <q-item-section>
              <q-item-label>{{ profile.name }}</q-item-label>
              <q-item-label caption v-if="profile.description">{{
                profile.description
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                label="Enable"
                :modelValue="profiles.enabled.indexOf(profile.id) > -1"
                @update:model-value="
                  (value: boolean, event: Event) =>
                    profiles.enable(profile.id, value)
                "
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>
