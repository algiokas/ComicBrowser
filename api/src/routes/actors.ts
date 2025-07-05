import { Router } from 'express';
var router = Router();
import { getActors, getActor, getActorImagePath, generateImageForActor, updateActor } from '../videoRepository';

router.get('/', function (req, res) {
    res.json(getActors())
})

router.get('/:actorId', function (req, res) {
    res.json(getActor(req.params.actorId))
})

router.get('/:actorId/image', function (req, res) {
    let fpath = getActorImagePath(req.params.actorId)
    if (fpath) res.sendFile(fpath, {});
    else {
        res.sendStatus(404).end();
    }
})

router.post('/:actorId/imagefromvideo', function (req, res) {
    generateImageForActor(req.params.actorId, req.body.videoId, req.body.timeMs, (imgResult) => {
        console.log("Generated image for actor " + req.params.actorId + " from video " + req.body.videoId + " @" + req.body.timeMs + "ms")
        res.json(imgResult)
    })
})

router.post('/:actorId/update', function (req, res) {
    console.log('update actor id: ' + req.params.actorId)
    updateActor(req.params.actorId, req.body, (updateResult) => {
        console.log("Updated actor ID:" + req.params.actorId + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

export default router