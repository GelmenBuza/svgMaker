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

export async function encriptMessage(text, password) {
    const key = await deriveKey(password);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();

    const encrypted = await window.crypto.subtle.encrypt(
        {name: "AES-GCM", iv: iv},
        key,
        encoder.encode(text),
    );

    return {
        cipher: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

export async function decryptMessage(encryptedObj, password) {
    const key = await deriveKey(password);
    console.log(encryptedObj, password);
    const iv = Uint8Array.from(atob(encryptedObj.iv), c => c.charCodeAt(0));
    const data = Uint8Array.from(atob(encryptedObj.cipher), c => c.charCodeAt(0));

    const decrypted = await window.crypto.subtle.decrypt(
        {name: "AES-GCM", iv: iv},
        key,
        data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}