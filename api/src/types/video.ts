export interface FileJsonOutput {
  filePath: string;
  fileExt?: string;
  title: string;
  actors: string[];
  source: string;
  addedDate: Date | number;
};

export interface Video {
  id: number;
  title: string | null;
  thumbnailId: string | null;
  filePath: string | null;
  fileExt: string | null;
  addedDate: string | null;       // stored as TEXT
  isFavorite: number | null;      // 0 or 1, could also wrap with a boolean if desired
  originalTitle: string | null;
  sourceId: number | null;
};

export interface Source {
  id: number;
  imageFileSmall: string | null;
  imageFileLarge: string | null;
  siteUrl: string | null;
  name: string | null;
};

export interface Actor {
  id: number;
  name: string | null;
  imageFile: string | null;
  imageFallbackVideoId: number | null;
  isFavorite: number | null;      // 0 or 1
};

export interface VideoActor {
  videoId: number;
  actorId: number;
};

export interface ActorTag {
  id: number;
  name: string | null;
};

export interface VideoTag {
  id: number;
  name: string | null;
};

export interface ActorTagsRef {
  actorId: number;
  tagId: number;
};

export interface VideoTagsRef {
  videoId: number;
  tagId: number;
};
