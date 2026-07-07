import { Router } from 'express';
var router = Router({mergeParams:true});
import booksRouter from './books.ts';
import actorsRouter from './actors.ts';
import videosRouter from './videos.ts';

router.get('/', function (req, res, next) {
  res.send("API Root");
});

router.use("/books", booksRouter)
router.use("/actors", actorsRouter)
router.use("/videos", videosRouter)

export default router;


