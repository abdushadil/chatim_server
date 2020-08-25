const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const io = require('socket.io')(8000);
const bodyParser = require('body-parser');
const { Sequelize, Model, DataTypes } = require('sequelize');
var fs = require('fs');
const sequelize = new Sequelize('chatim', 'root', '', {
    host: 'localhost',
    dialect: "mysql",
    logging: false});


  const User = sequelize.define('users', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    profile_picture: DataTypes.STRING,
    socket_id: DataTypes.STRING,
    last_message: Sequelize.VIRTUAL,
    elapsed_time: Sequelize.VIRTUAL

}, {
    timestamps: false, sequelize, modelName: 'customers' });

const Message = sequelize.define('messages', {
    from_user: DataTypes.INTEGER,
    to_user: DataTypes.INTEGER,
    body: DataTypes.STRING,
    is_received: {'type': DataTypes.BOOLEAN, 'default': false},
    is_read: {'type': DataTypes.BOOLEAN, 'default': false}

}, {
    timestamps: true, sequelize, modelName: 'customers' });

async function testDb() {
    try {
        await sequelize.authenticate();
        console.log('DB connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

const accessTokenSecret = 'youraccesstokensecret';

app.use('/media/users_profile', express.static('media/users_profile'))
app.use(express.json({limit: '10mb', extended: true}));


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


io.use(function(socket, next){
    if (socket.handshake.query && socket.handshake.query.token){

      jwt.verify(socket.handshake.query.token, accessTokenSecret, function(err, user) {
        if (err) {console.log("Not authenticated"); return next(new Error('Authentication error')) };
        socket.user = user;
        next();
      });

    }
    else {
      next(console.log("No Token") && new Error('Authentication error'));
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




app.get("/check_cookie/", authenticateJWT ,async (req,res) => {
    res.send({status:200, "info": "authenticated"});
    
});

app.get("/get_chat_messages/", authenticateJWT, async (req,res) => {

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

app.get("/get_chats/", authenticateJWT, async (req, res) => {
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
            user.elapsed_time = elapsed_time + " seconds ago"
        }else if(elapsed_time > 60 && elapsed_time <= 3600 ){
            user.elapsed_time = parseInt(elapsed_time/60) +" minutes ago"
        }else if(elapsed_time > 3600 && elapsed_time <= 86400){
            console.log(elapsed_time)
            user.elapsed_time = parseInt(elapsed_time/60/60) +" hours ago"
        }else if(elapsed_time > 86400 && elapsed_time <= 604800 ){
            if(parseInt(elapsed_time/60/60/24) == 1){
                user.elapsed_time = parseInt(elapsed_time/60/60/24) +" day ago"
            }else{
                user.elapsed_time = parseInt(elapsed_time/60/60/24) +" days ago"
            }
        }else if(elapsed_time > 604800 && elapsed_time <= 2419200){
            if(parseInt(elapsed_time/60/60/24/7) == 1){
                user.elapsed_time = parseInt(elapsed_time/60/60/24/7) +" week ago"
            }else{
                user.elapsed_time = parseInt(elapsed_time/60/60/24/7) +" weeks ago"
            }
            
        }else if(elapsed_time > 2419200){
            if(parseInt(elapsed_time/60/60/24/7/4) == 1){
                user.elapsed_time = parseInt(elapsed_time/60/60/24/7/4) +" month ago"
            }else{
                user.elapsed_time = parseInt(elapsed_time/60/60/24/7/4) +" months ago"
            }
        }
        
    // else:
    //     if last_dif[0] < 60:
    //         review['elapsed_time'] = str(last_dif[0])+" minutes ago"
    //     if last_dif[0] >= 60 and last_dif[0] < 1440:
    //         passed = math.floor(last_dif[0]/60)
    //         if passed == 1:
    //             review['elapsed_time'] = str(math.floor(last_dif[0]/60))+" hour ago"
    //         else:
    //             review['elapsed_time'] = str(math.floor(last_dif[0]/60))+" hours ago"
        
    //     if last_dif[0] >= 1440:
    //         passed = math.floor(last_dif[0]/1440)
    //         if passed == 1:
    //             review['elapsed_time'] = str(math.floor(last_dif[0]/1440))+" day ago"
    //         else:
    //             review['elapsed_time'] = str(math.floor(last_dif[0]/1440))+" days ago"
        

        chats.push(user)


    }


    res.send({status:200, chats: chats})
});

app.post("/login/", async (req, res) => {
    var data = req.body;
    const user = await User.findOne({where:{email: data.email, password: data.password}})
    console.log(user)
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


app.post('/change_profile',authenticateJWT, async (req,res) =>{
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

app.listen(3000,() => {
    console.log("Server is running ...")
    testDb();
});