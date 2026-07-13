const { Server } = require("socket.io");
const initializeRedisAdapter = require("./redisAdapter");
const socketAuth = require("../../models/utils/socketAuth");

const chatEvents = require("../../models/utils/chatEvents");
const callEvents = require("../../models/utils/callEvents");

let io;

const ALLOWED_ORIGINS = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map(origin => origin.trim());

const initSocket = (server) => {

    io = new Server(server,{
        cors:{
            origin:ALLOWED_ORIGINS,
            credentials:true
        }
    });

    (async()=>{

        try{

            await initializeRedisAdapter(io);

        }catch(err){

            console.error("Redis Adapter:",err);

        }

    })();

    io.use(socketAuth);

    io.on("connection",(socket)=>{

        console.log("🔌 User connected:",socket.userId);

        socket.data.userId=socket.userId;

        socket.join(`user_${socket.userId}`);

        chatEvents(io,socket);

        callEvents(io,socket);

        socket.on("disconnect",()=>{

            console.log("❌ User disconnected:",socket.userId);

        });

    });

    return io;

};

const getIO=()=>{

    if(!io){
        throw new Error("Socket.io not initialized");
    }

    return io;

};

module.exports={
    initSocket,
    getIO
};