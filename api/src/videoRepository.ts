import fs from 'fs';
import mime from 'mime';
import path from 'path';
import * as videoDatabase from '../src/database/videoDatabase';
import { Response } from 'express';

import 'dotenv/config';
import { generateImageFromVideo, GenerateThumbnailResult, VideoScreenshotOptions } from './ffmpeg';
import { ActorRow, ClientActor, VideoFileData, ImportVideosResult, ClientVideo, SourceRow, UpdateActorResult, VideoRow, UpdateVideoResult, UpdateSourceResult, ClientSource, VideosTagType } from './types/video';
import { getTimestampString, PLACEHOLDER_SOURCE, stripNonAlphanumeric } from './util';

const dataDir = process.env.VIDEOS_DATA_DIR!
const videosDir = path.join(dataDir, '/videos');
const tagImageDir = path.join(dataDir, '/images/tags')
const thumbnailDir = path.join(dataDir, '/images/thumbnails');
const actorImageDir = path.join(dataDir, '/images/actors')
const sourceImageDir = path.join(dataDir, '/images/sources')

//Import video file with the format:
// ActorName1, ActorName2 - VideoTitle
function fileToJson(parentDir: string, fileName: string, fileStats: fs.Stats): VideoFileData | undefined {
    let output: VideoFileData = {
        filePath: '',
        title: '',
        source: '',
        addedDate: 0,
        actors: []
    }

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
            fileNameWithoutExt = parts.join('.')
        }
        output.fileExt = fileNameAndExt[fileNameAndExt.length - 1]
    }

    if (fileNameWithoutExt.includes('-')) {
        const nameParts = fileNameWithoutExt.split('-')
        const actors = nameParts[0]
        const title = nameParts.slice(1).join('-')

        output.title = title.trim()
        output.actors = []
        actors.split(',').forEach((actor) => output.actors.push(actor.trim()))
    }
    else {
        output.title = fileNameWithoutExt
    }
    output.source = parentDir
    if (fileStats) {
        output.addedDate = fileStats.birthtime.getTime()
    } else {
        output.addedDate = Date.now()
    }
    output.filePath = path.join(parentDir, fileName)
    return output
}

function fillVideo(videoRow: VideoRow): ClientVideo {
    const videoSource = videoDatabase.getSourceById(videoRow.sourceId ?? -1) ?? PLACEHOLDER_SOURCE
    const videoActors = videoDatabase.getVideoActors(videoRow.id)
    const videoTags = videoDatabase.getVideoTags(videoRow.id)
    let video: ClientVideo = {
        ...videoRow,
        title: videoRow.title ?? '',
        thumbnailId: videoRow.thumbnailId ?? '',
        filePath: videoRow.filePath ?? '',
        fileExt: videoRow.fileExt ?? '',
        addedDate: videoRow.addedDate ?? '',
        originalTitle: videoRow.originalTitle ?? '',
        isFavorite: (videoRow.isFavorite !== null && videoRow.isFavorite > 0),
        source: fillSource(videoSource),
        actors: videoActors.map(a => fillActor(a)),
        tags: videoTags
    }
    return video
}

function fillActor(actorRow: ActorRow): ClientActor {
    const actorTags = videoDatabase.getActorTags(actorRow.id)
    return {
        id: actorRow.id,
        name: actorRow.name ?? '',
        imageFile: actorRow.imageFile ?? '',
        imageFallbackVideoId: actorRow.imageFallbackVideoId ?? 0,
        isFavorite: (actorRow.isFavorite ?? 0) > 0,
        birthYear: actorRow.birthYear ?? 1700,
        tags: actorTags
    }
}

function fillSource(sourceRow: SourceRow): ClientSource {
    return {
        id: sourceRow.id,
        imageFileSmall: sourceRow.imageFileSmall ?? '',
        imageFileLarge: sourceRow.imageFileLarge ?? '',
        siteUrl: sourceRow.siteUrl ?? '',
        name: sourceRow.name ?? '',
    }
}

function generateThumbnailFileName(videoId: number, index: number) {
    return "vthumb_" + videoId + "-" + index
}

function getNewThumbnailFileName(videoId: number) {
    var thumbIndex = 0
    var thumbFileName = generateThumbnailFileName(videoId, thumbIndex)
    while (fs.existsSync(path.join(thumbnailDir, thumbFileName + ".png"))) {
        thumbIndex++
        thumbFileName = generateThumbnailFileName(videoId, thumbIndex)
    }
    return thumbFileName
}

export function getThumbnailFilePath(videoId: number) {
    var thumbFile = videoDatabase.getVideoThumbnailById(videoId)
    if (!thumbFile) return null
    return path.join(thumbnailDir, thumbFile + ".png")
}

export function getTagImagePath(tagId: number, tagType: VideosTagType) {
    var tag = videoDatabase.getTagById(tagId, tagType)
    if (tag && tag.imageFile) {
        return path.join(tagImageDir, tag.imageFile + ".png")
    }
}


function generateThumbnail(video: VideoRow | ClientVideo, options: VideoScreenshotOptions, callback?: (result: GenerateThumbnailResult) => void) {
    if (!video.filePath) {
        console.error(`Video ${video.id} - missing filePath`)
        if (callback) callback({ success: false })
        return null
    }
    const videoPath = path.join(videosDir, video.filePath)
    options.timestamp = options.timestamp ?? '00:30.000'
    const thumbFileName = options.outputFileName ?? getNewThumbnailFileName(video.id)
    options.outputFileName = thumbFileName
    options.outputDir = options.outputDir ?? thumbnailDir
    try {
        generateImageFromVideo(videoPath, options, () => {
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

function generateActorImageName(actor: ActorRow, index: number) {
    return `${actor.id}-${actor.name?.replace(' ', '_') ?? 'NO_ACTOR_NAME'}-${index}`
}

function getActorImageName(actor: ActorRow) {
    var imgIndex = 0
    var imgFileName = generateActorImageName(actor, imgIndex)
    while (fs.existsSync(path.join(actorImageDir, imgFileName + ".png"))) {
        imgIndex++
        imgFileName = generateActorImageName(actor, imgIndex)
    }
    return imgFileName
}

function generateActorImage(actor: ActorRow, video: VideoRow, options: VideoScreenshotOptions, callback: (result: GenerateThumbnailResult) => void) {
    if (!video.filePath) {
        console.error(`Video ${video.id} - missing filePath`)
        callback({ success: false })
        return null
    }
    const videoPath = path.join(videosDir, video.filePath)
    const imgFileName = options.outputFileName ?? getActorImageName(actor)
    options.outputFileName = imgFileName
    options.outputDir = options.outputDir ?? actorImageDir
    try {
        generateImageFromVideo(videoPath, options, () => {
            videoDatabase.updateActorImage(actor.id, imgFileName)
            actor.imageFile = imgFileName
            callback({ success: true, actor: actor })
        })
    } catch (err) {
        console.log(err)
        return null
    }
}

function generateTagImageName(tagId: number, tagType: VideosTagType, index: number) {
    return `${tagType}Tag_${tagId}_${index}`
}

function getTagImageName(tagId: number, tagType: VideosTagType) {
    var imgIndex = 0
    var fname = generateTagImageName(tagId, tagType, imgIndex)
    while (fs.existsSync(path.join(tagImageDir, fname + '.png'))) {
        imgIndex++
        fname = generateTagImageName(tagId, tagType, imgIndex)
    }
    return fname
}

function generateTagImage(tagId: number, tagType: VideosTagType, tagName: string, video: VideoRow, options: VideoScreenshotOptions, callback: (result: GenerateThumbnailResult) => void) {
    if (!video.filePath) {
        console.error(`Video ${video.id} - missing filePath`)
        callback({ success: false })
        return null
    }
    const videoPath = path.join(videosDir, video.filePath)
    const imgFileName = options.outputFileName ?? getTagImageName(tagId, tagType)
    options.outputFileName = imgFileName
    options.outputDir = options.outputDir ?? tagImageDir
    try {
        generateImageFromVideo(videoPath, options, () => {
            videoDatabase.setTagImageFile(tagId, imgFileName, tagType)
            let result: GenerateThumbnailResult = { success: true }
            const resultTag = { id: tagId, name: tagName, imageFile: imgFileName }
            if (tagType === 'video') result.videoTag = resultTag
            else result.actorTag = resultTag
            
            callback(result)
        })
    } catch (err) {
        console.log(err)
        return null
    }
}

export function generateImageForTag(tagId: number, tagType: VideosTagType, videoId: number, timeMs: string, callback: (result: GenerateThumbnailResult) => void) {
    const video = videoDatabase.getVideoById(videoId)
    const tag = videoDatabase.getTagById(tagId, tagType)
    if (video && tag) {
        let ts = getTimestampString(timeMs)
        generateTagImage(tagId, tagType, tag.name ?? '', video, { timestamp: ts }, callback)
    }
}

export function generateThumbnailExisting(videoId: number, timeMs: string, callback: (result: GenerateThumbnailResult) => void) {
    let video = videoDatabase.getVideoById(videoId)
    if (video) {
        let ts = getTimestampString(timeMs)
        generateThumbnail(video, { timestamp: ts }, callback)
    }
    else {
        callback({ success: false })
    }
}

export function generateImageForActor(actorId: number, videoId: number, timeMs: string, callback: (result: GenerateThumbnailResult) => void) {
    const video = videoDatabase.getVideoById(videoId)
    const actor = videoDatabase.getActorById(actorId)
    if (actor && video) {
        let timestamp = getTimestampString(timeMs)
        generateActorImage(actor, video, { timestamp: timestamp }, callback)
    } else {
        callback({ success: false })
    }
}

export function updateActor(actorId: number, newActorData: Partial<ClientActor>, callback: (result: UpdateActorResult) => void): void {
    console.log("updating video with id " + actorId)
    let updateResult: UpdateActorResult = { success: false, error: "", changes: [] }
    let actorRow = videoDatabase.getActorById(actorId);
    if (!actorRow) {
        updateResult.error = `Could not find actor with ID: ${actorId}`
        return callback(updateResult)
    }

    const currentActorData = fillActor(actorRow)
    if (newActorData.name && newActorData.name !== currentActorData.name) {
        let setActorResult = videoDatabase.setActorName(actorId, newActorData.name)
        if (setActorResult.changes > 0) {
            updateResult.changes.push("name")
        } else {
            updateResult.error = updateResult.error + "Updating name failed"
        }
    }
    if (newActorData.isFavorite !== undefined && newActorData.isFavorite != currentActorData.isFavorite) {
        let setFavoriteResult = videoDatabase.setFavorite(actorId, newActorData.isFavorite ?? false)
        if (setFavoriteResult.changes > 0) {
            updateResult.changes.push("favorite")
        } else {
            updateResult.error = updateResult.error + "Updating favorite value failed"
        }
    }
    if (newActorData.birthYear !== undefined && newActorData.birthYear !== currentActorData.birthYear) {
        let setBirthYearResult = videoDatabase.setBirthYear(actorId, newActorData.birthYear)
        if (setBirthYearResult.changes > 0) {
            updateResult.changes.push("birthYear")
        } else {
            updateResult.error = updateResult.error + "Updating birth year failed"
        }
    }
    if (newActorData.tags && currentActorData.tags) {
        let tagsToAdd = newActorData.tags.filter(t => !currentActorData.tags.some(a => a.name === t.name))
        let tagsToRemove = currentActorData.tags.filter(t => !(newActorData.tags!).some(a => a.name === t.name))

        if (tagsToAdd.length) {
            let addResult = videoDatabase.insertTagsForActor(actorId, tagsToAdd.map(t => t.name!))
            if (addResult.length === tagsToAdd.length) {
                updateResult.changes.push(`Added ${addResult.length} tags`)
            } else {
                if (addResult.length > 0) {
                    updateResult.error += `Add tags partial success - added (${addResult.length}/${tagsToAdd.length}) tags`
                } else {
                    updateResult.error += "Adding tags failed"
                }
            }
        } 
        if (tagsToRemove.length) {
            let removeResult = videoDatabase.removeTagsFromActor(actorId, tagsToRemove.map(t => t.name!))
            if (removeResult.length === tagsToRemove.length) {
                updateResult.changes.push(`Removed ${removeResult.length} tags`)
            } else {
                if (removeResult.length > 0) {
                    updateResult.error += `Remove tags partial success - removed (${removeResult.length}/${tagsToRemove.length}) tags`
                } else {
                    updateResult.error += "Removing tags failed"
                }
            }
        }
    }
    updateResult.success = !updateResult.error && updateResult.changes.length > 0
    updateResult.actor = videoDatabase.getActorById(actorId)
    callback(updateResult)
}

export function importVideos(res: Response<any, Record<string, any>>, callback: (res: Response<any, Record<string, any>>, importResult: ImportVideosResult) => void) {
    let count = 0;
    fs.readdir(videosDir, function (err, subDirs) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        const videoData: VideoFileData[] = []
        subDirs.forEach((dir) => {
            let subDirPath = path.join(videosDir, dir);
            let dirStats = fs.statSync(subDirPath)
            if (dirStats.isDirectory()) {
                try {
                    const files = fs.readdirSync(subDirPath);
                    files.forEach((file) => {
                        let filePath = path.join(subDirPath, file)
                        let fileStats = fs.statSync(filePath)
                        const fileJson = fileToJson(dir, file, fileStats)
                        if (fileJson) videoData.push(fileJson)
                    });
                } catch (err) {
                    return { error: err }
                }
            }
        })

        let allVideos: ClientVideo[] = [];
        videoData.forEach(async (video) => {
            let addResult = videoDatabase.addVideo(video)
            if (addResult) {
                if (addResult.lastInsertRowid) {
                    const vId = Number(addResult.lastInsertRowid)
                    const possibleThumbFile = generateThumbnailFileName(vId, 0)
                    const thumbFileName = `${possibleThumbFile}.png`
                    const thumbFilePath = path.join(thumbnailDir, thumbFileName)

                    const videoSource = videoDatabase.getSourceByName(video.source)

                    const v: VideoRow = {
                        id: Number(addResult.lastInsertRowid),
                        title: video.title,
                        filePath: video.filePath,
                        fileExt: video.fileExt ?? '',
                        thumbnailId: thumbFileName,
                        addedDate: (new Date(video.addedDate)).toISOString(),
                        isFavorite: 0,
                        originalTitle: video.title,
                        sourceId: videoSource?.id ?? null
                    }

                    if (!fs.existsSync(thumbFilePath)) {
                        generateThumbnail(v, { outputDir: thumbnailDir, outputFileName: thumbFileName })
                    } else {
                        videoDatabase.updateThumbnail(vId, possibleThumbFile)
                    }

                    allVideos.push(fillVideo(v))
                    count++
                }
                else if (addResult.existingRowId) {
                    const videoRow = videoDatabase.getVideoById(addResult.existingRowId)
                    if (videoRow) {
                        allVideos.push(fillVideo(videoRow))
                    }

                }
            }
        })
        callback(res, { success: true, videos: allVideos, importCount: count })
    })
}

export function getVideos() {
    console.log("Get All Videos")
    let rows = videoDatabase.getVideos()
    if (!rows || rows.length < 1) {
        console.log("no videos found")
        return rows
    }
    let videos: ClientVideo[] = []
    rows.forEach(row => {
        videos.push(fillVideo(row))
    });
    return videos
}

export function getVideoFilePath(videoId: number): string | null {
    let video = videoDatabase.getVideoById(videoId)
    if (!video?.filePath) return null
    return path.join(videosDir, video.filePath)
}

export function getActor(actorId: number) {
    return videoDatabase.getActorById(actorId)
}

export function getActors() {
    console.log("Get All Actors")
    let rows = videoDatabase.getAllActors()
    if (!rows || rows.length < 1) {
        console.log("no videos found")
        return rows
    }
    let actors: ClientActor[] = []
    rows.forEach(row => {
        actors.push(fillActor(row))
    });
    return actors
}

export function getActorImagePath(actorId: number) {
    let actor = videoDatabase.getActorById(actorId)
    if (actor && actor.imageFile) {
        return path.join(actorImageDir, actor.imageFile + ".png")
    }
    return null
}

export function deleteVideo(videoId: number) {
    return videoDatabase.deleteVideo(videoId)
}

export function updateVideo(id: number, newVideoData: ClientVideo, callback: (updateResult: UpdateVideoResult) => void) {
    console.log("updating video with id " + id)
    let updateResult: UpdateVideoResult = { success: false, error: "", changes: [] }
    const existingVideo = videoDatabase.getVideoById(id);
    if (!existingVideo) {
        updateResult.error = `Unable to find video with ID: ${id}`
        return callback(updateResult)
    }

    let currentVideoData = fillVideo(existingVideo);
    if (newVideoData.title !== currentVideoData.title) {
        let result = videoDatabase.setVideoTitle(id, newVideoData.title)
        if (result.changes > 0) {
            updateResult.changes.push("title")
        } else {
            updateResult.error = updateResult.error + "Updating title failed"
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
                updateResult.error = updateResult.error + "Adding actors failed"
            }
        }
        if (actorsToRemove.length) {
            let removeResult = videoDatabase.removeActors(id, actorsToRemove.map(a => a.name))
            if (removeResult.length === actorsToRemove.length) {
                updateResult.changes.push("removed actors")
            } else {
                updateResult.error = updateResult.error + "removing actors failed"
            }
        }
    }
    if (newVideoData.tags && currentVideoData.tags) {
        let tagsToAdd = newVideoData.tags.filter(t => !currentVideoData.tags.some(a => a.name === t.name))
        let tagsToRemove = currentVideoData.tags.filter(t => !newVideoData.tags.some(a => a.name === t.name))

        if (tagsToAdd.length) {
            let addResult = videoDatabase.insertTagsForVideo(id, tagsToAdd.map(t => t.name!))
            if (addResult.length === tagsToAdd.length) {
                updateResult.changes.push(`Added ${addResult.length} tags`)
            } else {
                if (addResult.length > 0) {
                    updateResult.error += `Add tags partial success - added (${addResult.length}/${tagsToAdd.length}) tags`
                } else {
                    updateResult.error += "Adding tags failed"
                }
            }
        } 
        if (tagsToRemove.length) {
            let removeResult = videoDatabase.removeTagsFromVideo(id, tagsToRemove.map(t => t.name!))
            if (removeResult.length === tagsToRemove.length) {
                updateResult.changes.push(`Removed ${removeResult.length} tags`)
            } else {
                if (removeResult.length > 0) {
                    updateResult.error += `Remove tags partial success - removed (${removeResult.length}/${tagsToRemove.length}) tags`
                } else {
                    updateResult.error += "Removing tags failed"
                }
            }
        }
    }
    if (newVideoData.isFavorite !== currentVideoData.isFavorite) {
        try {
            let favoriteResult = videoDatabase.setVideoFavoriteValue(id, newVideoData.isFavorite)
            if (favoriteResult) updateResult.changes.push("favorite")
        } catch (err: any) {
            updateResult.error = updateResult.error + err.message
        }
    }
    updateResult.success = !updateResult.error && updateResult.changes.length > 0

    const updatedVideoRow = videoDatabase.getVideoById(id)
    if (!updatedVideoRow) {
        updateResult.success = false
        return callback(updateResult)
    }
    updateResult.video = fillVideo(updatedVideoRow)
    callback(updateResult)
}

export function getSources() {
    return videoDatabase.getAllSources()
}

export function saveSourceImage(sourceId: number, imageSize: "small" | "large", fileType: string, rawData: any, callback: (updateResult: UpdateSourceResult) => void) {
    const sourceData = videoDatabase.getSourceById(sourceId)
    if (!sourceData || !sourceData.name) {
        return callback({ success: false, changes: [], error: `No source found with ID: ${sourceId}` })
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
        updateSource(sourceId, fillSource(sourceData), callback)
    } catch (err: any) {
        return callback({ success: false, changes: [], error: err.message })
    }
}

export function updateSource(id: number, newSourceData: ClientSource, callback: (updateResult: UpdateSourceResult) => void) {
    let updateResult: UpdateSourceResult = { success: false, error: "", changes: [] }
    const currentSourceData = videoDatabase.getSourceById(id)
    if (!currentSourceData) {
        updateResult.error = `No source found with ID: ${id}`
        return callback(updateResult)
    }

    if (newSourceData.imageFileSmall && currentSourceData.imageFileSmall !== newSourceData.imageFileSmall) {
        try {
            videoDatabase.updateSourceImageSmall(id, newSourceData.imageFileSmall)
            updateResult.changes.push('imageFileSmall')
        } catch (err: any) {
            updateResult.error += `imageFileSmall Update Error: [${err.message}] `
        }
    }
    if (newSourceData.imageFileLarge && currentSourceData.imageFileLarge !== newSourceData.imageFileLarge) {
        try {
            videoDatabase.updateSourceImageLarge(id, newSourceData.imageFileLarge)
            updateResult.changes.push('imageFileLarge')
        } catch (err: any) {
            updateResult.error += `imageFileLarge Update Error: [${err.message}] `
        }
    }
    if (newSourceData.siteUrl && currentSourceData.siteUrl !== newSourceData.siteUrl) {
        try {
            videoDatabase.updateSourceSiteUrl(id, newSourceData.siteUrl)
            updateResult.changes.push('siteUrl')
        } catch (err: any) {
            updateResult.error += `siteUrl Update Error: [${err.message}] `
        }
    }
    updateResult.success = !updateResult.error && updateResult.changes.length > 0
    const updatedSource = videoDatabase.getSourceById(id)
    if (!updatedSource) {
        updateResult.error = `No source found with ID: ${id}`
        return callback(updateResult)
    }

    updateResult.source = fillSource(updatedSource)
    callback(updateResult)
}

export function getSourceImagePath(id: number, small: boolean) {
    const sourceData = videoDatabase.getSourceById(id)
    if (!sourceData) return null

    if (small && sourceData.imageFileSmall) {
        return path.join(sourceImageDir, sourceData.imageFileSmall)
    } else if (sourceData.imageFileLarge) {
        return path.join(sourceImageDir, sourceData.imageFileLarge)
    }
    return null
}

export function getAllVideoTags() {
    return videoDatabase.getAllVideoTags()
}

export function getAllActorTags() {
    return videoDatabase.getAllActorTags()
}

const DEFAULT_THUMBNAIL_TAG = 'Default Thumbnail'

export function setDefaultThumbnailTag() {
    console.log("Get All Videos")
    let rows = videoDatabase.getVideos()
    let videosUpdated = 0
    if (rows && rows.length > 0) {
        for (const v of rows) {
            if (v.thumbnailId?.endsWith('-0')) {
                const addedTags = videoDatabase.insertTagsForVideo(v.id, [ DEFAULT_THUMBNAIL_TAG ])
                if (addedTags.length > 0) videosUpdated++
            }
        }
    }
    return videosUpdated
}

export function removeDefaultThumbnailTag(videoId: number) {
    const videoTags = videoDatabase.getVideoTags(videoId)
    if (videoTags.some(t => t.name === DEFAULT_THUMBNAIL_TAG)) {
        videoDatabase.removeTagsFromVideo(videoId, [ DEFAULT_THUMBNAIL_TAG ])
    }
}
