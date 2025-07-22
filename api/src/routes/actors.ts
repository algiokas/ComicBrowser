import { Router } from 'express';
var router = Router();
import { getActors, getActor, getActorImagePath, generateImageForActor, updateActor, getAllActorTags } from '../videoRepository';

router.get('/', function (req, res) {
    res.json(getActors())
})

router.get('/tags', function (req, res) {
    res.json(getAllActorTags())
})

router.get('/:actorId', function (req, res) {
    const actorId = Number(req.params.actorId)
    if (isNaN(actorId)) {
        res.status(500).send(`Internal Server Error: parameter actorId must be a number - provided value: ${req.params.actorId}`)
        return
    }
    res.json(getActor(actorId))
})

router.get('/:actorId/image', function (req, res) {
    const actorId = Number(req.params.actorId)
    if (isNaN(actorId)) {
        res.status(500).send(`Internal Server Error: parameter actorId must be a number - provided value: ${req.params.actorId}`)
        return
    }
    let fpath = getActorImagePath(actorId)
    if (fpath) res.sendFile(fpath, {});
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
    generateImageForActor(actorId, req.body.videoId, req.body.timeMs, (imgResult) => {
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
    updateActor(actorId, req.body, (updateResult) => {
        console.log("Updated actor ID:" + req.params.actorId + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

export default router