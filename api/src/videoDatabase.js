import { videos_db as db } from '../src/database.js'

//#region queries
const _VIDEOS = Object.freeze({
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
    updateSource: db.prepare('UPDATE videos SET sourceId = ? WHERE id = ?')
})

const _ACTORS = Object.freeze({
    insert: db.prepare('INSERT INTO actors (name) VALUES (?)'),
    delete: db.prepare('DELETE FROM actors WHERE id = ?'),
    selectAll: db.prepare('SELECT * FROM actors'),
    selectById: db.prepare('SELECT * FROM actors WHERE id = ?'),
    selectByName: db.prepare('SELECT * FROM actors WHERE name = ?'),
    selectByVideoId: db.prepare('SELECT * FROM videoActors JOIN actors ON videoActors.actorId = actors.id WHERE videoActors.videoId = ?'),
    updateImage: db.prepare('UPDATE actors SET imageFile = ? WHERE id = ?'),
    updateName: db.prepare('UPDATE actors SET name = ? WHERE id = ?'),
    updateFavorite: db.prepare('UPDATE actors SET isFavorite = ? WHERE id = ?')
})

const _VIDEOACTORS = Object.freeze({
    insert: db.prepare('INSERT INTO videoActors (videoId, actorId) VALUES (?,?)'),
    delete: db.prepare('DELETE FROM videoActors WHERE actorId = ? AND videoId = ?'),
    selectAll: db.prepare('SELECT * FROM videoActors WHERE videoId = ?'),
    selectByVideoId: db.prepare('SELECT * FROM videoActors WHERE videoId = ?'),
    selectByActorId: db.prepare('SELECT * FROM videoActors WHERE actorId = ?')
})

const _SOURCES = Object.freeze({
    insert: db.prepare('INSERT INTO sources (name, imageFileSmall, imageFileLarge, siteUrl) VALUES (?,?,?,?)'),
    selectAll: db.prepare('SELECT * FROM sources'),
    selectById: db.prepare('SELECT * FROM sources WHERE id = ?'),
    selectByName: db.prepare('SELECT * FROM sources WHERE name = ?'),
    updateImageSmall: db.prepare('UPDATE sources SET imageFileSmall = ? WHERE id = ?'),
    updateImageLarge: db.prepare('UPDATE sources SET imageFileLarge = ? WHERE id = ?'),
    updateSiteUrl: db.prepare('UPDATE sources SET siteUrl = ? WHERE id = ?')
})
//#endregion


function insertVideoFromJson(videoJson) {
    try {
        return _VIDEOS.insert.run(
            videoJson.title,
            videoJson.thumbnailId,
            videoJson.filePath,
            videoJson.fileExt,
            videoJson.addedDate.toString(),
            0,
            videoJson.title,
            videoJson.sourceId
        )
    } catch (err) {
        console.error("Failed to insert video " + videoJson.title)
        console.log(err)
    }
}

function insertActorIfMissing(actorName) {
    if (!actorName) {
        console.log('cannot input blank actor name')
        return null
    }
    let existing = _ACTORS.selectByName.get(actorName)
    if (existing) {
        console.log('Actor: "' + actorName + '" found. Skipping...')
        return { existingRowId: existing.id }
    }

    return _ACTORS.insert.run(actorName)
}

function insertActorsForVideo(videoId, actorNames) {
    if (!actorNames) {
        console.log('Video ID ' + videoId + 'actor list empty')
        return []
    }

    let actorIds = []
    actorNames.forEach((actorName) => {
        let insertResult = insertActorIfMissing(actorName)
        if (insertResult) {
            let actorId = insertResult.lastInsertRowid 
                        ?? insertResult.existingRowId
            _VIDEOACTORS.insert.run(videoId, actorId)
            actorIds.push(actorId)
        }
    })
    return actorIds
}

function removeAllActorsForVideo(videoId) {
    if (!videoId) console.err('invalid video ID')
    let actorRows = _VIDEOACTORS.selectAll.all(videoId)
    let removedActors = []
    if (actorRows && actorRows.length > 0) {
        actorRows.forEach((idRow) => {
            console.log("removing actor ID: " + idRow.actorId + " from video ID: " + videoId)
            let deleteResult = _VIDEOACTORS.delete.run(idRow.actorId, parseInt(videoId))
            console.log(deleteResult)
            let otherVideosWithActor = _VIDEOACTORS.selectByActorId.all(idRow.actorId)
            console.log('other videos with actor ID: ' + idRow.actorId)
            console.log(otherVideosWithActor)
            if (otherVideosWithActor.length < 1) {
                let actorDeleteResult = _ACTORS.delete.run(idRow.actorId)
                if (actorDeleteResult.changes > 0) {
                    removedActors.push(idRow.actorId)
                }
            }
        })
    }
    return removedActors
}

function removeActorsFromVideo(videoId, actorNames) {
    if (!actorNames) {
        console.log('Video ID ' + videoId + 'actor list empty')
        return []
    }

    let actorIds = []
    actorNames.forEach((actorName) => {
        let actorRow = _ACTORS.selectByName.get(actorName)
        if (actorRow) {
            actorIds.push(actorRow.id)
            let vaDeleteResult = _VIDEOACTORS.delete.run(actorRow.id, videoId)
            let otherVideoActors = _VIDEOACTORS.selectByActorId.all(actorRow.id)
            if (otherVideoActors.length < 1) {
                _ACTORS.delete.run(actorRow.id)
            }
        }
    })
    return actorIds
}

export function insertSourceIfMissing(sourceName) {
    if (!sourceName) {
        console.log('cannot input blank actor name')
        return null
    }
    let existing = _SOURCES.selectByName.get(sourceName)
    if (existing) {
        console.log('Source: "' + sourceName + '" found. Skipping...')
        return { existingRowId: existing.id }
    }
    return _SOURCES.insert.run(sourceName, null, null, null)
}

function addVideoToDb(videoJson) {
    let sourceId = insertSourceIfMissing(videoJson.source)
    videoJson.sourceId = sourceId.existingRowId ?? sourceId.lastInsertRowid
    let insertResult = insertVideoFromJson(videoJson)
    let actorIds = insertActorsForVideo(insertResult.lastInsertRowid, videoJson.actors)
    
    insertResult.actorIds = actorIds
    // insertResult.tagIds = tagIds
    return insertResult
}

function removeVideoFromDb(videoId) {
    let actorIds = removeAllActorsForVideo(videoId)
    let insertResult = _VIDEOS.delete.run(videoId)
    insertResult.actorIds = actorIds
    return insertResult
}

export function deleteVideo(videoId) {
    let videoData = _VIDEOS.selectById.get(videoId)
    if (!videoData) return { success: false, error: 'video not found' }
    return removeVideoFromDb(videoId, videoData)
}

export function addVideo(videoJson, replace = false) {
    if (!replace) {
        let existing = _VIDEOS.selectByFilePath.get(videoJson.filePath)
        if (existing) {
            console.log('Video: "' + videoJson.title + '" found. Skipping...')
            return { existingRow: existing}
        } else {
            console.log('Added video: "' + videoJson.title + '"')
            return addVideoToDb(videoJson)
        }
    }
    else {
        //TODO: replace existing video record when `replace` is true
        return {}
    }
}

export function getVideos() {
    return _VIDEOS.selectAll.all()
}

export function getVideoById(id) {
    return _VIDEOS.selectById.get(id)
}

export function getVideoFilePathById(id) {
    return _VIDEOS.selectFilePathById.get(id)
}

export function getVideoThumbnailById(id) {
    return _VIDEOS.selectThumbnailById.get(id)
}

export function updateThumbnail(id, thumbnail) {
    return _VIDEOS.updateThumbnailId.run(thumbnail, id)
}

export function getVideoActors(videoId) {
    return _ACTORS.selectByVideoId.all(videoId)
}

export function getActorById(id) {
    return _ACTORS.selectById.get(id)
}

export function getAllActors() {
    return _ACTORS.selectAll.all()
}

export function updateActorImage(id, imageFile) {
    return _ACTORS.updateImage.run(imageFile, id)
}

export function setVideoTitle(id, newTitle) {
    return updateVideoTitle.run(newTitle, id)
}

export function addActors(id, actors) {
    return insertActorsForVideo(id, actors)
}

export function removeActors(id, actors) {
    return removeActorsFromVideo(id, actors)
}

export function setVideoFavoriteValue(id, value) {
    if (typeof value !== "boolean") {
        throw new Error("TypeError - Favorite value must be boolean")    
    }
    return _VIDEOS.updateFavorite.run(value ? 1 : 0, id)
}

//#region sources
export function getAllSources() {
    return _SOURCES.selectAll.all()
}

export function getSourceById(id) {
    if (!id) return null
    return _SOURCES.selectById.get(id)
}

export function updateSourceImageSmall(id, imageSmall) {
    return _SOURCES.updateImageSmall.run(imageSmall, id)
}

export function updateSourceImageLarge(id, imageLarge) {
    return _SOURCES.updateImageLarge.run(imageLarge, id)
}

export function updateSourceSiteUrl(id, siteUrl) {
    return _SOURCES.updateSiteUrl.run(siteUrl, id)
}
//#endregion

export function setVideoSourceId(videoId, sourceId) {
    return _VIDEOS.updateSource.run(sourceId, videoId)
}

export function setActorName(id, name) {
    return _ACTORS.updateName.run(name, id)
}

export function setFavorite(id, value) {
    if (typeof value !== "boolean") {
        throw new Error("TypeError - Favorite value must be boolean")    
    }
    return _ACTORS.updateFavorite.run(value ? 1 : 0, id)
}

