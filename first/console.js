const nickname = 'adam';
const age = 26;
const aespa = {
  member: {
    karina: {
        nationality: 'korea',
        age: 23
    },
    giselle: {
        nationality: 'japan',
        age: 23
    },
    winter: {
        nationality: 'korea',
        age: 22
    },
    ningning: {
        nationality: 'china',
        age: 21
    },
  },
}; 

console.time('전체시간');
console.log('일반적인 로그를 출력하는 함수로 자주 사용되는 함수이며 쉼표로 여러 개의 로그 출력이 가능');
console.log(nickname, age);

console.table([{ name: 'adam', birth: 1997 }, { name: 'rusia', birth: 1998}]);

console.dir(aespa, { colors: false, depth: 2 });
console.dir(aespa, { colors: true, depth: 1 });

console.time('시간측정');
for (let i = 0; i < 100000; i++) {}
console.timeEnd('시간측정');

function b() {
    console.trace('에러 위치 추적');
  }
  
  function a() {
    b();
  }
  
  a();
  
  console.timeEnd('전체시간');