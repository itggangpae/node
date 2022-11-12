const fs = require('fs');

const readStream = fs.createReadStream('test.txt');
const writeStream = fs.createWriteStream('write.txt');
readStream.pipe(writeStream);
