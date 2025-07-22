import Database from "better-sqlite3"
import { ActorRow, SourceRow, VideoRow, VideoActor, VideoFileData, VideoTag, VideoTagsRef, ActorTag, ActorTagsRef } from '../types/video';
import { _VIDEOS, _ACTORS, _VIDEOACTORS, _SOURCES, _VIDEOTAGS, _VIDEOTAGSREF, _ACTORTAGS, _ACTORTAGSREF } from './videoQueries';
import { RunResultExisting } from '../types/shared';

function insertVideoFromJson(videoJson: Omit<VideoRow, 'id'>): Database.RunResult | undefined {
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
  const sourceId = insertSourceIfMissing(videoJson.source ?? '');
  const videoRow: Omit<VideoRow, 'id'> = {
    title: videoJson.title,
    filePath: videoJson.filePath,
    fileExt: videoJson.fileExt ?? null,
    addedDate: (new Date(videoJson.addedDate)).toISOString(),
    isFavorite: 0,
    thumbnailId: '',
    sourceId: Number(sourceId?.existingRowId ?? sourceId?.lastInsertRowid),
    originalTitle: videoJson.title
  }
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

export function addVideo(videoJson: VideoFileData, replace = false): RunResultExisting | null {
  if (!replace) {
    const existing: VideoRow | undefined = _VIDEOS.selectByFilePath.get(videoJson.filePath) as VideoRow;
    if (existing) {
      return { existingRowId: existing.id };
    }
    return addVideoToDb(videoJson);
  } else {
    return {}; // TODO: implement replace logic
  }
}

function insertVideoTagIfMissing(tagName: string): RunResultExisting | null {
    if (!tagName) {
        console.log('cannot input blank tag name')
        return null
    }
    let existing = _VIDEOTAGS.selectByName.get(tagName) as VideoTag
    if (existing) {
        console.log('Tag: "' + tagName + '" found. Skipping...')
        return { existingRowId: existing.id }
    }

    return _VIDEOTAGS.insert.run(tagName)
}

export function insertTagsForVideo(videoId: number, tags: string[]): number[] {
    if (!tags) {
        console.log('Video ID ' + videoId + 'tag list empty')
        return []
    }

    let tagIds: number[] = []
    tags.forEach((tag) => {
        let insertResult = insertVideoTagIfMissing(tag)
        if (insertResult) {
            let tagId = Number(insertResult.lastInsertRowid ?? insertResult.existingRowId)
            if (!isNaN(tagId)) {
                _VIDEOTAGSREF.insert.run(videoId, tagId)
                tagIds.push(tagId)
            }
        }
    })
    return tagIds
}

export function removeTagsFromVideo(videoId: number, tags: string[]): number[] {
    if (!tags) {
        console.log('Video ID ' + videoId + 'tag list empty')
        return []
    }

    let tagIds: number[] = []
    tags.forEach((tag) => {
        let tagRow = _VIDEOTAGS.selectByName.get(tag) as VideoTag
        if (tagRow) {
            tagIds.push(tagRow.id)
            _VIDEOTAGSREF.delete.run(videoId, tagRow.id)
            let otherVideoTags = _VIDEOTAGSREF.selectByTagId.all(tagRow.id)
            if (otherVideoTags.length < 1) {
                _VIDEOTAGS.delete.run(tagRow.id)
            }
        }
    })
    return tagIds
}

function removeAllTagsForVideo(videoId: number): number[] {
    if (!videoId) console.error('invalid video ID')
    let tagRows = _VIDEOTAGSREF.selectByVideoId.all(videoId) as VideoTagsRef[]
    let removedTags: number[] = []
    if (tagRows && tagRows.length > 0) {
        tagRows.forEach((idRow) => {
            _VIDEOTAGSREF.delete.run(videoId, idRow.tagId)
            let otherVideosWithTag = _VIDEOTAGSREF.selectByTagId.all(idRow.tagId)
            if (otherVideosWithTag.length < 1) {
                _VIDEOTAGS.delete.run(idRow.tagId)
                removedTags.push(idRow.tagId)
            }
        })
    }
    return removedTags
}

function insertActorTagIfMissing(tagName: string): RunResultExisting | null {
    if (!tagName) {
        console.log('cannot input blank tag name')
        return null
    }
    let existing = _ACTORTAGS.selectByName.get(tagName) as ActorTag
    if (existing) {
        console.log('Tag: "' + tagName + '" found. Skipping...')
        return { existingRowId: existing.id }
    }

    return _ACTORTAGS.insert.run(tagName)
}

export function insertTagsForActor(actorId: number, tags: string[]): number[] {
    if (!tags) {
        console.log('Actor ID ' + actorId + 'tag list empty')
        return []
    }

    let tagIds: number[] = []
    tags.forEach((tag) => {
        let insertResult = insertActorTagIfMissing(tag)
        if (insertResult) {
            let tagId = Number(insertResult.lastInsertRowid ?? insertResult.existingRowId)
            if (!isNaN(tagId)) {
                _ACTORTAGSREF.insert.run(actorId, tagId)
                tagIds.push(tagId)
            }
        }
    })
    return tagIds
}

export function removeTagsFromActor(actorId: number, tags: string[]): number[] {
    if (!tags) {
        console.log('Actor ID ' + actorId + 'tag list empty')
        return []
    }

    let tagIds: number[] = []
    tags.forEach((tag) => {
        let tagRow = _ACTORTAGS.selectByName.get(tag) as ActorTag
        if (tagRow) {
            tagIds.push(tagRow.id)
            _ACTORTAGSREF.delete.run(actorId, tagRow.id)
            let otherActorTags = _ACTORTAGSREF.selectByTagId.all(tagRow.id)
            if (otherActorTags.length < 1) {
                _ACTORTAGS.delete.run(tagRow.id)
            }
        }
    })
    return tagIds
}

function removeAllTagsForActor(actorId: number): number[] {
    if (!actorId) console.error('invalid actor ID')
    let tagRows = _ACTORTAGSREF.selectByActorId.all(actorId) as ActorTagsRef[]
    let removedTags: number[] = []
    if (tagRows && tagRows.length > 0) {
        tagRows.forEach((idRow) => {
            _ACTORTAGSREF.delete.run(actorId, idRow.tagId)
            let otherActorsWithTag = _ACTORTAGSREF.selectByTagId.all(idRow.tagId)
            if (otherActorsWithTag.length < 1) {
                _ACTORTAGS.delete.run(idRow.tagId)
                removedTags.push(idRow.tagId)
            }
        })
    }
    return removedTags
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

export function getSourceByName(name: string): SourceRow | undefined {
  return _SOURCES.selectByName.get(name) as SourceRow;
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

export function setBirthYear(actorId: number, year: number): Database.RunResult {
  return _ACTORS.updateBirthYear.run(year, actorId)
}

export function getAllVideoTags(): VideoTag[] {
  return _VIDEOTAGS.selectAll.all() as VideoTag[]
}

export function getVideoTags(videoId: number): VideoTag[] {
  const tags = _VIDEOTAGS.selectTagsByVideoId.all(videoId) as VideoTag[]
  return tags
}

export function getAllActorTags(): ActorTag[] {
  return _ACTORTAGS.selectAll.all() as ActorTag[]
}

export function getActorTags(actorId: number): ActorTag[] {
  const tags = _ACTORTAGS.selectTagsByActorId.all(actorId) as ActorTag[]
  return tags
}
