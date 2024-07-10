<script setup lang="ts">
import { reactive } from 'vue';

type ExpandedProfiles = {
  [key: string]: boolean;
};

const expandedProfiles = reactive({} as ExpandedProfiles);
import { useProfilesStore } from 'src/stores/profiles';
const profiles = useProfilesStore();

// function enable(id: string, target: HTMLInputElement) {
//   profiles.enable(id, target.checked);
// }
</script>

<template>
  <q-page class="column items-center justify-start">
    <q-card class="width-md q-mt-md">
      <q-card-section>
        <h1 class="text-h4">Pesto settings</h1>
        <q-separator></q-separator>
        <h2 class="text-h5">Profiles and synchronization</h2>
        <p>
          In Pesto, data such as diary entries and todos is associated with
          profiles. Each profile can be optionally synchronized with other
          devices, for instance your laptop and your smartphone.
        </p>
        <div class="q-pa-md row items-start q-gutter-xs">
          <q-card v-for="profile in profiles.available" :key="profile.id">
            <q-card-section>
              <h3 class="text-h6">{{ profile.name }}</h3>
              <p class="text-caption" v-if="profile.description">
                {{ profile.description }}
              </p>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-actions>
              <q-btn
                color="grey-9"
                flat
                dense
                no-caps
                :icon="
                  expandedProfiles[profile.id]
                    ? 'keyboard_arrow_up'
                    : 'keyboard_arrow_down'
                "
                @click="
                  expandedProfiles[profile.id] = !expandedProfiles[profile.id]
                "
                label="Configure…"
              />
              <q-toggle
                label="Enable"
                :modelValue="profiles.enabled.indexOf(profile.id) > -1"
                @update:model-value="
                  (value: boolean, event: Event) =>
                    profiles.enable(profile.id, value)
                "
              />
            </q-card-actions>
            <div v-show="expandedProfiles[profile.id]">
              <q-separator />
              <q-card-section class="text-subtitle2"> Hello </q-card-section>
            </div>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>
