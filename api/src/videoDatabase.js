const db = require('../src/database').db

const insertVideo = db.prepare('INSERT INTO videos (title, thumbnailId, fileName, addedDate, isFavorite, originalTitle')
const deleteVideo = db.prepare('DELETE FROM videos WHERE id = ?')
const selectVideos = db.prepare('SELECT * FROM videos')
const getVideoByTitle = db.prepare('SELECT * FROM books WHERE title = ?')
const getVideoByFileName = db.prepare('SELECT * FROM books WHERE fileName = ?')

function insertVideoFromJson(videoJson) {
    try {
        return insertVideo.run(
            videoJson.title,
            null,
            videoJson.fileName,
            videoJson.addedDate.toString(),
            false,
            videoJson.title
        )
    } catch (err) {
        console.error("Failed to insert video " + videoJson.title)
        console.log(err)
    }
}

function addVideoToDb(videoJson) {
    let insertResult = insertVideoFromJson(videoJson)
    // let artistIds = insertArtistsForBook(insertResult.lastInsertRowid, bookJson.artists)
    // let tagIds = insertTagsForBook(insertResult.lastInsertRowid, bookJson.tags)
    // insertResult.artistIds = artistIds
    // insertResult.tagIds = tagIds
    return insertResult
}

exports.addVideo = function(videoJson, replace = false) {
    if (!replace) {
        let existing = getVideoByFileName.get(videoJson.fileName)
        if (existing && existing.originalTitle === bookJson.title) {
            console.log('Video: "' + videoJson.title + '" found. Skipping...')
            return { existingRow: existing}
        } else {
            console.log('Added video: "' + videoJson.title + '"')
            return addVideoToDb(videoJson)
        }
    }
    else {
        //TODO: replace existing book record when `replace` is true
        return {}
    }
}
