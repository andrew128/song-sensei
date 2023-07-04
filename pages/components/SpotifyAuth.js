import React from "react";
import axios from "axios";
import queryString from "query-string";

const redirectUri = "http://localhost:3000/";
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

const SpotifyAuth = ({ onLogin }) => {
  async function performPKCEAuthorization() {
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
          client_id: process.env.CLIENT_ID,
          scope: scope,
          redirect_uri: redirectUri,
          state: state,
          code_challenge_method: "S256",
          code_challenge: codeChallenge,
        });

        window.location = "https://accounts.spotify.com/authorize?" + args;
      })
      .then(() => {
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get("code");
      });
  }

  const handleClick = async () => {
    // Create a code verifier
    const codeVerifier = generateRandomString(128);

    // Hash the codeVerifier to create a code challenge.
    await generateCodeChallenge(codeVerifier).then((codeChallenge) => {
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

      window.location.href = `${authorizationEndpoint}?${args}`;
    });
  };

  // React.useEffect(() => {
  //   const getToken = async (code, verifier) => {
  //     const data = {
  //       grant_type: "authorization_code",
  //       code,
  //       redirect_uri: redirectUri,
  //       code_verifier: verifier,
  //       client_id: process.env.CLIENT_ID,
  //     };

  //     try {
  //       const response = await axios.post(
  //         tokenEndpoint,
  //         queryString.stringify(data),
  //         {
  //           headers: {
  //             "Content-Type": "application/x-www-form-urlencoded",
  //           },
  //         }
  //       );

  //       const { access_token, expires_in, refresh_token } = response.data;

  //       if (access_token) {
  //         onLogin(access_token, expires_in, refresh_token);
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Failed to exchange authorization code for access token:",
  //         error
  //       );
  //     }
  //   };

  //   const { code, error } = queryString.parse(window.location.search);

  //   if (code) {
  //     getToken(code);
  //   } else if (error) {
  //     console.error("Authorization error:", error);
  //   }
  // }, [onLogin]);

//   async function handleLogin() {
//     const urlParams = new URLSearchParams(window.location.search);
//     let code = urlParams.get("code");

//     console.log("UrlParams: ", urlParams);
//     console.log("code: ", code);
//   }

  return (
    <div>
      <button onClick={handleClick}>
        Login with Spotify
      </button>
    </div>
  );
};

export default SpotifyAuth;
