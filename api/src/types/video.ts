import { BaseResponse } from "./shared";

export interface VideoFileData {
  filePath: string;
  fileExt?: string;
  title: string;
  actors: string[];
  source: string;
  addedDate: number;
};

export interface VideoRow {
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

export interface ClientVideo {
  id: number;
  title: string;
  thumbnailId: string;
  filePath: string;
  fileExt: string;
  addedDate: string;
  isFavorite: boolean;
  originalTitle: string;
  source: ClientSource;
  actors: ClientActor[];
  tags: VideoTag[]
}

export interface SourceRow {
  id: number;
  imageFileSmall: string | null;
  imageFileLarge: string | null;
  siteUrl: string | null;
  name: string | null;
};

export interface ClientSource {
  id: number;
  imageFileSmall: string;
  imageFileLarge: string;
  siteUrl: string;
  name: string;
}

export interface ActorRow {
  id: number;
  name: string | null;
  imageFile: string | null;
  imageFallbackVideoId: number | null;
  isFavorite: number | null;      // 0 or 1
  birthYear: number | null;
};  

export interface ClientActor {
  id: number;
  name: string;
  imageFile: string;
  imageFallbackVideoId: number;
  isFavorite: boolean;      // 0 or 1
  birthYear: number;
  tags: ActorTag[]
}

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

export interface UpdateActorResult extends BaseResponse {
  changes: string[],
  actor?: ClientActor | ActorRow
}

export interface UpdateVideoResult extends BaseResponse {
  changes: string[],
  video?: ClientVideo | VideoRow
}

export interface ImportVideosResult extends BaseResponse {
  videos: ClientVideo[],
  importCount: number
}

export interface UpdateSourceResult extends BaseResponse {
  changes: string[],
  source?: ClientSource;
}