var eventHandler = function(){
	console.log("이벤트 강제 발생");
};
process.addListener('test', eventHandler);
process.emit('test');
