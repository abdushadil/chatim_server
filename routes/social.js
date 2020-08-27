var express     = require('express');
var social_router = express.Router();
const  User     = require('../models/sequelize').User;
const  Post     = require('../models/sequelize').Post;
const jwt = require('jsonwebtoken');
var config = require('config');
var fs = require('fs');
const { json } = require('body-parser');


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



social_router.get("/contacts/", authenticateJWT ,async (req,res) => {
    var user = await User.findOne({where:{id: req.user.id}})
    // console.log(user)
    var contacts_list = JSON.parse(user.contacts)
    var contacts = [];
    for(id of contacts_list){
        var user = await User.findOne({where:{id: id},attributes: ['id','name','profile_picture']});
        contacts.push(user);
    }
    var length = contacts.length;
    res.send({status:200, "contacts": contacts, "length": length});

}); 


social_router.post("/sync_contacts/", authenticateJWT ,async (req,res) => {
    var user = await User.findOne({where:{id: req.user.id}})
    // console.log(user)
    var contacts_list = JSON.parse(user.contacts)
    var contacts = [];
    
    for(id of contacts_list){
        var user = await User.findOne({where:{id: id},attributes: ['id','name','profile_picture']});
        contacts.push(user);
    }

    var length = contacts.length;
    res.send({status:200, "contacts": contacts, "length": length});

}); 


social_router.post('/change_profile',authenticateJWT, async (req,res) => {
    let image_data = req.body.image;
    let base64Image = image_data.split(';base64,').pop();

    var ext = image_data.substring("data:image/".length, image_data.indexOf(";base64"));
    var exts = ["jpg","jpeg","png"]
    
    if(!exts.includes(ext)){
        return res.send({status:401,info: "not valid image file"});
    }

    var file_path = "/media/users_profile/"+req.user.id +"_"+"profile."+ext;
    fs.writeFile("."+file_path, base64Image, {encoding: 'base64'}, function(err) {
        console.log(err)
    console.log('File created');

    })

    await User.update({profile_picture: file_path},{where:{id: req.user.id}});

    res.send({status:200,info: "profile picture chganged"});

})

social_router.post('/add_post',authenticateJWT, async (req,res) => {
    var data = req.body;

    if(data.text) {
        var post = Post.build({text: data.text,user_id: req.user.id})
        await post.save();
        res.send({status:200,post: post});

    }else{
        res.send({status:400,info: "bad request"});
    }
    
});
  
module.exports = social_router;