import { videos_db as db } from './database';

export const _VIDEOS = Object.freeze({
  insert: db.prepare('INSERT INTO videos (title, thumbnailId, filePath, fileExt, addedDate, isFavorite, originalTitle, sourceId) VALUES (?,?,?,?,?,?,?,?)'),
  delete: db.prepare('DELETE FROM videos WHERE id = ?'),
  selectAll: db.prepare('SELECT * FROM videos'),
  selectById: db.prepare('SELECT * FROM videos WHERE id = ?'),
  selectByTitle: db.prepare('SELECT * FROM videos WHERE title = ?'),
  selectByFilePath: db.prepare('SELECT * FROM videos WHERE filePath = ?'),
  selectFilePathById: db.prepare('SELECT filePath FROM videos WHERE id = ?'),
  selectThumbnailById: db.prepare('SELECT thumbnailId FROM videos WHERE id = ?'),
  updateThumbnailId: db.prepare('UPDATE videos SET thumbnailId = ? WHERE id = ?'),
  updateTitle: db.prepare('UPDATE videos SET title = ? WHERE id = ?'),
  updateFavorite: db.prepare('UPDATE videos SET isFavorite = ? WHERE id = ?'),
  updateSource: db.prepare('UPDATE videos SET sourceId = ? WHERE id = ?'),
});

export const _ACTORS = Object.freeze({
  insert: db.prepare('INSERT INTO actors (name) VALUES (?)'),
  delete: db.prepare('DELETE FROM actors WHERE id = ?'),
  selectAll: db.prepare('SELECT * FROM actors'),
  selectById: db.prepare('SELECT * FROM actors WHERE id = ?'),
  selectByName: db.prepare('SELECT * FROM actors WHERE name = ?'),
  selectByVideoId: db.prepare('SELECT * FROM videoActors JOIN actors ON videoActors.actorId = actors.id WHERE videoActors.videoId = ?'),
  updateImage: db.prepare('UPDATE actors SET imageFile = ? WHERE id = ?'),
  updateName: db.prepare('UPDATE actors SET name = ? WHERE id = ?'),
  updateFavorite: db.prepare('UPDATE actors SET isFavorite = ? WHERE id = ?'),
});

export const _VIDEOACTORS = Object.freeze({
  insert: db.prepare('INSERT INTO videoActors (videoId, actorId) VALUES (?,?)'),
  delete: db.prepare('DELETE FROM videoActors WHERE actorId = ? AND videoId = ?'),
  selectAll: db.prepare('SELECT * FROM videoActors WHERE videoId = ?'),
  selectByVideoId: db.prepare('SELECT * FROM videoActors WHERE videoId = ?'),
  selectByActorId: db.prepare('SELECT * FROM videoActors WHERE actorId = ?'),
});

export const _SOURCES = Object.freeze({
  insert: db.prepare('INSERT INTO sources (name, imageFileSmall, imageFileLarge, siteUrl) VALUES (?,?,?,?)'),
  selectAll: db.prepare('SELECT * FROM sources'),
  selectById: db.prepare('SELECT * FROM sources WHERE id = ?'),
  selectByName: db.prepare('SELECT * FROM sources WHERE name = ?'),
  updateImageSmall: db.prepare('UPDATE sources SET imageFileSmall = ? WHERE id = ?'),
  updateImageLarge: db.prepare('UPDATE sources SET imageFileLarge = ? WHERE id = ?'),
  updateSiteUrl: db.prepare('UPDATE sources SET siteUrl = ? WHERE id = ?'),
});