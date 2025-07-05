import { BaseResponse } from "./shared";

export interface FileJsonOutput {
  filePath: string;
  fileExt?: string;
  title: string;
  actors: string[];
  source: string;
  addedDate: Date | number;
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

export interface ResponseVideo {
  id: number;
  title: string;
  thumbnailId: string;
  filePath: string;
  fileExt: string;
  addedDate: string;
  isFavorite: boolean;
  originalTitle: string;
  source: SourceRow;
  actors: ActorRow[];
}

export interface SourceRow {
  id: number;
  imageFileSmall: string | null;
  imageFileLarge: string | null;
  siteUrl: string | null;
  name: string | null;
};

export interface ActorRow {
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

export interface UpdateActorResult extends BaseResponse {
  changes: string[],
  actor?: ActorRow
}

export interface UpdateVideoResult extends BaseResponse {
  changes: string[],
  video?: VideoRow
}
