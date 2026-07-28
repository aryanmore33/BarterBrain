class IndexedDbService {
    private readonly dbName = "BarterBrain";
    private readonly dbVersion = 1;
    private readonly storeName = "crypto"
    private db: IDBDatabase | null = null;
    async init (): Promise<IDBDatabase> {
        if (this.db) {
            return this.db;
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(
                this.dbName, this.dbVersion
            )
            request.onerror = () => {
                reject(request.error);
            }
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            }
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, {keyPath: "id"});
                }
            }
        })
    }
    private async putValue<T>(id: string, value: T): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName)
            store.put({id, value});
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
    private async getValue<T>(id: string): Promise<T | null> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readonly")
            const store = tx.objectStore(this.storeName)
            const request = store.get(id);
            request.onsuccess = () => {
                if (!request.result) {
                    resolve(null);
                    return;
                }
                resolve(request.result.value);
            }
            request.onerror = () => {
                reject(request.error);
            }
        })
    }
    async delete(id: string): Promise<void> {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite")
            const store = tx.objectStore(this.storeName)
            store.delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        })
    }
    async clear() {
        const db = await this.init();
        return new Promise<void>((resolve, reject) => {
            const tx = db.transaction(this.storeName, "readwrite")
            const store = tx.objectStore(this.storeName)
            store.clear();
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        })
    }

    async saveIdentityKeyPair(keyPair: CryptoKeyPair): Promise<void> {
        await this.putValue("identity_keypair", keyPair);
    }
    async getIdentityKeyPair(): Promise<CryptoKeyPair | null> {
        return this.getValue<CryptoKeyPair>("identity_keypair");
    }
    async saveSessionMetadata(
        barterId: string,
        metadata : {
            peerPublicKey: string;
            salt: string;
            version: number;
        }
    ): Promise<void> {
        await this.putValue(`session_${barterId}`, metadata);
    }
    async getSessionMetadata(barterId: string): Promise<{
        peerPublicKey: string;
        salt: string;
        version: number;
    }| null> {
        return this.getValue(`session_${barterId}`);
    }
    async deleteSessionMetadata(barterId): Promise<void> {
        await this.delete(`session_${barterId}`);
    }

}
export const indexedDbService = new IndexedDbService();