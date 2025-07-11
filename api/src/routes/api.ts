import { Router } from 'express';
var router = Router({mergeParams:true});
import booksRouter from './books';
import actorsRouter from './actors';
import videosRouter from './videos';

router.get('/', function (req, res, next) {
  res.send("API Root");
});

//router.use("/books", booksRouter)
router.use("/actors", actorsRouter)
router.use("/videos", videosRouter)

export default router;


