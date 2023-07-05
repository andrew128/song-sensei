import Head from "next/head";
import styles from "./index.module.css";
import React from "react";

const redirectUri = "http://localhost:3000/chat";
const scope = "playlist-modify-public";
const authorizationEndpoint = "https://accounts.spotify.com/authorize";

function generateRandomString(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  function base64encode(string) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return base64encode(digest);
}

export default function Home() {
  const handleClick = async () => {
    // Create a code verifier
    const codeVerifier = generateRandomString(128);

    // Hash the codeVerifier to create a code challenge.
    await generateCodeChallenge(codeVerifier)
      .then((codeChallenge) => {
        // Send the code challenge in the user auth request.
        let state = generateRandomString(16);

        localStorage.setItem("code_verifier", codeVerifier);

        let args = new URLSearchParams({
          response_type: "code",
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
          scope: scope,
          redirect_uri: redirectUri,
          state: state,
          code_challenge_method: "S256",
          code_challenge: codeChallenge,
        });

        console.log("args", args);

        window.location.href = `${authorizationEndpoint}?${args}`;
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  };

  return (
    <div>
      <Head>
        <title>🎵 Song Sensei 🎵</title>
      </Head>

      <main className={styles.main}>
        <h3>🎵 Song Sensei 🎵</h3>

        <button onClick={handleClick}>Login with Spotify</button>
      </main>
    </div>
  );
}
