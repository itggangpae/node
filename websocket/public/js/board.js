let ctx;
let socket;

window.addEventListener("load", (e) => {
    socket = io.connect('http://' + window.location.host);

    let canvas = document.getElementById("cv");

    ctx = canvas.getContext('2d');

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.beginPath();

    let drawing = false;
    canvas.addEventListener('mousedown', draw.start);

    canvas.addEventListener('mousemove', draw.move);

    canvas.addEventListener('mouseup', draw.end);

    shape.setShape();

    let clear = document.getElementById("clear");
    clear.addEventListener('click', draw.clear);

    //색상 배열
    var color_map = [{
            'value': 'white',
            'name': '하얀색'
        },
        {
            'value': 'red',
            'name': '빨간색'
        },
        {
            'value': 'orange',
            'name': '주황색'
        },
        {
            'value': 'yellow',
            'name': '노란색'
        },
        {
            'value': 'blue',
            'name': '파랑색'
        },
        {
            'value': 'black',
            'name': '검은색'
        }
    ];

    let pen_color = document.getElementById("pen_color");
    let pen_width = document.getElementById("pen_width");
    let pen_shape = document.getElementById("pen_shape");
    //색상 선택 select 설정
    for (var key in color_map) {
        let newOption = new Option(color_map[key].name, color_map[key].value);
        pen_color.append(newOption);
    }

    //두께 선택 select 설정
    for (var i = 2; i < 15; i++) {
        let newOption = new Option(i, i);
        pen_width.append(newOption);
    }

    shape.setShape();
    pen_color.addEventListener('change', shape.change);
    pen_width.addEventListener('change', shape.change);
    pen_shape.addEventListener('change', shape.change);
    socket.on('linesend_toclient', (data) => {
        draw.drawfromServer(data);
    });
    


});

let shape = {
    // 기본 색상,두께 설정
    color: 'white',
    width: 3,

    change: function () {
        let color = pen_color.options[pen_color.selectedIndex].value;
        let width = pen_width.options[pen_width.selectedIndex].value;
        shape.setShape(color, width);
    },

    // 모양 변경 메서드
    setShape: function (color, width) {
        if (color != null)
            this.color = color;
        if (width != null)
            this.width = width;

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;

        ctx.clearRect(703, 0, 860, 90);
        ctx.beginPath();
        ctx.moveTo(710, 55);
        ctx.lineTo(820, 55);
        ctx.stroke();
    }
}

//그리기 관련
let draw = {
    drawing: null,
    start: function (e) {
        ctx.beginPath();
        ctx.moveTo(e.pageX, e.pageY);
        this.drawing = true;
        msg.line.send('start', e.pageX, e.pageY);
    },
    move: function (e) {
        if (this.drawing) {
            ctx.lineTo(e.pageX, e.pageY);
            ctx.stroke();
            msg.line.send('move', e.pageX, e.pageY);
        }
    },
    end: function (e) {
        this.drawing = false;
        msg.line.send('end');
    },
    clear: (e) => {
        ctx.clearRect(0, 0, 860, 645);
        msg.line.send('clear');
    },
    drawfromServer: function (data) {
        if (data.type == 'start') {
            ctx.beginPath();
            ctx.moveTo(data.x, data.y);
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.width;
        }
        if (data.type == 'move') {
            ctx.lineTo(data.x, data.y);
            ctx.stroke();
        }
        if (data.type == 'end') {}
        if (data.type == 'clear') {
            ctx.clearRect(0, 0, cv.width, cv.height);
            shape.setShape();
        }
    }
}

let msg = {
    line: {
        send: function (type, x, y) {
            console.log(type, x, y);
            socket.emit('linesend', {
                'type': type,
                'x': x,
                'y': y,
                'color': shape.color,
                'width': shape.width
            });
        }
    }
}