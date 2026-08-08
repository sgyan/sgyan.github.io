(() => {
    "use strict";

    const AUTH = Object.freeze({
        iterations: 210000,
        salt: "fJVRXKf0gwDDRJbXVAzNow==",
        verifier: "OfvJVW6C/II5YfoTy2Tj8qkgq2z1Qgjfh/I4u36SywQ="
    });
    const STORAGE_KEY = "sgyan-blog-auth-v1";

    const gate = document.getElementById("password-gate");
    const content = document.getElementById("protected-content");
    const form = document.getElementById("password-form");
    const input = document.getElementById("site-password");
    const error = document.getElementById("password-error");
    const submit = document.getElementById("password-submit");

    function decodeBase64(value) {
        return Uint8Array.from(atob(value), character => character.charCodeAt(0));
    }

    function encodeBase64(value) {
        let binary = "";
        for (const byte of new Uint8Array(value)) {
            binary += String.fromCharCode(byte);
        }
        return btoa(binary);
    }

    function equalConstantTime(left, right) {
        if (left.length !== right.length) {
            return false;
        }

        let difference = 0;
        for (let index = 0; index < left.length; index += 1) {
            difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
        }
        return difference === 0;
    }

    async function createVerifier(password) {
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveBits"]
        );
        const bits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                hash: "SHA-256",
                salt: decodeBase64(AUTH.salt),
                iterations: AUTH.iterations
            },
            key,
            256
        );
        return encodeBase64(bits);
    }

    function unlock() {
        gate.hidden = true;
        content.hidden = false;
        document.body.classList.remove("auth-pending");
        input.value = "";
    }

    try {
        if (sessionStorage.getItem(STORAGE_KEY) === AUTH.verifier) {
            unlock();
            return;
        }
    } catch (_) {
        // Authentication still works when storage is unavailable.
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        error.textContent = "";
        input.removeAttribute("aria-invalid");
        submit.disabled = true;
        submit.textContent = "Checking...";

        try {
            const verifier = await createVerifier(input.value);
            if (!equalConstantTime(verifier, AUTH.verifier)) {
                throw new Error("INVALID_PASSWORD");
            }

            try {
                sessionStorage.setItem(STORAGE_KEY, AUTH.verifier);
            } catch (_) {
                // Continue without session persistence.
            }
            unlock();
        } catch (verificationError) {
            error.textContent = verificationError.message === "INVALID_PASSWORD"
                ? "Incorrect password. Please try again."
                : "This browser cannot verify the password.";
            input.setAttribute("aria-invalid", "true");
            input.select();
        } finally {
            submit.disabled = false;
            submit.textContent = "Unlock";
        }
    });
})();
