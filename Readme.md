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


KeyModel
KeyManager
Key Routes
X25519 key generation
AES session key generation
Public key exchange
Encrypting the AES key for both participants
Frontend keyService.ts
Integrating cryptoService.ts into MessageInput and MessageBubble


✅ keyService.ts (temporary in-memory version for testing)
✅ indexedDbService.ts (persistent private-key storage)
✅ Update keyService.ts to use IndexedDB
✅ cryptoService.ts integration
✅ Connect MessageInput.tsx
✅ Connect MessageBubble.tsx
✅ Automatic key generation on first login
✅ Automatic key rotation and recovery
---x----

Phase 1
──────────────
✔ socket.ts
✔ api.ts updates
✔ chatService.ts
✔ callService.ts
✔ webRTCService.ts

Phase 2
──────────────
✔ ChatContext
✔ CallContext

Phase 3
──────────────
✔ useChat
✔ useCall

Phase 4
──────────────
✔ Chat Components

Phase 5
──────────────
✔ Calling Components

Phase 6
──────────────
✔ ChatPage

Phase 7
──────────────
✔ MeetingPage


src/
│
├── contexts/
│   ├── ChatContext.tsx
│   └── CallContext.tsx
│
├── hooks/
│   ├── useChat.ts
│   └── useCall.ts
│
├── services/
│   ├── api.ts
│   ├── socket.ts
│   ├── chatService.ts
│   ├── callService.ts
│   └── webRTCService.ts
│
├── components/
│   ├── chat/
│   │     ChatWindow.tsx
│   │     ChatHeader.tsx
│   │     MessageList.tsx
│   │     MessageBubble.tsx
│   │     MessageInput.tsx
│   │     TypingIndicator.tsx
│   │     ReplyPreview.tsx
│   │
│   └── call/
│         IncomingCallModal.tsx
│         OutgoingCallModal.tsx
│         CallControls.tsx
│         LocalVideo.tsx
│         RemoteVideo.tsx
│         MeetingLayout.tsx
│
└── pages/
      ChatPage.tsx
      MeetingPage.tsx
