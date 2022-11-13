const express = require('express');

const router = express.Router();

// GET / 라우터
router.get('/', (req, res, next) => {
  console.log('첫번째 라우터');
  next('route');
}, function(req, res, next){
  console.log('실행되지 않음');
});

router.get('/', (req, res, next) => {
  console.log('두번째 라우터');
  res.send('두번째 라우터 처리 부분을 실행');
});

module.exports = router;