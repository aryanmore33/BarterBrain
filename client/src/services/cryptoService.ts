import { decodeBase64, encodeBase64 } from "./encodingService";
import { keyService } from "./keyService";

class CryptoService {
    // private key: CryptoKey | null = null;
    // async initialize (rawKey: ArrayBuffer){
    //     this.key = await window.crypto.subtle.importKey(
    //         "raw", rawKey, {name: "AES-GCM"}, false, ["encrypt", "decrypt"]
    //     )
    // }
    async encrypt(barterId:string, plainText: string){
        const key = await keyService.getChatKey(barterId);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const encrypted = await crypto.subtle.encrypt(
            {name: "AES-GCM", iv},
            key, encoder.encode(plainText)
        );
        const encryptedBytes = new Uint8Array(encrypted);
        const authTag = encryptedBytes.slice(encryptedBytes.length - 16);
        const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - 16);
        return {
            ciphertext: encodeBase64(ciphertext),
            iv: encodeBase64(iv),
            auth_tag: encodeBase64(authTag)
        }
    }
    async decrypt (barterId: string, payload: {
        ciphertext: string;
        iv: string;
        auth_tag: string;
    }) {
        const key = await keyService.getChatKey(barterId);
        const cipherBytes = decodeBase64(payload.ciphertext);
        const tagBytes = decodeBase64(payload.auth_tag);
        const combined = new Uint8Array(cipherBytes.length + tagBytes.length);
        combined.set(cipherBytes);
        combined.set(tagBytes, cipherBytes.length);
        const decrypted = await crypto.subtle.decrypt(
            {name: "AES-GCM", iv: decodeBase64(payload.iv)},
            key, combined
        );
        return new TextDecoder().decode(decrypted);
    }
}
export const cryptoService = new CryptoService();