class HKDFService {
    private readonly INFO = new TextEncoder().encode(
        "BarterBrain-E2EE"
    );
    async deriveAESKey(
        sharedSecret: Uint8Array,
        salt?: Uint8Array
    ): Promise<CryptoKey> {
        const baseKey = await crypto.subtle.importKey(
            "raw", sharedSecret as BufferSource, "HKDF", false, ["deriveKey"]
        )
        return crypto.subtle.deriveKey(
            {
                name: "HKDF",
                hash: "SHA-256",
                salt: (salt ?? new Uint8Array(32)) as BufferSource,
                info: this.INFO
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt","decrypt"]
        )
    }
    generateSalt(): Uint8Array { return crypto.getRandomValues(new Uint8Array(32)) }
    saltToBase64(salt: Uint8Array) : string {
        return btoa(String.fromCharCode(...salt))
    }
    base64ToSalt(value: string): Uint8Array{
        return Uint8Array.from(
            atob(value),
            c => c.charCodeAt(0)
        )
    }
}
export const hkdfService = new HKDFService();