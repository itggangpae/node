const fs = require('fs');

fs.access('./adam', fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, (err) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.log('디렉토리 없음');
      fs.mkdir('./adam', (err) => {
        if (err) {
          throw err;
        }
        console.log('디렉토리 만들기 성공');
        fs.open('./adam/file.js', 'w', (err, fd) => {
          if (err) {
            throw err;
          }
          console.log('빈 파일 만들기 성공', fd);
          fs.rename('./adam/file.js', './adam/newfile.js', (err) => {
            if (err) {
              throw err;
            }
            console.log('이름 바꾸기 성공');
          });
        });
      });
    } else {
      throw err;
    }
  } else {
    console.log('이미 디렉토리 있음');
  }
});
