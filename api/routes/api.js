import { Router } from 'express';
var router = Router({mergeParams:true});
import booksRouter from './books.js';
import actorsRouter from './actors.js';
import videosRouter from './videos.js';

router.get('/', function (req, res, next) {
  res.send("API Root");
});

router.use("/books", booksRouter)
router.use("/actors", actorsRouter)
router.use("/videos", videosRouter)

export default router;


