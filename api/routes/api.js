var express = require('express');
var router = express.Router({mergeParams:true});
const booksRouter = require('./books')
const actorsRouter = require('./actors')
const videosRouter = require('./videos')

router.get('/', function (req, res, next) {
  res.send("API Root");
});

router.use("/books", booksRouter)
router.use("/actors", actorsRouter)
router.use("/videos", videosRouter)

module.exports = router;


