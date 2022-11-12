const {
    Worker, isMainThread, parentPort,
  } = require('worker_threads');
  
  //메인 스레드 라면
  if (isMainThread) {
    const worker = new Worker(__filename);
    worker.on('message', message => console.log('from worker', message));
    worker.on('exit', () => console.log('worker exit'));
    worker.postMessage('ping');
  } 
  //워커 스레드인 경우
  else { 
    parentPort.on('message', (value) => {
      console.log('from parent', value);
      parentPort.postMessage('pong');
      parentPort.close();
    });
}