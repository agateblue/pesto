import { defineStore } from 'pinia';
import { Profile, IndexedProfiles } from 'src/models/profile';

const defaultProfile: Profile = {
  id: '_default',
  name: 'Default',
  description: 'The default profile bundled with Pesto',
};

export const useProfilesStore = defineStore('profiles', {
  state: () => ({
    enabled: ['_default'] as string[],
    available: [defaultProfile] as Profile[],
  }),
  getters: {
    enabledProfiles: (state) => {
      return state.available.filter((profile: Profile) => {
        return state.enabled.indexOf(profile.id) > -1;
      });
    },
    availableProfilesById: (state) => {
      const profiles: IndexedProfiles = {};
      state.available.forEach((profile: Profile) => {
        profiles[profile.id] = profile;
      });
      return profiles;
    },
  },
  actions: {
    enable(id: string, value: boolean = true) {
      if (!this.availableProfilesById[id]) {
        console.error(`Profile ${id} does not exist`);
        return;
      }
      let allEnabledProfiles = [...this.enabled];
      if (value) {
        allEnabledProfiles.push(id);
      } else {
        allEnabledProfiles = allEnabledProfiles.filter((profileId) => {
          return id != profileId;
        });
      }

      // unique / reorder
      allEnabledProfiles = [...new Set(allEnabledProfiles)];
      allEnabledProfiles.sort();
      this.enabled = allEnabledProfiles;
    },
  },
});
