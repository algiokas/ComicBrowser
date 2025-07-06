import Database from "better-sqlite3"
import { ActorRow, SourceRow, VideoRow, VideoActor, VideoFileData } from '../types/video';
import { _VIDEOS, _ACTORS, _VIDEOACTORS, _SOURCES } from './videoQueries';
import { RunResultExisting } from '../types/shared';

function insertVideoFromJson(videoJson: Partial<VideoRow>): Database.RunResult | undefined {
  try {
    return _VIDEOS.insert.run(
      videoJson.title,
      videoJson.thumbnailId,
      videoJson.filePath,
      videoJson.fileExt,
      videoJson.addedDate ?? new Date().toISOString(),
      0,  
      videoJson.title,
      videoJson.sourceId
    );
  } catch (err) {
    console.error("Failed to insert video " + videoJson.title);
    console.log(err);
  }
}

function insertActorIfMissing(actorName: string): RunResultExisting | null {
  if (!actorName) {
    console.log('cannot input blank actor name');
    return null;
  }
  const existing = _ACTORS.selectByName.get(actorName) as ActorRow;
  if (existing) {
    console.log('Actor: "' + actorName + '" found. Skipping...');
    return { existingRowId: existing.id };
  }
  return _ACTORS.insert.run(actorName);
}

function insertActorsForVideo(videoId: number, actorNames: string[]): number[] {
  if (!actorNames) {
    console.log('Video ID ' + videoId + 'actor list empty');
    return [];
  }
  const actorIds: number[] = [];
  actorNames.forEach((actorName: string) => {
    const insertResult = insertActorIfMissing(actorName);
    if (insertResult) {
      const actorId = Number(insertResult.lastInsertRowid ?? insertResult.existingRowId);
      _VIDEOACTORS.insert.run(videoId, actorId);
      actorIds.push(actorId);
    }
  });
  return actorIds;
}

function removeAllActorsForVideo(videoId: number): number[] {
  if (!videoId) console.error('invalid video ID');
  const actorRows = _VIDEOACTORS.selectAll.all(videoId) as VideoActor[];
  const removedActors: number[] = [];
  actorRows?.forEach((idRow: VideoActor) => {
    const deleteResult: Database.RunResult = _VIDEOACTORS.delete.run(idRow.actorId, videoId);
    const otherVideos: any[] = _VIDEOACTORS.selectByActorId.all(idRow.actorId);
    if (otherVideos.length < 1) {
      const actorDeleteResult: Database.RunResult = _ACTORS.delete.run(idRow.actorId);
      if (actorDeleteResult.changes > 0) {
        removedActors.push(idRow.actorId);
      }
    }
  });
  return removedActors;
}

function removeActorsFromVideo(videoId: number, actorNames: string[]): number[] {
  const actorIds: number[] = [];
  actorNames.forEach((actorName) => {
    const actorRow = _ACTORS.selectByName.get(actorName) as ActorRow;
    if (actorRow) {
      actorIds.push(actorRow.id);
      _VIDEOACTORS.delete.run(actorRow.id, videoId);
      const otherVideoActors = _VIDEOACTORS.selectByActorId.all(actorRow.id);
      if (otherVideoActors.length < 1) {
        _ACTORS.delete.run(actorRow.id);
      }
    }
  });
  return actorIds;
}

export function insertSourceIfMissing(sourceName: string): RunResultExisting | null {
  if (!sourceName) {
    console.log('cannot input blank source name');
    return null;
  }
  const existing = _SOURCES.selectByName.get(sourceName) as SourceRow;
  if (existing) {
    return { existingRowId: existing.id };
  }
  return _SOURCES.insert.run(sourceName, null, null, null);
}

function addVideoToDb(videoJson: VideoFileData): RunResultExisting | null {
  const videoRow: Partial<VideoRow> = {
    title: videoJson.title,
    filePath: videoJson.filePath,
    fileExt: videoJson.fileExt,
    addedDate: (new Date(videoJson.addedDate)).toISOString(),
    isFavorite: 0,
    thumbnailId: ''
  }

  const sourceId = insertSourceIfMissing(videoJson.source ?? '');
  videoRow.sourceId = Number(sourceId?.existingRowId ?? sourceId?.lastInsertRowid);
  const insertResult = insertVideoFromJson(videoRow);
  if (!insertResult) return null;
  insertActorsForVideo(Number(insertResult.lastInsertRowid), videoJson.actors ?? []);
  return insertResult;
}

function removeVideoFromDb(videoId: number): Database.RunResult & { actorIds: number[] } {
  const actorIds = removeAllActorsForVideo(videoId);
  const result = _VIDEOS.delete.run(videoId);
  return { ...result, actorIds };
}

export function deleteVideo(videoId: number): { success: boolean; error?: string } | (Database.RunResult & { actorIds: number[] }) {
  const videoData = _VIDEOS.selectById.get(videoId) as VideoRow;
  if (!videoData) return { success: false, error: 'video not found' };
  return removeVideoFromDb(videoId);
}

export function addVideo(videoJson: VideoFileData, replace = false) {
  if (!replace) {
    const existing: VideoRow | undefined = _VIDEOS.selectByFilePath.get(videoJson.filePath) as VideoRow;
    if (existing) {
      return { existingRow: existing };
    }
    return addVideoToDb(videoJson);
  } else {
    return {}; // TODO: implement replace logic
  }
}

export function getVideos(): VideoRow[] {
  return _VIDEOS.selectAll.all() as VideoRow[];
}

export function getVideoById(id: number): VideoRow | undefined {
  return _VIDEOS.selectById.get(id) as VideoRow;
}

export function getVideoThumbnailById(id: number): string | null {
  const vThumb = _VIDEOS.selectThumbnailById.get(id) as { thumbnailId: string | null };
  return vThumb.thumbnailId
}

export function updateThumbnail(id: number, thumbnail: string): Database.RunResult {
  return _VIDEOS.updateThumbnailId.run(thumbnail, id);
}

export function getVideoActors(videoId: number): ActorRow[] {
  return _ACTORS.selectByVideoId.all(videoId) as ActorRow[];
}

export function getActorById(id: number): ActorRow | undefined {
  return _ACTORS.selectById.get(id) as ActorRow;
}

export function getAllActors(): ActorRow[] {
  return _ACTORS.selectAll.all() as ActorRow[];
}

export function updateActorImage(id: number, imageFile: string): Database.RunResult {
  return _ACTORS.updateImage.run(imageFile, id);
}

export function setVideoTitle(id: number, newTitle: string): Database.RunResult {
  return _VIDEOS.updateTitle.run(newTitle, id);
}

export function addActors(id: number, actors: string[]): number[] {
  return insertActorsForVideo(id, actors);
}

export function removeActors(id: number, actors: string[]): number[] {
  return removeActorsFromVideo(id, actors);
}

export function setVideoFavoriteValue(id: number, value: boolean): Database.RunResult {
  return _VIDEOS.updateFavorite.run(value ? 1 : 0, id);
}

export function getAllSources(): SourceRow[] {
  return _SOURCES.selectAll.all() as SourceRow[];
}

export function getSourceById(id: number): SourceRow | undefined {
  return _SOURCES.selectById.get(id) as SourceRow;
}

export function updateSourceImageSmall(id: number, imageSmall: string): Database.RunResult {
  return _SOURCES.updateImageSmall.run(imageSmall, id);
}

export function updateSourceImageLarge(id: number, imageLarge: string): Database.RunResult {
  return _SOURCES.updateImageLarge.run(imageLarge, id);
}

export function updateSourceSiteUrl(id: number, siteUrl: string): Database.RunResult {
  return _SOURCES.updateSiteUrl.run(siteUrl, id);
}

export function setVideoSourceId(videoId: number, sourceId: number): Database.RunResult {
  return _VIDEOS.updateSource.run(sourceId, videoId);
}

export function setActorName(id: number, name: string): Database.RunResult {
  return _ACTORS.updateName.run(name, id);
}

export function setFavorite(id: number, value: boolean): Database.RunResult {
  return _ACTORS.updateFavorite.run(value ? 1 : 0, id);
}
