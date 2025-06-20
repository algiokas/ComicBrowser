import * as videoDatabase from '../src/videoDatabase.js';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import mime from 'mime';

import 'dotenv/config';

const dataDir = process.env.VIDEOS_DATA_DIR
const videosDir = path.join(dataDir, '/videos');
const thumbnailDir = path.join(dataDir, '/images/thumbnails');
const actorImageDir = path.join(dataDir, '/images/actors')
const sourceImageDir = path.join(dataDir, '/images/sources')

//Import video file with the format:
// ActorName1, ActorName2 - VideoTitle
function fileToJson(parentDir, fileName, fileStats) {
    let output = {}
    if (!parentDir || !fileName) {
        return
    }
    output.filePath = path.join(parentDir, fileName)
    let fileNameWithoutExt = fileName
    if (fileName.includes('.')) {
        const fileNameAndExt = fileName.split(".")
        if (fileNameAndExt.length == 2) {
            fileNameWithoutExt = fileNameAndExt[0]
        } else if (fileNameAndExt.length > 2) {
            const parts = fileNameAndExt.slice(0, fileNameAndExt.length - 1)
            fileNameWithoutExt = parts.path.join('.')
        }
        output.fileExt = fileNameAndExt[fileNameAndExt.length - 1]
    }

    if (fileNameWithoutExt.includes('-')) {
        const nameParts = fileNameWithoutExt.split('-')
        const actors = nameParts[0]
        const title = nameParts.slice(1).path.join('-')

        output.title = title.trim()
        output.actors = []
        actors.split(',').forEach((actor) => output.actors.push(actor.trim()))
    }
    else {
        output.title = fileNameWithoutExt
    }
    output.source = parentDir
    if (fileStats) {
        output.addedDate = fileStats.birthtime
    } else {
        output.addedDate = Date.now()
    }
    output.filePath = path.join(parentDir, fileName)
    return output
}

function wrapQuotes(string) {
    return '"' + string + '"'
}

function fillVideo(videoRow) {
    let video = videoRow
    video.isFavorite = videoRow.isFavorite > 0
    video.source = videoDatabase.getSourceById(videoRow.sourceId)
    if (!video.actors) {
        let vActors = videoDatabase.getVideoActors(videoRow.id)
        video.actors = vActors
    }
    return video
}

function generateImageFromVideo(videoPath, timestamp, outputDir, outputFile, callback) {
    new ffmpeg(videoPath).screenshots({
        count: 1,
        timestamps: [timestamp],
        filename: outputFile,
        folder: outputDir,
        size: '100%'
    }).on('end', callback);
}

function generateThumbnailFileName(videoId, index) {
    return "vthumb_" + videoId + "-" + index
}

function getNewThumbnailFileName(videoId) {
    var thumbIndex = 0
    var thumbFileName = generateThumbnailFileName(videoId, thumbIndex)
    while (fs.existsSync(path.join(thumbnailDir, thumbFileName + ".png"))) {
        thumbIndex++
        thumbFileName = generateThumbnailFileName(videoId, thumbIndex)
    }
    return thumbFileName
}

export function getThumbnailFilePath (videoId) {
    var thumbFile = videoDatabase.getVideoThumbnailById(videoId)
    if (!thumbFile) return null
    return path.join(thumbnailDir, thumbFile.thumbnailId + ".png")
}

function generateThumbnail(video, options, callback) {
    const videoPath = path.join(videosDir, video.filePath)
    var timestamp = options?.timestamp ?? '00:30.000'
    var thumbFileName = options?.thumbFileName ?? getNewThumbnailFileName(video.id)
    try {
        generateImageFromVideo(videoPath, timestamp, thumbnailDir, thumbFileName, () => {
            videoDatabase.updateThumbnail(video.id, thumbFileName)
            video.thumbnailId = thumbFileName
            if (callback) {
                callback({ success: true, video: video })
            }
        })
        return video
    } catch (err) {
        console.log(err)
        return null
    }
}

function generateActorImageName(actor, index) {
    return actor.id + "-" + actor.name.replace(' ', '_') + "-" + index
}

function getActorImageName(actor) {
    var imgIndex = 0
    var imgFileName = generateActorImageName(actor, imgIndex)
    while (fs.existsSync(path.join(actorImageDir, imgFileName + ".png"))) {
        imgIndex++
        imgFileName = generateActorImageName(actor, imgIndex)
    }
    return imgFileName
}

function generateActorImage(actor, video, timestamp, callback, imgFileName = null) {
    const videoPath = path.join(videosDir, video.filePath)
    if (!imgFileName) {
        imgFileName = getActorImageName(actor)
    }
    try {
        generateImageFromVideo(videoPath, timestamp, actorImageDir, imgFileName, () => {
            videoDatabase.updateActorImage(actor.id, imgFileName)
            actor.imageFile = imgFileName
            callback({ success: true, actor: actor })
        })
    } catch (err) {
        console.log(err)
        return null
    }
}

function getTimestampString(timeMs) {
    var baseTime = new Date(0)
    var msTime = new Date(parseInt(timeMs))

    var hours = String(msTime.getHours() - baseTime.getHours())
    var mins = String(msTime.getMinutes() - baseTime.getMinutes())
    var seconds = String(msTime.getSeconds() - baseTime.getSeconds())
    var milliseconds = String(msTime.getMilliseconds() - baseTime.getMilliseconds())

    return hours.padStart(2, '0') + ":" + mins.padStart(2, '0') + ":" + seconds.padStart(2, '0') + "." + milliseconds
}

export function generateThumbnailExisting (videoId, timeMs, callback) {
    let video = videoDatabase.getVideoById(videoId)
    if (video) {
        let ts = getTimestampString(timeMs)
        generateThumbnail(video, { timestamp: ts }, callback)
    }
    else {
        callback({ success: false, video: null })
    }
}

export function generateImageForActor (actorId, videoId, timeMs, callback) {
    const video = videoDatabase.getVideoById(videoId)
    const actor = videoDatabase.getActorById(actorId)
    if (actor && video) {
        let timestamp = getTimestampString(timeMs)
        generateActorImage(actor, video, timestamp, callback)
    } else {
        callback({ success: false, actor: null })
    }
}

export function updateActor (actorId, newActorData, callback) {
    console.log("updating video with id " + actorId)
    let updateResult = { success: false, errors: "", changes: [] }
    let currentActorData = videoDatabase.getActorById(actorId);
    if (newActorData.name !== currentActorData.name) {
        let result = videoDatabase.setActorName(actorId, newActorData.name)
        if (result.changes > 0) {
            updateResult.changes.push("name")
        } else {
            updateResult.errors = updateResult.errors + "Updating name failed"
        }
    }
    if (newActorData.isFavorite != currentActorData.isFavorite) {
        let result = videoDatabase.setFavorite(actorId, newActorData.isFavorite)
        if (result.changes > 0) {
            updateResult.changes.push("favorite")
        } else {
            updateResult.errors = updateResult.errors + "Updating favorite value failed"
        }
    }
    updateResult.success = !updateResult.errors && updateResult.changes.length > 0
    updateResult.actor = videoDatabase.getActorById(actorId)
    callback(updateResult)
}

export function importVideos (res, callback) {
    let count = 0;
    fs.readdir(videosDir, function (err, subDirs) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        videoData = []
        subDirs.forEach((dir) => {
            let subDirPath = path.join(videosDir, dir);
            let dirStats = fs.statSync(subDirPath)
            if (dirStats.isDirectory()) {
                try {
                    const files = fs.readdirSync(subDirPath);
                    files.forEach((file) => {
                        let filePath = path.join(subDirPath, file)
                        let fileStats = fs.statSync(filePath)
                        videoData.push(fileToJson(dir, file, fileStats));
                    });
                } catch (err) {
                    return { error: err }
                }
            }
        })

        let dbRows = [];
        videoData.forEach(async (video) => {
            let addResult = videoDatabase.addVideo(video)
            if (addResult) {
                if (addResult.lastInsertRowid) {
                    video.id = addResult.lastInsertRowid
                    let possibleThumbFile = generateThumbnailFileName(video.id, 0)
                    let thumbFilePath = path.join(thumbnailDir, possibleThumbFile + ".png")
                    if (!fs.existsSync(thumbFilePath)) {
                        generateThumbnail(video)
                    } else {
                        videoDatabase.updateThumbnail(video.id, possibleThumbFile)
                    }
                    dbRows.push(video)
                    count++
                }
                else if (addResult.existingRow) {
                    video.id = addResult.existingRow.id
                    if (!addResult.existingRow.thumbnailId) {
                        generateThumbnail(video)
                    } else {
                        let thumbFilePath = getThumbnailFilePath(video.id)
                        if (thumbFilePath && !fs.existsSync(thumbFilePath)) {
                            generateThumbnail(video, { thumbFileName: addResult.existingRow.thumbnailId })
                        }
                    }
                    if (video.source && addResult.existingRow.sourceId === null) {
                        let sourceResult = videoDatabase.insertSourceIfMissing(video.source)
                        let sourceId = sourceResult.existingRowId ?? sourceResult.lastInsertRowid
                        addResult.existingRow.sourceId = sourceId
                        videoDatabase.setVideoSourceId(video.id, sourceId)
                    }
                    dbRows.push(fillVideo(addResult.existingRow))
                }
            }
        })
        callback(res, { videos: dbRows, importCount: count })
    })
}

export function getVideos () {
    console.log("Get All Videos")
    let rows = videoDatabase.getVideos()
    if (!rows || rows.length < 1) {
        console.log("no videos found")
        return rows
    }
    let videos = []
    rows.forEach(row => {
        videos.push(fillVideo(row))
    });
    return videos
}

export function getVideoFilePath (videoId) {
    let video = videoDatabase.getVideoById(videoId)
    const fullPath = path.join(videosDir, video.filePath)
    return {
        path: fullPath,
        ext: video.fileExt
    }
}

export function getActor (actorId) {
    return videoDatabase.getActorById(actorId)
}

export function getActors () {
    return videoDatabase.getAllActors()
}

export function getActorImagePath (actorId) {
    let actor = videoDatabase.getActorById(actorId)
    if (actor.imageFile) {
        return path.join(actorImageDir, actor.imageFile + ".png")
    }
    return null
}

export function deleteVideo (videoId) {
    return videoDatabase.deleteVideo(videoId)
}

function stripNonAlphanumeric(str) {
    return str.replace(/\W/g, '')
}

export function renameThumbnails () {
    let rows = videoDatabase.getVideos()
    // rows.forEach(r => {
    //     let i = 0;
    //     let possibleThumbFile = generateThumbnailFileName(r.id, i)
    //     let nextThumbFile = generateThumbnailFileName(r.id, i+1)
    //     while (fs.fs.existsSync(path.path.join(thumbnailDir, nextThumbFile + ".png"))) {
    //         i++
    //         possibleThumbFile = generateThumbnailFileName(r.id, i)
    //         nextThumbFile = generateThumbnailFileName(r.id, i+1)
    //     } 
    //     if (fs.fs.existsSync(path.path.join(thumbnailDir, possibleThumbFile + ".png"))) {
    //         db.updateThumbnail(r.id, possibleThumbFile)
    //         r.thumbnailId = possibleThumbFile
    //     }
    // })
    rows.forEach(row => {
        if (row.thumbnailId) {
            let newThumbName = getNewThumbnailFileName(row.id)
            // if (fs.fs.existsSync(path.path.join(thumbnailDir, row.thumbnailId + ".png"))) {
            //     generateThumbnail(row, '00:30.000', newThumbName)
            // }
            if (row.thumbnailId !== newThumbName) {
                let currentPath = path.join(thumbnailDir, row.thumbnailId + ".png")
                let newPath = path.join(thumbnailDir, newThumbName + ".png")
                fs.rename(currentPath, newPath, (err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        videoDatabase.updateThumbnail(row.id, newThumbName)
                        console.log("updated thumbnail for video " + row.id + " to " + newThumbName)
                    }
                })
            }
        }
        else {
            rowsWithoutThumb.push(row)
        }
    })

    if (rowsWithoutThumb.length > 0) {
        rowsWithoutThumb.forEach((r) => {
            let possibleThumbFile = generateThumbnailFileName(r.id, 0)
            if (fs.existsSync(path.join(thumbnailDir, possibleThumbFile + ".png"))) {
                videoDatabase.updateThumbnail(r.id, possibleThumbFile)
                r.thumbnailId = possibleThumbFile
            }
        })

        let stillNoThumb = rowsWithoutThumb.filter(r => r.thumbnailId == null)
        stillNoThumb.forEach((r) => {
            generateThumbnail(r)
        })
    }
}

export function removeDuplicates () {
    let rows = videoDatabase.getVideos()
    let groups = []

    rows.forEach(r => {
        let existing = groups.find(g => g.filePath == r.filePath)
        if (existing) {
            existing.items.push(r)
        }
        else {
            groups.push({
                filePath: r.filePath,
                items: [r]
            })
        }
    })

    let duplicateGroups = groups.filter(g => g.items.length > 1)
    duplicateGroups.forEach(g => {
        let thumbnails = g.items.map(i => i.thumbnailId).filter(x => x)
        let definitiveThumbnail = thumbnails ? thumbnails[0] : null

        let pathsegments = g.filePath.split('\\')
        if (pathsegments.length == 2) {
            let correctData = fileToJson(pathsegments[0], pathsegments[1])
            let badData = g.items.filter(i => i.title != correctData.title)
            badData.forEach(d => {
                videoDatabase.deleteVideo(d.id)
            })
            let goodData = g.items.filter(i => i.title == correctData.title)
            let definitiveVideo = goodData[0]
            if (definitiveVideo.thumbnailId !== definitiveThumbnail) {
                videoDatabase.updateThumbnail(definitiveVideo.id, definitiveThumbnail)
            }
            let toDelete = goodData.slice(1)
            toDelete.forEach(d => {
                videoDatabase.deleteVideo(d.id)
            })
        } else {
            console.log(g.filePath)
        }

    })
}

export function removeNoActorVideos () {
    let rows = videoDatabase.getVideos()
    let videos = rows.map(fillVideo)

    let videosWithNoActors = videos.filter(v => v.actors.length < 1)

    let removed = []
    videosWithNoActors.forEach(v => {
        videoDatabase.deleteVideo(v.id)
        removed.push(v)
    })
    return removed
}

export function updateVideo (id, newVideoData, callback) {
    console.log("updating video with id " + id)
    let updateResult = { success: false, errors: "", changes: [] }
    let currentVideoData = fillVideo(videoDatabase.getVideoById(id));
    if (newVideoData.title !== currentVideoData.title) {
        let result = videoDatabase.setVideoTitle(id, newVideoData.title)
        if (result.changes > 0) {
            updateResult.changes.push("title")
        } else {
            updateResult.errors = updateResult.errors + "Updating title failed"
        }
    }
    if (newVideoData.actors && currentVideoData.actors) {
        let actorsToAdd = newVideoData.actors.filter(t => !currentVideoData.actors.some(a => a.id === t.id))
        let actorsToRemove = currentVideoData.actors.filter(t => !newVideoData.actors.some(a => a.id === t.id))

        if (actorsToAdd.length) {
            let addResult = videoDatabase.addActors(id, actorsToAdd.map(a => a.name))
            if (addResult.length === actorsToAdd.length) {
                updateResult.changes.push("added actors")
            } else {
                updateResult.errors = updateResult.errors + "Adding actors failed"
            }
        }
        if (actorsToRemove.length) {
            let removeResult = videoDatabase.removeActors(id, actorsToRemove.map(a => a.name))
            if (removeResult.length === actorsToRemove.length) {
                updateResult.changes.push("removed actors")
            } else {
                updateResult.errors = updateResult.errors + "removing actors failed"
            }
        }
    }
    // if (newVideoData.tags && currentVideoData.tags) {
    //     let tagsToAdd = newVideoData.tags.filter(t => !currentVideoData.tags.includes(t))
    //     let tagsToRemove = currentVideoData.tags.filter(t => !newVideoData.tags.includes(t))

    //     if (tagsToAdd.length) {
    //         let addResult = db.addTags(id, tagsToAdd)
    //         if (addResult.length === tagsToAdd.length) {
    //             response.success = true;
    //         } else {
    //             response.errors = response.errors + "Adding tags failed"
    //         }
    //     } 
    //     if (tagsToRemove.length) {
    //         let removeResult = db.removeTags(id, tagsToRemove)
    //         if (removeResult.length === tagsToRemove.length) {
    //             response.success = true;
    //         } else {
    //             response.errors = response.errors + "Adding tags failed"
    //         }
    //     }
    // }
    if (newVideoData.isFavorite !== currentVideoData.isFavorite) {
        try {
            let favoriteResult = videoDatabase.setVideoFavoriteValue(id, newVideoData.isFavorite)
            if (favoriteResult) updateResult.changes.push("favorite")
        } catch (err) {
            updateResult.errors = updateResult.errors + err.message
        }
    }
    updateResult.success = !updateResult.errors && updateResult.changes.length > 0
    updateResult.video = fillVideo(videoDatabase.getVideoById(id))
    callback(updateResult)
}

export function getSources () {
    return videoDatabase.getAllSources()
}

export function saveSourceImage (sourceId, imageSize, fileType, rawData, callback) {
    const sourceData = videoDatabase.getSourceById(sourceId)
    if (!sourceData) {
        return
    }

    const sourceNameSlug = stripNonAlphanumeric(sourceData.name).toLowerCase()

    let fileNameIndex = 0
    const fileExtenion = mime.getExtension(fileType)
    if (!fileExtenion) {
        console.error(`Unable to get file extension from MIME type: ${fileType}`)
    }
    let fileName = `${sourceNameSlug}_${imageSize}_${fileNameIndex}.${fileExtenion}`
    while (fs.existsSync(path.join(sourceImageDir, fileName))) {
        fileNameIndex++
        fileName = `${sourceNameSlug}_${imageSize}_${fileNameIndex}.${fileExtenion}`
    }

    console.log(`Creating file: ${fileName}`)
    try {
        fs.writeFileSync(path.join(sourceImageDir, fileName), rawData)
    
        if (imageSize === 'small') {
            sourceData.imageFileSmall = fileName
        } else {
            sourceData.imageFileLarge = fileName
        }
        updateSource(sourceId, sourceData, callback)
    } catch (err) {
        logger.error(`saveSourceImage Error: ${err.message}`)
    }
}

export function updateSource (id, newSourceData, callback) {
    let updateResult = { success: false, errors: "", changes: [] }
    const currentSourceData = videoDatabase.getSourceById(id)
    if (newSourceData.imageFileSmall && currentSourceData.imageFileSmall !== newSourceData.imageFileSmall) {
        try {
            videoDatabase.updateSourceImageSmall(id, newSourceData.imageFileSmall)
            updateResult.changes.push('imageFileSmall')
        } catch (err) {
            updateResult.err += `imageFileSmall Update Error: [${err.message}] `
        }
    }
    if (newSourceData.imageFileLarge && currentSourceData.imageFileLarge !== newSourceData.imageFileLarge) {
        try {
            videoDatabase.updateSourceImageLarge(id, newSourceData.imageFileLarge)
            updateResult.changes.push('imageFileLarge')
        } catch (err) {
            updateResult.err += `imageFileLarge Update Error: [${err.message}] `
        }
    }
    if (newSourceData.siteUrl && currentSourceData.siteUrl !== newSourceData.siteUrl) {
        try {
            videoDatabase.updateSourceSiteUrl(id, newSourceData.siteUrl)
            updateResult.changes.push('siteUrl')
        } catch (err) {
            updateResult.err += `siteUrl Update Error: [${err.message}] `
        }
    }
    updateResult.success = !updateResult.errors && updateResult.changes.length > 0
    updateResult.source = videoDatabase.getSourceById(id)
    callback(updateResult)
}

export function getSourceImagePath(id, small) {
    let sourceData = videoDatabase.getSourceById(id)
    if (small && sourceData.imageFileSmall) {
        return path.join(sourceImageDir, sourceData.imageFileSmall)
    } else if (sourceData.imageFileLarge) {
        return path.join(sourceImageDir, sourceData.imageFileLarge)
    }
    return null
}


