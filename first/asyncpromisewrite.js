const fs = require('fs');

fs.writeFile('./write.txt', '텍스트 파일 작성', (err) => {
  if (err) {
    throw err;
  }
  fs.readFile('./write.txt', (err, data) => {
    if (err) {
      throw err;
    }
    console.log(data.toString());
  });
});
