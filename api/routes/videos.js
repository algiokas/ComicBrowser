var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');
const videoRepo = require('../src/videoRepository')

router.get('/', function (req, res, next) {
    let videos = videoRepo.getVideos()
    res.json(videos)
});

router.get('/import', function (req, res, next) {
    videoRepo.importVideos(res, (res, importResult) => {
        console.log("imported " + importResult.importCount + " videos")
        res.json(importResult)
    })
});

router.get('/sources', (req, res) => {
    res.json(videoRepo.getSources())
})

router.get('/thumbnail/:videoId', function (req, res) {
    let fpath = videoRepo.getThumbnailFilePath(req.params.videoId)
    if (fpath) res.sendFile(fpath, {});
    else {
        res.sendStatus(404).end();
    }
})

router.post('/thumbnail/:videoId/generate/:timeMs', function (req, res) {
    videoRepo.generateThumbnailExisting(req.params.videoId, req.params.timeMs, (thumbResult) => {
        console.log("Generated thumbnail for video " + req.params.videoId + " at " + req.params.timeMs + "ms")
        res.json(thumbResult)
    })
})

router.get('/audit/renamethumbnails', function (req, res) {
    videoRepo.renameThumbnails()
    res.sendStatus(200).end()
})

router.get('/audit/removeduplicates', (req, res) => {
    videoRepo.removeDuplicates()
    res.sendStatus(200).end()
})

router.get('/audit/removenoactorvideos', (req, res) => {
    let removedVideos = videoRepo.removeNoActorVideos()
    res.json(removedVideos)
})

router.delete('/:videoId', function (req, res) {
    console.log('delete video id: ' + req.params.videoId)
    var deleteResponse = videoRepo.deleteVideo(req.params.videoId)
    res.json(deleteResponse)
})

router.post('/:videoId/update', function (req, res, next) {
    let videoId = parseInt(req.params.videoId)
    console.log('update video id: ' + videoId)
    videoRepo.updateVideo(videoId, req.body, (updateResult) => {
        console.log("Updated video ID:" + videoId + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

router.get('/:videoId', function (req, res) {
    console.log("get video ID: " + req.params.videoId)
    let videoData = videoRepo.getVideoFilePath(req.params.videoId)
    if (videoData) {
        const stat = fs.statSync(videoData.path)
        const fileSize = stat.size
        const range = req.headers.range
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;
            const file = fs.createReadStream(videoData.path, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/' + videoData.ext,
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/' + videoData.ext,
            };

            res.writeHead(200, head);
            fs.createReadStream(videoData.path).pipe(res);
        }
    }
    else {
        res.sendStatus(404).end();
    }
})

module.exports = router