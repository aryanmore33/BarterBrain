class WebCryptoService {
    //Generate ECDH P-256 identity key pair.
    async generateIdentityKeyPair(): Promise<CryptoKeyPair> {
        return crypto.subtle.generateKey(
            {name: "ECDH", namedCurve: "P-256"},
            false,
            ["deriveBits"]
        ) as Promise<CryptoKeyPair>;
    }

    // Export public key.
    async exportPublicKey(publicKey: CryptoKey): Promise<string> {
        const key = await crypto.subtle.exportKey("spki", publicKey)
        return this.arrayBufferToBase64(key);
    }

    // Import peer public key.
    async importPublicKey(publicKey: string): Promise<CryptoKey> {
        return crypto.subtle.importKey(
            "spki", this.base64ToArrayBuffer(publicKey),
            {name: "ECDH", namedCurve: "P-256"},
            false, []
        )
    }

    // Derive shared secret.
    async deriveSharedSecret(
        privateKey: CryptoKey,
        publicKey: CryptoKey
    ): Promise<Uint8Array> {
        const bits = await crypto.subtle.deriveBits(
            {name: "ECDH", public: publicKey},
            privateKey, 256
        )
        return new Uint8Array(bits);
    }

    // Generate random IV.
    generateIV(): Uint8Array {
        return crypto.getRandomValues(new Uint8Array(12))
    }
    // Random bytes.
    randomBytes(length: number): Uint8Array{
        return crypto.getRandomValues(new Uint8Array(length))
    }

    // Export private key.
    async exportPrivateKey(privateKey: CryptoKey): Promise<string> {
        const key = await crypto.subtle.exportKey("pkcs8", privateKey);
        return this.arrayBufferToBase64(key);
    }
    // Import private key.
    async importPrivateKey(privateKey: string): Promise<CryptoKey> {
        return crypto.subtle.importKey(
            "pkcs8", this.base64ToArrayBuffer(privateKey),
            {name: "ECDH", namedCurve: "P-256"},
            false, ["deriveBits"]
        )
    }

    // Base64 helpers
    private arrayBufferToBase64(buffer: ArrayBuffer): string{
        let binary = "";
        const bytes = new Uint8Array(buffer);
        bytes.forEach(b => binary += String.fromCharCode(b))
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;    
    }
}
export const webCryptoService = new WebCryptoService();