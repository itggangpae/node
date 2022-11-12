const fs = require('fs');

console.log('before: ', process.memoryUsage().rss);

const data1 = fs.readFileSync('./data.txt');
fs.writeFileSync('./nostreamdata.txt', data1);
console.log('buffer: ', process.memoryUsage().rss);
