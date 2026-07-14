import { Router } from 'express';
var router = Router();
import * as videoRepository from '../videoRepository.ts';
import * as ffmpeg from '../ffmpeg.ts';
import { sendImageFile } from './sendImage.ts';

router.get('/', function (req, res) {
    res.json(videoRepository.getActors())
})

router.get('/tags', function (req, res) {
    res.json(videoRepository.getAllActorTags())
})

router.get('/:actorId', function (req, res) {
    const actorId = Number(req.params.actorId)
    if (isNaN(actorId)) {
        res.status(500).send(`Internal Server Error: parameter actorId must be a number - provided value: ${req.params.actorId}`)
        return
    }
    res.json(videoRepository.getActor(actorId))
})

router.get('/:actorId/image', function (req, res) {
    const actorId = Number(req.params.actorId)
    if (isNaN(actorId)) {
        res.status(500).send(`Internal Server Error: parameter actorId must be a number - provided value: ${req.params.actorId}`)
        return
    }
    let fpath = videoRepository.getActorImagePath(actorId)
    if (fpath) sendImageFile(res, fpath);
    else {
        res.sendStatus(404).end();
    }
})

router.post('/:actorId/imagefromvideo', function (req, res) {
    const actorId = Number(req.params.actorId)
    if (isNaN(actorId)) {
        res.status(500).send(`Internal Server Error: parameter actorId must be a number - provided value: ${req.params.actorId}`)
        return
    }
    videoRepository.generateImageForActor(actorId, req.body.videoId, req.body.timeMs, (imgResult: ffmpeg.GenerateThumbnailResult) => {
        console.log("Generated image for actor " + req.params.actorId + " from video " + req.body.videoId + " @" + req.body.timeMs + "ms")
        res.json(imgResult)
    })
})

router.post('/:actorId/update', function (req, res) {
    const actorId = Number(req.params.actorId)
    if (isNaN(actorId)) {
        res.status(500).send(`Internal Server Error: parameter actorId must be a number - provided value: ${req.params.actorId}`)
        return
    }
    console.log('update actor id: ' + req.params.actorId)
    videoRepository.updateActor(actorId, req.body, (updateResult) => {
        console.log("Updated actor ID:" + req.params.actorId + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

export default router