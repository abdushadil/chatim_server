var express     = require('express');
var auth_router = express.Router();
const  User     = require('../models/sequelize').User;
const jwt = require('jsonwebtoken');
var config = require('config');
var fs = require('fs');


var accessTokenSecret = config.jwtAccessSecrect;
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.send({status: 403, info: "not authenticated"}).sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        return res.send({status: 403, info: "not authenticated"}).sendStatus(403);
    }
}
auth_router.post('/login', async function (req, res) {

    var data = req.body;
    const user = await User.findOne({where:{email: data.email, password: data.password}})

    if (user) {
        const accessToken = jwt.sign({ email: user.email,  id: user.id, name: user.name, profile_picture: user.profile_picture }, accessTokenSecret);
        res.json({
            status:200,
            accessToken
        });

    } else {
        res.send({status: 401, info: "Wrong email or password"});
    }
  })


auth_router.get("/check_cookie/", authenticateJWT ,async (req,res) => {
    res.send({status:200, "info": "authenticated"});

}); 


  
module.exports = auth_router;