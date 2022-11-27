const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');

const User = require('../models/user');

module.exports = () => {
  //로그인 했을 때 사용자 정보 객체를 이용해서 사용자의 아이디를 deserializeUser 에게 넘김
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  /*
  passport.deserializeUser((id, done) => {
    //데이터베이스에서 id에 해당하는 값이 있는지 찾아서 세션에 저장
    User.findOne({ where: { id } })
      .then(user => done(null, user))
      .catch(err => done(err));
  });
  */

  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => done(null, user))
      .catch(err => done(err));
  });


  local();
  kakao();
};
