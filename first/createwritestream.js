const fs = require('fs');
const writeStream = fs.createWriteStream('./sample.txt');
writeStream.on ('finish ', () => {
    console.log('파일 쓰기 성공'); 
});
writeStream.write('파일에 기록')
writeStream.write('파일에 한번 더 기록')
writeStream.end();
