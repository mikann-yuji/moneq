/**
 * ソルトを生成する
 * @param length ソルトの長さ
 * @returns ソルト
 */
export function generateSalt(length = 16): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * パスワードから暗号化キーを生成する
 * @param password パスワード
 * @param salt ソルト
 * @returns 暗号化キー
 */
export async function deriveKEK(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * データ暗号化キーを生成する
 * @returns データ暗号化キー
 */
export async function generateDEK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

/**
 * データ暗号化キーを暗号化する
 * @param dek データ暗号化キー
 * @param kek 暗号化キー
 * @returns 暗号化されたデータ暗号化キーと IV
 */
export async function encryptDEK(dek: CryptoKey, kek: CryptoKey): Promise<{ encryptedDEK: ArrayBuffer; iv: Uint8Array }> {
  const rawDEK = await crypto.subtle.exportKey("raw", dek);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM の IV

  const encryptedDEK = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    kek,
    rawDEK
  );

  return { encryptedDEK, iv };
}

/**
 * データ暗号化キーを復号化する
 * @param encryptedDEK 暗号化されたデータ暗号化キー
 * @param kek 暗号化キー
 * @param iv IV
 * @returns データ暗号化キー
 */
export async function decryptDEK(encryptedDEK: ArrayBuffer, kek: CryptoKey, iv: Uint8Array): Promise<CryptoKey> {
  const rawDEK = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    kek,
    encryptedDEK
  );
  return crypto.subtle.importKey("raw", rawDEK, "AES-GCM", true, ["encrypt", "decrypt"]);
}

/**
 * データを暗号化する
 * @param data 平文
 * @param dek データ暗号化キー
 * @returns 暗号化されたデータと IV
 */
export async function encryptData(data: any, dek: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, dek, encoded);
  return { encrypted, iv };
}

/**
 * データを復号化する
 * @param cipherText 暗号化されたデータ
 * @param dek データ暗号化キー
 * @param iv IV
 * @returns 平文
 */
export async function decryptData<T>(cipherText: ArrayBuffer, dek: CryptoKey, iv: Uint8Array): Promise<T> {
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, dek, cipherText);
  return JSON.parse(new TextDecoder().decode(decrypted)) as T;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export function uint8ArrayToBase64(array: Uint8Array): string {
  return btoa(String.fromCharCode(...array));
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0)).buffer;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * DEKをraw化
 * @param dek データ暗号化キー
 * @returns raw化されたDEK
 */
export async function exportDek(dek: CryptoKey): Promise<string> {
  const rawKey = await crypto.subtle.exportKey("raw", dek);
  return arrayBufferToBase64(rawKey); // base64
}

/**
 * raw化されたDEKを復元
 * @param base64 raw化されたDEK
 * @returns データ暗号化キー
 */
export async function importDek(base64: string): Promise<CryptoKey> {
  const bytes = base64ToUint8Array(base64);
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}