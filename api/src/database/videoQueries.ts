import { videos_db as db } from './database';

const tables = Object.freeze({
  videos: 'videos',
  sources: 'sources',
  actors: 'actors',
  videoActors: 'videoActors',
  actorTags: 'actorTags',
  actorTagsRef: 'actorTagsRef',
  videoTags: 'videoTags',
  videoTagsRef: 'videoTagsRef'
})

export const _VIDEOS = Object.freeze({
  insert: db.prepare(`INSERT INTO ${tables.videos} (title, thumbnailId, filePath, fileExt, addedDate, isFavorite, originalTitle, sourceId) VALUES (?,?,?,?,?,?,?,?)`),
  delete: db.prepare(`DELETE FROM ${tables.videos} WHERE id = ?`),
  selectAll: db.prepare(`SELECT * FROM ${tables.videos}`),
  selectById: db.prepare(`SELECT * FROM ${tables.videos} WHERE id = ?`),
  selectByTitle: db.prepare(`SELECT * FROM ${tables.videos} WHERE title = ?`),
  selectByFilePath: db.prepare(`SELECT * FROM ${tables.videos} WHERE filePath = ?`),
  selectFilePathById: db.prepare(`SELECT filePath FROM ${tables.videos} WHERE id = ?`),
  selectThumbnailById: db.prepare(`SELECT thumbnailId FROM ${tables.videos} WHERE id = ?`),
  updateThumbnailId: db.prepare(`UPDATE ${tables.videos} SET thumbnailId = ? WHERE id = ?`),
  updateTitle: db.prepare(`UPDATE ${tables.videos} SET title = ? WHERE id = ?`),
  updateFavorite: db.prepare(`UPDATE ${tables.videos} SET isFavorite = ? WHERE id = ?`),
  updateSource: db.prepare(`UPDATE ${tables.videos} SET sourceId = ? WHERE id = ?`),
});

export const _ACTORS = Object.freeze({
  insert: db.prepare(`INSERT INTO ${tables.actors} (name) VALUES (?)`),
  delete: db.prepare(`DELETE FROM ${tables.actors} WHERE id = ?`),
  selectAll: db.prepare(`SELECT * FROM ${tables.actors}`),
  selectById: db.prepare(`SELECT * FROM ${tables.actors} WHERE id = ?`),
  selectByName: db.prepare(`SELECT * FROM ${tables.actors} WHERE name = ?`),
  selectByVideoId: db.prepare(`SELECT * FROM ${tables.videoActors} JOIN ${tables.actors} ON ${tables.videoActors}.actorId = ${tables.actors}.id WHERE ${tables.videoActors}.videoId = ?`),
  updateImage: db.prepare(`UPDATE ${tables.actors} SET imageFile = ? WHERE id = ?`),
  updateName: db.prepare(`UPDATE ${tables.actors} SET name = ? WHERE id = ?`),
  updateFavorite: db.prepare(`UPDATE ${tables.actors} SET isFavorite = ? WHERE id = ?`),
  updateBirthYear: db.prepare(`UPDATE ${tables.actors} SET birthYear = ? WHERE id = ?`)
});

export const _VIDEOACTORS = Object.freeze({
  insert: db.prepare(`INSERT INTO ${tables.videoActors} (videoId, actorId) VALUES (?,?)`),
  delete: db.prepare(`DELETE FROM ${tables.videoActors} WHERE actorId = ? AND videoId = ?`),
  selectAll: db.prepare(`SELECT * FROM ${tables.videoActors} WHERE videoId = ?`),
  selectByVideoId: db.prepare(`SELECT * FROM ${tables.videoActors} WHERE videoId = ?`),
  selectByActorId: db.prepare(`SELECT * FROM ${tables.videoActors} WHERE actorId = ?`),
});

export const _SOURCES = Object.freeze({
  insert: db.prepare(`INSERT INTO ${tables.sources} (name, imageFileSmall, imageFileLarge, siteUrl) VALUES (?,?,?,?)`),
  selectAll: db.prepare(`SELECT * FROM ${tables.sources}`),
  selectById: db.prepare(`SELECT * FROM ${tables.sources} WHERE id = ?`),
  selectByName: db.prepare(`SELECT * FROM ${tables.sources} WHERE name = ?`),
  updateImageSmall: db.prepare(`UPDATE ${tables.sources} SET imageFileSmall = ? WHERE id = ?`),
  updateImageLarge: db.prepare(`UPDATE ${tables.sources} SET imageFileLarge = ? WHERE id = ?`),
  updateSiteUrl: db.prepare(`UPDATE ${tables.sources} SET siteUrl = ? WHERE id = ?`),
});

export const _VIDEOTAGS = Object.freeze({
  insert: db.prepare(`INSERT INTO ${tables.videoTags} (name) VALUES (?)`),
  selectAll: db.prepare(`SELECT * FROM ${tables.videoTags}`),
  selectById: db.prepare(`SELECT * FROM ${tables.videoTags} WHERE id = ?`),
  selectByName: db.prepare(`SELECT * FROM ${tables.videoTags} WHERE name = ?`),
  selectTagsByVideoId: db.prepare(`SELECT ${tables.videoTags}.id, ${tables.videoTags}.name FROM ${tables.videoTagsRef} JOIN ${tables.videoTags} ON ${tables.videoTagsRef}.tagId = ${tables.videoTags}.id WHERE ${tables.videoTagsRef}.videoId = ?`),
  updateImageFile: db.prepare(`UPDATE ${tables.videoTags} SET imageFile = ? WHERE id = ?`),
  delete: db.prepare(`DELETE FROM ${tables.videoTags} WHERE id = ?`)
})

export const _VIDEOTAGSREF = Object.freeze({
  insert: db.prepare(`INSERT INTO ${tables.videoTagsRef} (videoId, tagId) VALUES (?, ?)`),
  selectByVideoId: db.prepare(`SELECT * FROM ${tables.videoTagsRef} WHERE videoId = ?`),
  selectByTagId: db.prepare(`SELECT * FROM ${tables.videoTagsRef} WHERE tagId = ?`),
  delete: db.prepare(`DELETE FROM ${tables.videoTagsRef} WHERE videoId = ? AND tagId = ?`)
})

export const _ACTORTAGS = Object.freeze({
  insert: db.prepare(`INSERT INTO ${tables.actorTags} (name) VALUES (?)`),
  selectAll: db.prepare(`SELECT * FROM ${tables.actorTags}`),
  selectById: db.prepare(`SELECT * FROM ${tables.actorTags} WHERE id = ?`),
  selectByName: db.prepare(`SELECT * FROM ${tables.actorTags} WHERE name = ?`),
  selectTagsByActorId: db.prepare(`SELECT ${tables.actorTags}.id, ${tables.actorTags}.name FROM ${tables.actorTagsRef} JOIN ${tables.actorTags} ON ${tables.actorTagsRef}.tagId = ${tables.actorTags}.id WHERE ${tables.actorTagsRef}.actorId = ?`),
  updateImageFile: db.prepare(`UPDATE ${tables.actorTags} SET imageFile = ? WHERE id = ?`),
  delete: db.prepare(`DELETE FROM ${tables.actorTags} WHERE id = ?`)
})

export const _ACTORTAGSREF = Object.freeze({
  insert: db.prepare(`INSERT INTO ${tables.actorTagsRef} (actorId, tagId) VALUES (?, ?)`),
  selectByActorId: db.prepare(`SELECT * FROM ${tables.actorTagsRef} WHERE actorId = ?`),
  selectByTagId: db.prepare(`SELECT * FROM ${tables.actorTagsRef} WHERE tagId = ?`),
  delete: db.prepare(`DELETE FROM ${tables.actorTagsRef} WHERE actorId = ? AND tagId = ?`)
})