export type ProfileReplication = {
  id: string;
  name: string;
  description: string;
};

export type Profile = {
  id: string;
  name: string;
  description: string;
  replication?: ProfileReplication;
};

export type IndexedProfiles = {
  [key: string]: Profile;
};
