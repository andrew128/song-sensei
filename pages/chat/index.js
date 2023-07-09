import Head from "next/head";
import { useState } from "react";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import React from "react";
import styles from "./../index.module.css";

const redirectUri = "http://localhost:3000/chat";

function getResponseCode() {
  const urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams.get("code"));
  return urlParams.get("code");
}

// Function that takes in text containing a numbered list and
// returns a list containing the items at each of the numbers.
// It throws away
function parseNumberedList(text) {
  console.log(text);
  var lines = text.split("\n");
  var matches = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    // Check if the line starts with a number followed by a period and whitespace
    if (/^\d+\.\s+/.test(line)) {
      // Remove the number and period from the beginning of the line
      var match = line.replace(/^\d+\.\s+/, "");
      matches.push(match);
    }
  }

  return matches;
}

async function getUserId() {
  // Fetch user information from Spotify Web API
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    const userId = data.id;
    console.log("Spotify User ID:", userId);
  } else {
    console.error("Error fetching user information:", response.status);
  }
}

const SubmitRequest = () => {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState();

  const chat = new ChatOpenAI({
    openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    temperature: 0,
  });

  // Whenever the SubmitRequest component is rendered this will fire.
  React.useEffect(() => {
    console.log("inside of React.useEffect", getResponseCode());

    let codeVerifier = localStorage.getItem("code_verifier");

    let body = new URLSearchParams({
      grant_type: "authorization_code",
      code: getResponseCode(),
      redirect_uri: redirectUri,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      code_verifier: codeVerifier,
    });

    const response = fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP status " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        console.log("data.access_token", data.access_token);
        localStorage.setItem("access_token", data.access_token);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const res = await chat.call([
        new SystemChatMessage(
          "You are a helpful assistant that comes up with a playlist of songs." +
            "You will give the playlist of songs in a numbered list." +
            "If you can't interpret a message as a song request you will truthfully say you do not know." +
            "When giving a suggested playlist return the songs in a numbered list."
        ),
        new HumanChatMessage(userInput),
      ]);
      console.log({ res });

      // TODO: create playlist using spotify api and song list in res

      // Get used id
      // getUserId();

      // Create playlist

      // Parse songs from chat output
      var numberedItems = parseNumberedList(res.text);
      console.log("numberedItems" + numberedItems);

      // Find songs and add them to the playlist

      setResult(res.text);
      setUserInput("");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>🎵 Song Sensei 🎵</title>
      </Head>

      <main className={styles.main}>
        <h3>🎵 Song Sensei 🎵</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="musicRequest"
            placeholder="Ask for music"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <input type="submit" value="🗣" />
        </form>
        <div className={styles.result}>{result}</div>
      </main>
    </div>
  );
};

export default SubmitRequest;
