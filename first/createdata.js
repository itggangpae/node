const fs = require('fs');
//파일 생성
const file = fs.createWriteStream('./data.txt');

for (let i = 0; i <= 10000000; i++) {
  file.write('용량이 큰 파일 만들기\n');
}
file.end();
