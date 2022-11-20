const express = require('express');
const morgan = require('morgan');
const compression = require('compression')
const path = require('path');
const mysql = require('mysql');

const cookieParser = require('cookie-parser');
const session = require("express-session");

const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config()

//서버 설정
const app = express();
app.set('port', process.env.PORT);

//로그 출력 설정
var FileStreamRotator = require('file-stream-rotator')
var fs = require('fs')
var logDirectory = path.join(__dirname, 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false
})

// setup the logger
app.use(morgan('combined', {
    stream: accessLogStream
}))

app.use(compression());

//post 방식의 파라미터 읽기
var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));


var options = {
    host: process.env.HOST,
    port: process.env.MYSQLPORT,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
};

const MariaDBStore = require('express-mysql-session')(session);

app.use(
    session({
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: true,
        store: new MariaDBStore(options)
    })
);

//파일 업로드를 위한 설정
//img 디렉토리를 연결
try {
    fs.readdirSync('public/img');
} catch (error) {
    console.error('img 폴더가 없으면 img 폴더를 생성합니다.');
    fs.mkdirSync('public/img');
}
//파일이름은 기본 파일 이름에 현재 시간을 추가해서 생성
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'public/img/');
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
});

app.use('/', express.static('public'))


//파일 다운로드를 위한 설정 
var util = require('util')
var mime = require('mime')

//데이터베이스 연결
var connection = mysql.createConnection(options);

connection.connect(function (err) {
    if (err) {
        console.log('mariadb connection error');
        console.log(err);
        throw err;
    }
});

const {
    sequelize
} = require('./models');

sequelize.sync({
        force: false
    })
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

const {
    Good
} = require('./models');


app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.get('/item/all', async (req, res, next) => {
    /*
    //전체 데이터 가져오기
    var list;
    connection.query('SELECT * FROM goods order by itemid desc', function (err, results, fields) {
        if (err) {
            throw err;
        }
        list = results;
        //전체 데이터 개수 가져오기
        connection.query('SELECT count(*) cnt FROM goods', function (err, results, fields) {
            if (err)
                throw err;
            console.log(list)
            res.json({
                'count': results[0].cnt,
                'list': list
            });

        });
    });
    */

    //전체 데이터 가져오기
    try {
        let list = await Good.findAll();
        let count = await Good.count();
        console.log(list)
        console.log(count)
        res.json({
            'count': count,
            'list': list
        });
    } catch (err) {
        console.log(err)
        next(err)
    }
});

//아이템 목록 보기 : 페이지 번호와 한 페이지 당 가져올 데이터 개수를 설정해서 데이터를 가져옴 페이지 번호와 데이터 개수를 생략하면 기본값 사용
//결과는 count 에 전체 데이터 개수 그리고 list에 데이터 목록을 출력
app.get('/item/list', async (req, res, next) => {
    //get 방식의 파라미터 가져오기
    const pageno = req.query.pageno;
    const count = req.query.count;

    //데이터를 가져올 시작 위치와 데이터 개수 설정
    var start = 0
    var size = 5

    if (count != undefined) {
        size = parseInt(count)
    }

    if (pageno != undefined) {
        start = (parseInt(pageno) - 1) * size
    }
    //시작 위치와 페이지 당 데이터 개수를 설정해서 가져오기
    /*
    var list;
    connection.query('SELECT * FROM goods order by itemid desc limit ?, ?', [start, size], function (err, results, fields) {
        if (err) {
            throw err;
        }
        list = results;
        //전체 데이터 개수 가져오기
        connection.query('SELECT count(*) cnt FROM goods', function (err, results, fields) {
            if (err)
                throw err;
            res.json({
                'count': results[0].cnt,
                'list': list
            });

        });
    });
    */
    try {
        let list = await Good.findAll({
            offset: start,
            limit: size,
        });
        let cnt = await Good.count();
        console.log(list)
        console.log(count)
        res.json({
            'count': cnt,
            'list': list
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

//상세보기 - itemid를 매개변수로 받아서 하나의 데이터를 찾아서 출력해주는 처리 
app.get('/item/detail', async (req, res, next) => {
    const itemid = req.query.itemid;
    /*
    connection.query('SELECT * FROM goods where itemid = ?', itemid, function (err, results, fields) {
        if (err)
            throw err;
        //데이터가 존재하지 않으면 result에 false를 출력 
        if (results.length == 0) {
            res.json({
                'result': false
            });
        }
        //데이터가 존재하면 result에 true를 출력하고 데이터를 item에 출력
        else {
            res.json({
                'result': true,
                'item': results[0]
            });
        }
    });
    */

    try {
        let item = await Good.findOne({
            where: {
                itemid: itemid
            }
        });

        res.json({
            'result': true,
            'item': item
        });
    } catch (err) {
        console.log(err);
        res.json({
            'result': false
        });
    }

});

app.get('/img/:fileid', function (req, res) {
    let fileId = req.params.fileid;
    let file = '/Users/mac/Documents/source/node/nodemysql/img' + '/' + fileId;
    console.log("file:" + file);
    mimetype = mime.lookup(fileId);
    console.log("file:" + mimetype);
    res.setHeader('Content-disposition', 'attachment; filename=' + fileId);
    res.setHeader('Content-type', mimetype);
    let filestream = fs.createReadStream(file);
    filestream.pipe(res);
});

//현재 날짜를 문자열로 리턴하는 함수
const getDate = () => {
    let date = new Date()
    let year = date.getFullYear();
    let month = (1 + date.getMonth());
    month = month >= 10 ? month : '0' + month;
    let day = date.getDate();
    day = day >= 10 ? day : '0' + day;

    let result = year + '-' + month + '-' + day;
    return result;
}

//현재 날짜 및 시간을 리턴하는 함수
const getTime = () => {
    let date = new Date()
    let hour = date.getHours();
    hour = hour >= 10 ? hour : '0' + hour;
    let minute = date.getMinutes();
    minute = minute >= 10 ? minute : '0' + minute;
    let second = date.getSeconds();
    second = second >= 10 ? second : '0' + second;

    let result = getDate() + " " + hour + ":" + minute + ":" + second;
    return result;
}

//데이터 삽입:itemname, description, price, pictureurl(파일)을 받아서 처리
//itemid는 가장 큰 itemid를 찾아서 + 1
app.post('/item/insert', upload.single('pictureurl'), async (req, res, next) => {
    //파라미터 가져오기
    const itemname = req.body.itemname;
    const description = req.body.description;
    const price = req.body.price;
    let pictureurl;
    if (req.file) {
        pictureurl = req.file.filename
    } else {
        pictureurl = "default.jpg";
    }

    /*
    //가장 큰 itemid 가져오기
    connection.query('select max(itemid) maxid from goods', function (err, results, fields) {
        if (err)
            throw err;
        let itemid;
        if (results.length > 0) {
            itemid = results[0].maxid + 1
        } else {
            itemid = 1;
        }
      
        //데이터 삽입
        connection.query('insert into goods(itemid, itemname, price, description, pictureurl, updatedate) values(?,?,?,?,?,?)',
            [itemid, itemname, price, description, pictureurl, getDate()],
            function (err, results, fields) {
                if (err)
                    throw err;
                console.log(results)
                if (results.affectedRows == 1) {
                    const writeStream = fs.createWriteStream('./update.txt');
                    writeStream.write(getTime());
                    writeStream.end();

                    res.json({
                        'result': true
                    });
                } else {
                    res.json({
                        'result': false
                    });
                }
            });
    });
    */

    let itemid = 1;
    try {
        let x = await Good.max('itemid');
        itemid = x + 1
    } catch (err) {
        console.log(err);
    }
    Good.create({
        itemid: itemid,
        itemname: itemname,
        price: price,
        description: description,
        pictureurl: pictureurl,
        updatedate: getDate()
    });
    const writeStream = fs.createWriteStream('./update.txt');
    writeStream.write(getTime());
    writeStream.end();

    res.json({
        'result': true
    });
    console.log('데이터베이스 삽입 성공')
});

app.post('/item/delete', async(req, res, next) => {
    const itemid = req.body.itemid;
    console.log("itemid:", itemid);

    /*
    connection.query('delete FROM goods where itemid = ?', itemid, function (err, results, fields) {
        if (err)
            throw err;
        if (results.affectedRows == 1) {
            const writeStream = fs.createWriteStream('./update.txt');
            writeStream.write(getTime());
            writeStream.end();
            res.json({
                'result': true
            });
        } else {

            res.json({
                'result': false
            });
        }
    });
    */
    try {
        let item = await Good.destroy({
            where: {
                itemid: itemid
            }
        });
        const writeStream = fs.createWriteStream('./update.txt');
        writeStream.write(getTime());
        writeStream.end();
        res.json({
            'result': true,
            'item': item
        });
    } catch (err) {
        console.log(err);
        res.json({
            'result': false
        });
    }

});

app.get('/item/update', (req, res, next) => {
    fs.readFile('public/update.html', function (err, data) {
        res.end(data);
    });
});


//데이터 수정: itemid, itemname, description, price, oldpictureurl, pictureurl(파일)을 받아서 처리
app.post('/item/update', upload.single('pictureurl'), async (req, res, next) => {
    //파라미터 가져오기
    const itemid = req.body.itemid;
    const itemname = req.body.itemname;
    const description = req.body.description;
    const price = req.body.price;
    const oldpictureurl = req.body.oldpictureurl;

    let pictureurl;
    if (req.file) {
        pictureurl = req.file.filename
    } else {
        pictureurl = oldpictureurl;
    }

    /*
    //데이터 수정
    connection.query('update  goods set itemname=?, price=?, description=?, pictureurl=?, updatedate=? where itemid=?',
        [itemname, price, description, pictureurl, getDate(), itemid],
        function (err, results, fields) {
            if (err)
                throw err;
            console.log(results)
            if (results.affectedRows == 1) {
                const writeStream = fs.createWriteStream('./update.txt');
                writeStream.write(getTime());
                writeStream.end();

                res.json({
                    'result': true
                });
            } else {
                res.json({
                    'result': false
                });
            }
        });
        */

    //update
    try {
        let item = await Good.update(
            //update할 칼럼 정보
            {
                itemname: itemname,
                price: price,
                description: description,
                pictureurl: pictureurl,
                updatedate: getDate()
            },
            //where절 
            {
                where: {
                    itemid: itemid
                }
            })
        const writeStream = fs.createWriteStream('./update.txt');
        writeStream.write(getTime());
        writeStream.end();

        res.json({
            'result': true
        });
    } catch (err) {
        console.log(err);
        res.json({
            'result': false
        });
    }
});

app.get('/item/date', (req, res, next) => {
    fs.readFile('./update.txt', function (err, data) {
        res.json({
            'result': data.toString()
        });
    });
});

//에러가 발생한 경우 처리
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send(err.message)
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});
