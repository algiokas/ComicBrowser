import bodyParser from 'body-parser';
import { Router, Response, Request } from 'express';
import { createReadStream, statSync } from 'fs';
import mime from 'mime';
import * as videoRepository from "../videoRepository";
import { ImportVideosResult } from '../types/video';
const router = Router();

router.get('/', function (req, res, next) {
    let videos = videoRepository.getVideos()
    res.json(videos)
});

router.get('/import', (req: any, res: Response<any, Record<string, any>>, next) => {
    videoRepository.importVideos(res, (res: Response<any, Record<string, any>>, importResult: ImportVideosResult) => {
        console.log("imported " + importResult.importCount + " videos")
        res.json(importResult)
    })
});

router.get('/sources', (req, res) => {
    res.json(videoRepository.getSources())
})


router.get(`/tags`, function (req, res) {
    res.json(videoRepository.getAllVideoTags())
})

router.post('/upload/sourceimage/:sourceId/:imageSize', bodyParser.raw({ type: "*/*", limit: "10mb" }), (req, res) => {
    const sourceId = Number(req.params.sourceId)
    if (isNaN(sourceId)) {
        res.status(500).send(`Internal Server Error: parameter sourceId must be a number - provided value: ${req.params.sourceId}`)
        return
    }
    if (!req.body) {
        res.status(500).send(`File Upload: Empty Body`)
        return
    }
    if (!(req.params.imageSize === 'small' || req.params.imageSize === 'large')) {
        res.status(500).send(`Internal Server Error: parameter imageSize must be one of "small" or "large - provided value: ${req.params.sourceId}`)
        return
    }
    if (!req.headers['content-type']) {
        res.status(500).send(`Internal Server Error: header "content-type" required`)
        return
    }
    console.log(`Uploaded source image - Source: ${sourceId} - Size: ${req.params.imageSize}`)
    videoRepository.saveSourceImage(sourceId, req.params.imageSize, req.headers['content-type'], req.body, (updateResult) => {
        if (updateResult.success && updateResult.source) {
            console.log("Updated source ID: " + updateResult.source.id + " made " + updateResult.changes + " changes")
        }    
        res.json(updateResult)
    })
})

router.get('/sources/:sourceId/imagelarge', (req, res) => {
    const sourceId = Number(req.params.sourceId)
    if (isNaN(sourceId)) {
        res.status(500).send(`Internal Server Error: parameter sourceId must be a number - provided value: ${req.params.sourceId}`)
        return
    }

    let fpath = videoRepository.getSourceImagePath(sourceId, false)
    if (fpath) res.sendFile(fpath, {});
    else {
        res.sendStatus(404).end();
    }
})

router.get('/sources/:sourceId/imagesmall', (req, res) => {
    const sourceId = Number(req.params.sourceId)
    if (isNaN(sourceId)) {
        res.status(500).send(`Internal Server Error: parameter sourceId must be a number - provided value: ${req.params.sourceId}`)
        return
    }

    let fpath = videoRepository.getSourceImagePath(sourceId, true)
    if (fpath) res.sendFile(fpath, {});
    else {
        res.sendStatus(404).end();
    }
})

router.get('/thumbnail/:videoId', function (req, res) {
    const videoId = Number(req.params.videoId)
    if (isNaN(videoId)) {
        res.status(500).send(`Internal Server Error: parameter videoId must be a number - provided value: ${req.params.videoId}`)
        return
    }

    let fpath = videoRepository.getThumbnailFilePath(videoId)
    if (fpath) res.sendFile(fpath, {});
    else {
        res.sendStatus(404).end();
    }
})

router.post('/thumbnail/:videoId/generate/:timeMs', function (req, res) {
    const videoId = Number(req.params.videoId)
    if (isNaN(videoId)) {
        res.status(500).send(`Internal Server Error: parameter videoId must be a number - provided value: ${req.params.videoId}`)
    }
    videoRepository.generateThumbnailExisting(videoId, req.params.timeMs, (thumbResult) => {
        console.log("Generated thumbnail for video " + req.params.videoId + " at " + req.params.timeMs + "ms")
        res.json(thumbResult)
    })
})

router.delete('/:videoId', function (req, res) {
    const videoId = Number(req.params.videoId)
    if (isNaN(videoId)) {
        res.status(500).send(`Internal Server Error: parameter videoId must be a number - provided value: ${req.params.videoId}`)
    }
    console.log('delete video id: ' + req.params.videoId)
    var deleteResponse = videoRepository.deleteVideo(videoId)
    res.json(deleteResponse)
})

router.post('/:videoId/update', function (req, res, next) {
    const videoId = Number(req.params.videoId)
    if (isNaN(videoId)) {
        res.status(500).send(`Internal Server Error: parameter videoId must be a number - provided value: ${req.params.videoId}`)
    }
    console.log('update video id: ' + videoId)
    videoRepository.updateVideo(videoId, req.body, (updateResult) => {
        console.log("Updated video ID:" + videoId + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

router.post('/:sourceId/updatesource', function (req, res, next) {
    const sourceId = Number(req.params.sourceId)
    if (isNaN(sourceId)) {
        res.status(500).send(`Internal Server Error: parameter sourceId must be a number - provided value: ${req.params.sourceId}`)
    }
    console.log('update source id: ' + sourceId)
    videoRepository.updateSource(sourceId, req.body, (updateResult) => {
        console.log("Updated source ID:" + sourceId + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

router.get('/:videoId', function (req, res) {
    const videoId = Number(req.params.videoId)
    if (isNaN(videoId)) {
        res.status(500).send(`Internal Server Error: parameter videoId must be a number - provided value: ${req.params.videoId}`)
    }
    console.log("get video ID: " + req.params.videoId)
    let videoPath = videoRepository.getVideoFilePath(videoId)
    if (videoPath) {
        const stat = statSync(videoPath)
        const fileSize = stat.size
        const range = req.headers.range
        let start = 0
        let end = fileSize - 1;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            start = parseInt(parts[0], 10);
            end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        }
        const chunkSize = end - start + 1;
        const file = createReadStream(videoPath, { start, end });
        const mimeType = mime.getType(videoPath) ?? 'video/mp4'
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': mimeType,
        };

        res.writeHead(206, head);
        file.pipe(res);
    }
    else {
        res.sendStatus(404).end();
    }
})

export default router