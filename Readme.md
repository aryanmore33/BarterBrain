Algorithm to encrypt and decrypt messages:
ECDH (Elliptic Curve Diffie-Hellman)

socket/
│
├── socket.js       //done           ✅ Initializes socket    
├── socketAuth.js    //done          ✅ JWT middleware    
│
├── handlers/
│     chat.handler.js
│     notification.handler.js
│
├── services/
│     CallService.js      //done     ✅ Business logic    
│     NotificationService.js
│
├── models/
│     CallModel.js      //done
│
└── utils/
      socketEmitter.js   //done      ⭐ Emits events to users 
      callEvents        //done
            ✅ startCall.js
            ✅ acceptCall.js
            ✅ rejectCall.js
            ✅ offer.js
            ✅ answer.js
            ✅ iceCandidate.js
            ✅ mediaEvents.js
            ✅ endCall.js
            ✅ disconnect.js

STUN server	❌ Not configured
TURN server	❌ Not configured
ICE restart	❌ Not implemented
Reconnect after network loss	❌ Not implemented

chat/
│
├── ChatModel.js      ✅ Database only
├── ChatService.js    ✅ Business logic
├── chatEvents.js     ✅ Socket events
├── chatRoutes.js     ✅ REST APIs
├── crypto.js         ✅ E2EE
├── socketEmitter.js