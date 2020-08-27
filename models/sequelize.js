const {Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize('chatim', 'root', '', {
    host: 'localhost',
    dialect: "mysql",
    logging: false
});

User =  sequelize.define('users', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    profile_picture: DataTypes.STRING,
    socket_id: DataTypes.STRING,
    contacts: {'type': DataTypes.STRING, 'default': '[]'},
    last_message: Sequelize.VIRTUAL,
    elapsed_time: Sequelize.VIRTUAL

}, {
    timestamps: false, sequelize, modelName: 'customers' });


Message =  sequelize.define('messages', {
    from_user: DataTypes.INTEGER,
    to_user: DataTypes.INTEGER,
    body: DataTypes.STRING,
    is_received: {'type': DataTypes.BOOLEAN, 'default': false},
    is_read: {'type': DataTypes.BOOLEAN, 'default': false}

}, {
    timestamps: true, sequelize, modelName: 'messages' });

Status = sequelize.define('statuses', {
    user_id: DataTypes.INTEGER,
    status_type: DataTypes.STRING,
    text: {type: DataTypes.STRING,default: ""},
    status_image: {type: DataTypes.STRING,default: ""}
    // is_received: {'type': DataTypes.BOOLEAN, 'default': false},
    // is_read: {'type': DataTypes.BOOLEAN, 'default': false}
}, {
    timestamps: true, sequelize, modelName: 'statuses' });

Post = sequelize.define('posts', {
    user_id: DataTypes.INTEGER,
    text: {type: DataTypes.STRING,default: ""},
    // is_received: {'type': DataTypes.BOOLEAN, 'default': false},
    // is_read: {'type': DataTypes.BOOLEAN, 'default': false}
}, {
    timestamps: true, sequelize, modelName: 'posts' });


module.exports = {
    User,
    Message,
    Status,
    Post
  }