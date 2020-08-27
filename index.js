const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const io = require('socket.io')(8000);
const bodyParser = require('body-parser');
const { Sequelize, Model, DataTypes } = require('sequelize');
var auth_router = require('./routes/auth.js')
var chat_router = require('./routes/chat.js')
var status_router = require('./routes/status.js')
var social_router = require('./routes/social.js')
const  User     = require('./models/sequelize').User;
const  Message     = require('./models/sequelize').Message;
const  Status     = require('./models/sequelize').Status;


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

app.use('/media/users_profile', express.static('media/users_profile'))
app.use('/media/status_pics', express.static('media/status_pics'))
app.use(express.json({limit: '10mb', extended: true}));

app.use('/auth', auth_router);
app.use('/chat', chat_router);
app.use('/status', status_router);
app.use('/social', social_router);




io.use(function(socket, next){
    if(socket.handshake.query && socket.handshake.query.token){

      jwt.verify(socket.handshake.query.token, accessTokenSecret, function(err, user) {
        if (err) {console.log("Not authenticated"); return next(new Error('Authentication error')) };
        socket.user = user;
        next();
      });

    }
    else {
      return next(console.log("No Token") && new Error('Authentication error'));
    }    
})

io.on('connection',async(socket) => {
    const user  = await User.findOne(options={where:{id: socket.user.id}});
    if(user){
        user.update({socket_id: socket.id});
        var new_messages = await Message.findAll({
            where: {
              to_user: socket.user.id,
              is_received: false
            }
         })
        //  console.log(new_messages);
        socket.emit("new_messages",new_messages);
    }else{
        console.log("not authenticated");
        socket.emit('disconnected',true);
        socket.disconnect();
        return ;
    }
    console.log(socket.user.name+" is connected")

    socket.on('new_message', async (data) => {

            console.log(data);
            const user  = await User.findOne(options={where:{id: data.to_user}});
            if(user){
                var receiver_socket = user.socket_id;
                console.log("receiver_Socket: "+ receiver_socket);  

                const message_inst = Message.build({ to_user: data.to_user,
                    body: data.body,
                    from_user: socket.user.id
                });
                await message_inst.save();

                message = { 
                    "to_user":data.to_user,
                    "body":data.body,
                    "createdAt":message_inst.createdAt,
                    "from_user": socket.user.id

                }


                socket.to(receiver_socket).emit("new_message",message);
                socket.emit("new_message",message);
            }else{
                console.log("not found");

            }


    })

});

app.listen(3000,() => {
    console.log("Server is running ...")
});