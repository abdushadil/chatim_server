var express     = require('express');
var chat_router = express.Router();
const  User     = require('../models/sequelize').User;
const  Message     = require('../models/sequelize').Message;
const jwt = require('jsonwebtoken');
var config = require('config');
const Sequelize = require('sequelize');

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

chat_router.get("/get_chat_messages/", authenticateJWT, async (req,res) => {

    var data = req.body;
    var messages = await Message.findAll({
        where: Sequelize.or(
            { from_user: req.user.id, to_user: data.user_id },
            { to_user: req.user.id, from_user: data.user_id }
            ),
        }
      );

    res.send({status:200,messages: messages})

})


chat_router.get("/get_chats/", authenticateJWT, async (req, res) => {
    var froms = await Message.aggregate('from_user', 'DISTINCT', { plain: false,where:{to_user: req.user.id} });
    var tos   = await Message.aggregate('to_user', 'DISTINCT', { plain: false,where:{from_user: req.user.id} });
    var ids = [];
    froms.forEach(element => {
        ids.push(element.DISTINCT);
    });

    tos.forEach(element => {
        if( !ids.includes(element.DISTINCT) ){
            ids.push(element.DISTINCT);
        }
    });

    var chats = [];

    for(const id of ids){
        var user = await User.findOne({where:{id: id},attributes: ['id','name','profile_picture']})
        var messages = await Message.findAll({
            where: Sequelize.or(
                { from_user: req.user.id, to_user: id },
                { to_user: req.user.id, from_user: id }
                ),
                order:[
                    ['createdAt', 'ASC']
                ],
                attributes:['is_read','is_received','body','from_user','to_user','createdAt']
            }
          );

        user.last_message = messages[0];
        var message_date = user.last_message.createdAt;

        var today = Date.now();
        var now = new Date(today)

        var dif = now.getTime() - message_date.getTime();
        var Seconds_from_T1_to_T2 = dif / 1000;
        var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
        
        var elapsed_time = parseInt(Seconds_Between_Dates);
        if(elapsed_time < 60){

            if(elapsed_time <= 1 ){
                user.elapsed_time = "now"
            }else{
                user.elapsed_time = elapsed_time + " seconds ago"
            }
            
        }else if(elapsed_time > 60 && elapsed_time <= 3600 ){

            if(parseInt(elapsed_time/60) == 1){
                user.elapsed_time = "one minute ago"
            }else{
                user.elapsed_time = parseInt(elapsed_time/60) +" minutes ago"
            }
            
        }else if(elapsed_time > 3600 && elapsed_time <= 86400){

            if(parseInt(elapsed_time/60/60) == 1){
                user.elapsed_time = "one hour ago"
            }else{
                user.elapsed_time = parseInt(elapsed_time/60/60) +" hours ago"
            }
            
        }else if(elapsed_time > 86400 && elapsed_time <= 604800 ){

            if(parseInt(elapsed_time/60/60/24) == 1){
                user.elapsed_time = parseInt(elapsed_time/60/60/24) +" day ago"
            }else{
                user.elapsed_time = parseInt(elapsed_time/60/60/24) +" days ago"
            }

        }else if(elapsed_time > 604800 && elapsed_time <= 2419200){

            if(parseInt(elapsed_time/60/60/24/7) == 1){
                user.elapsed_time = "one week ago"
            }else{
                user.elapsed_time = parseInt(elapsed_time/60/60/24/7) +" weeks ago"
            }
            
        }else if(elapsed_time > 2419200){

            if(parseInt(elapsed_time/60/60/24/7/4) == 1){
                user.elapsed_time = "one month ago"
            }else{
                user.elapsed_time = parseInt(elapsed_time/60/60/24/7/4) +" months ago"
            }

        }
        

        chats.push(user)


    }


    res.send({status:200, chats: chats})
});

module.exports = chat_router;