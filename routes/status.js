var express     = require('express');
var status_router = express.Router();
const  User     = require('../models/sequelize').User;
const  Status     = require('../models/sequelize').Status;

const jwt = require('jsonwebtoken');
var config = require('config');
const Sequelize = require('sequelize');
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


status_router.post('/add_status/', authenticateJWT, async (req, res) => {
    var data = req.body;
    if(data.type == 'image'){
        if(!data.image){
            return res.send({"status":400,"info":"No Image"})
        }
        let image_data = data.image;
        let base64Image = image_data.split(';base64,').pop();
    
        var ext = image_data.substring("data:image/".length, image_data.indexOf(";base64"));
        var exts = ["jpg","jpeg","png"]
        
        if(!exts.includes(ext)){
            return res.send({status:401,info: "not valid image file"});
        }
    
        var now = Date.now();
        var file_path = "/media/status_pics/"+req.user.id +"_"+"status_"+now+"."+ext;
        fs.writeFile("."+file_path, base64Image, {encoding: 'base64'}, function(err) {
            // console.log(err)
        console.log('File created');
    
        })
        var status = Status.build({
            user_id: req.user.id,
            text: data.text,
            status_type: 'image',
            status_image: file_path
        })
        await status.save();
        // console.log(data);
    }else if(data.type == 'text'){
        var status =  Status.build({
            user_id: req.user.id,
            text: data.text,
            status_type: "text"
        })
        await status.save();
    }
    
    var user = await User.findOne({where:{id: req.user.id}})
    // io.to(user.socket_id).emit("new_status",data);
    res.send({"status":200})
});

module.exports = status_router;