async function deriveKey(password) {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        {name: "PBKDF2"},
        false,
        ["deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode('test_salt'),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        {name: "AES-GCM", length: 256},
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptMessage(text, password) {
    const key = await deriveKey(password);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();

    const encrypted = await window.crypto.subtle.encrypt(
        {name: "AES-GCM", iv: iv},
        key,
        encoder.encode(text),
    );

    return {
        cipher: encrypted,
        iv: iv,
    };
}

export async function decryptMessage(encrypted, password) {
    const key = await deriveKey(password);
    const binaryString = atob(encrypted);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const iv = bytes.slice(0, 12)
    const ciphertext = bytes.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}