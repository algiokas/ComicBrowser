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

router.post('/upload/sourceimage/:sourceId/:imageSize', bodyParser.raw({ type: "*/*", limit: "10mb" }), (req, res) => {
    if (!req.body) {
        console.log(`File Upload: Empty Body`)
    }
    console.log(`Uploaded source image - Source: ${req.params.sourceId} - Size: ${req.params.imageSize}`)
    videoRepository.saveSourceImage(req.params.sourceId, req.params.imageSize, req.headers['content-type'], req.body, (updateResult) => {
        console.log("Updated source ID: " + updateResult.source.id + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

router.get('/sources/:sourceId/imagelarge', (req, res) => {
    let fpath = videoRepository.getSourceImagePath(req.params.sourceId, false)
    if (fpath) res.sendFile(fpath, {});
    else {
        res.sendStatus(404).end();
    }
})

router.get('/sources/:sourceId/imagesmall', (req, res) => {
    let fpath = videoRepository.getSourceImagePath(req.params.sourceId, true)
    if (fpath) res.sendFile(fpath, {});
    else {
        res.sendStatus(404).end();
    }
})

router.get('/thumbnail/:videoId', function (req, res) {
    let fpath = videoRepository.getThumbnailFilePath(req.params.videoId)
    if (fpath) res.sendFile(fpath, {});
    else {
        res.sendStatus(404).end();
    }
})

router.post('/thumbnail/:videoId/generate/:timeMs', function (req, res) {
    videoRepository.generateThumbnailExisting(req.params.videoId, req.params.timeMs, (thumbResult) => {
        console.log("Generated thumbnail for video " + req.params.videoId + " at " + req.params.timeMs + "ms")
        res.json(thumbResult)
    })
})

router.get('/audit/renamethumbnails', function (req, res) {
    videoRepository.renameThumbnails()
    res.sendStatus(200).end()
})

router.get('/audit/removeduplicates', (req, res) => {
    videoRepository.removeDuplicates()
    res.sendStatus(200).end()
})

router.get('/audit/removenoactorvideos', (req, res) => {
    let removedVideos = videoRepository.removeNoActorVideos()
    res.json(removedVideos)
})

router.delete('/:videoId', function (req, res) {
    console.log('delete video id: ' + req.params.videoId)
    var deleteResponse = videoRepository.deleteVideo(req.params.videoId)
    res.json(deleteResponse)
})

router.post('/:videoId/update', function (req, res, next) {
    let videoId = parseInt(req.params.videoId)
    console.log('update video id: ' + videoId)
    videoRepository.updateVideo(videoId, req.body, (updateResult) => {
        console.log("Updated video ID:" + videoId + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

router.post('/:sourceId/updatesource', function (req, res, next) {
    let sourceId = parseInt(req.params.sourceId)
    console.log('update source id: ' + videoId)
    videoRepository.updateSource(sourceId, req.body, (updateResult) => {
        console.log("Updated source ID:" + sourceId + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

router.get('/:videoId', function (req, res) {
    console.log("get video ID: " + req.params.videoId)
    let videoData = videoRepository.getVideoFilePath(req.params.videoId)
    if (videoData) {
        const stat = statSync(videoData.path)
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
        const file = createReadStream(videoData.path, { start, end });
        const mimeType = mime.getType(videoData.ext)
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