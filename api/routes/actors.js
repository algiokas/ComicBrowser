var express = require('express');
var router = express.Router();
const videoRepo = require('../src/videoRepository')

router.get('/', function (req, res) {
    res.json(videoRepo.getActors())
})

router.get('/:actorId', function (req, res) {
    res.json(videoRepo.getActor(req.params.actorId))
})

router.get('/:actorId/image', function (req, res) {
    let fpath = videoRepo.getActorImagePath(req.params.actorId)
    if (fpath) res.sendFile(fpath, {});
    else {
        res.sendStatus(404).end();
    }
})

router.post('/:actorId/imagefromvideo', function (req, res) {
    videoRepo.generateImageForActor(req.params.actorId, req.body.videoId, req.body.timeMs, (imgResult) => {
        console.log("Generated image for actor " + req.params.actorId + " from video " + req.body.videoId + " @" + req.body.timeMs + "ms")
        res.json(imgResult)
    })
})

router.post('/:actorId/update', function (req, res) {
    console.log('update actor id: ' + req.params.actorId)
    videoRepo.updateActor(req.params.actorId, req.body, (updateResult) => {
        console.log("Updated actor ID:" + req.params.actorId + " made " + updateResult.changes + " changes")
        res.json(updateResult)
    })
})

module.exports = router