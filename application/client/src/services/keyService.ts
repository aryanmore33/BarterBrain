import { keyApiService } from "./api";
import { indexedDbService } from "./indexedDbService";
import { webCryptoService } from "./webCryptoService";
import { hkdfService } from "./hkdfService";
import { decodeBase64 } from "./encodingService";

class KeyService {
    private chatKeys = new Map<string, CryptoKey>();
    private initialization: Promise<void> | null = null;
    async initialize(): Promise<void> {
        if (this.initialization) return this.initialization;
        this.initialization = this.initializeIdentity();
        try {
            await this.initialization;
        } catch (error) {
            this.initialization = null;
            throw error;
        }
    }

    private async initializeIdentity(): Promise<void> {
        const identity = await indexedDbService.getIdentityKeyPair();
        if (!identity) {
            await this.createIdentity();
            return;
        };
        try {
            await keyApiService.getMyKey();
        } catch {
            //  Backend lost the key. re-register
            const publicKey = await webCryptoService.exportPublicKey(identity.publicKey);
            await keyApiService.registerPublicKey({publicKey, algorithm: "ECDH-P256"})
        }
    }

    private async createIdentity(): Promise<void> {
        const keyPair = await webCryptoService.generateIdentityKeyPair();
        await indexedDbService.saveIdentityKeyPair(keyPair);
        const publicKey = await webCryptoService.exportPublicKey(keyPair.publicKey);
        await keyApiService.registerPublicKey({publicKey, algorithm: "ECDH-P256"})
    }
    
    async getIdentityKeyPair(): Promise<CryptoKeyPair> {
        let pair = await indexedDbService.getIdentityKeyPair();
        if (!pair) {
            await this.initialize();
            pair = await indexedDbService.getIdentityKeyPair();
        }
        if (!pair) {
            throw new Error("Identity key pair not found.")
        }
        return pair;
    }

    async getChatKey(barterId: string): Promise<CryptoKey> {
        const cached = this.chatKeys.get(barterId);
        if(cached) return cached;
        const metadata = await this.getLatestMetadata(barterId);
        const identity = await this.getIdentityKeyPair();
        const peerPublicKey = await webCryptoService.importPublicKey(metadata.peerPublicKey);
        const sharedSecret = await webCryptoService.deriveSharedSecret(identity.privateKey, peerPublicKey);
        const aesKey = await hkdfService.deriveAESKey(sharedSecret, decodeBase64(metadata.salt));
        this.chatKeys.set(barterId, aesKey);
        return aesKey;
    }

    clearChatKey(barterId: string): void {
        this.chatKeys.delete(barterId);
    }
    clearAllChatKeys(): void { this.chatKeys.clear(); }

    async rotateChatKey(barterId:string): Promise<void> {
        await keyApiService.rotateSessionKey(barterId);
        this.chatKeys.delete(barterId)
    }

    private async fetchSessionMetadata(barterId: string){
        const response = await keyApiService.getSessionKey(barterId);
        const metadata = response.data;
        await indexedDbService.saveSessionMetadata(barterId, metadata);
        return metadata;
    }
    private async getLatestMetadata(barterId: string) {
        let metadata = await indexedDbService.getSessionMetadata(barterId);
        const response = await keyApiService.getSessionKey(barterId);
        const latest = response.data;

        // Older clients cached this field as `publicKey`. Repair that cache
        // automatically after the API was corrected to `peerPublicKey`.
        if (
            !metadata ||
            !metadata.peerPublicKey ||
            latest.version !== metadata.version ||
            latest.peerPublicKey !== metadata.peerPublicKey
        ) {
            this.chatKeys.delete(barterId);
            await indexedDbService.saveSessionMetadata(barterId, latest);
            metadata = latest;
        }

        return metadata;
    }

// import sodium from "libsodium-wrappers-sumo";
// import apiClient from "./apiClient";
    // private initialized = false;
    // private publicKey: Uint8Array | null = null;
    // private privateKey: Uint8Array | null = null;
    // private async init() {
    //     if (this.initialized) return;
    //     await sodium.ready;
    //     this.initialized = true;
    // }
    // async generateKeyPair() {
    //     await this.init();
    //     if (this.privateKey && this.publicKey) {
    //         return {
    //             publicKey: this.publicKey,
    //             privateKey: this.privateKey
    //         }
    //     }
    //     const pair = sodium.crypto_kx_keypair();
    //     this.publicKey = pair.publicKey;
    //     this.privateKey = pair.privateKey;
    //     return {
    //         publicKey: pair.publicKey,
    //         privateKey: pair.privateKey
    //     }
    // }
    // getPublicKey() {
    //     return this.publicKey;
    // }
    // getPrivateKey() {
    //     return this.privateKey;
    // }
    // async uploadPublicKey () {
    //     await this.init();
    //     if (!this.publicKey) {
    //         throw new Error("Key pair not generated");
    //     }
    //     const publicKeyBase64 = sodium.to_base64(
    //         this.publicKey, sodium.base64_variants.ORIGINAL
    //     )
    //     await apiClient.post("/api/keys/public-key", {
    //         publicKey: publicKeyBase64,
    //         algorithm: "X25519"
    //     })
    // }
    // async initializeUserKeys() {
    //     if (this.publicKey && this.privateKey) return;
    //     await this.generateKeyPair();
    //     await this.uploadPublicKey();
    // }
    // async fetchBarterPublicKey(barterId: string) {
    //     const response = await apiClient.get(`/api/keys/barter/${barterId}`);
    //     return sodium.from_base64(
    //         response.data.data.publicKey,
    //         sodium.base64_variants.ORIGINAL
    //     )
    // }
    // async deriveSharedSecret(peerPublicKey: Uint8Array) {
    //     await this.init();
    //     if (!this.privateKey || !this.publicKey) {
    //         throw new Error("Key pair not generated");
    //     }
    //     const keys = sodium.crypto_kx_client_session_keys(
    //         this.publicKey, this.privateKey, peerPublicKey
    //     )
    //     return keys.sharedTx;
    // }
    // clearKeys() {
    //     this.privateKey = null;
    //     this.publicKey = null;
    // }
}

export const keyService = new KeyService();
