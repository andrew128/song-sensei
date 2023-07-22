import Head from "next/head";
import { useState } from "react";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import React from "react";
import styles from "./../index.module.css";

const redirectUri = "https://song-sensei.vercel.app/chat";

function getResponseCode() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("code");
}

// Function that takes in text containing a numbered list and
// returns a list containing the items at each of the numbers.
// It throws away
function parseNumberedList(text) {
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
  const userId = localStorage.getItem("userid");
  if (userId !== null) {
    // Item exists in localStorage
    return userId;
  } else {
    // Item does not exist in localStorage
    // Fetch user information from Spotify Web API
    await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP status " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("userid", data.id);
        return data.id;
      })
      .catch((error) => {
        console.error("Error fetching user information:", error);
      });
  }
}

async function createPlaylist(numberedItems) {
  const userId = localStorage.getItem("userid");
  const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
  const authorizationCode = `Bearer ${localStorage.getItem("access_token")}`;
  const data = {
    name: "New Playlist",
    description: "Made for you by Song Sensei",
    public: false,
  };

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorizationCode,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      return data.id;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function addTrackToPlaylist(trackUri, playlistId) {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
  const authorizationCode = `Bearer ${localStorage.getItem("access_token")}`;
  const data = {
    uris: [trackUri],
  };

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorizationCode,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function findSongAndAddToPlaylist(item, playlistId) {
  const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    item
  )}&type=track`;
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: headers,
    });
    const data = await response.json();
    if (response.ok) {
      const trackItems = data.tracks.items;
      const trackUris = trackItems.map((track) => track.uri);
      await addTrackToPlaylist(trackUris[0], playlistId);
    } else {
      console.log("Failed to search for songs:", data);
    }
  } catch (error) {
    console.log("Error searching for songs:", error);
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
    let codeVerifier = localStorage.getItem("code_verifier");

    let body = new URLSearchParams({
      grant_type: "authorization_code",
      code: getResponseCode(),
      redirect_uri: redirectUri,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      code_verifier: codeVerifier,
    });

    fetch("https://accounts.spotify.com/api/token", {
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
            "You will give the playlist of unique songs in a numbered list." +
            "If you can't interpret a message as a song request you will truthfully say you do not know." +
            "When giving a suggested playlist return the songs in a numbered list."
        ),
        new HumanChatMessage(userInput),
      ]);

      //  Set the output text
      setResult(res.text);
      setUserInput("");

      // Ensure user id is in local storage
      await getUserId();

      // Parse songs from chat output
      var numberedItems = parseNumberedList(res.text);

      // Create playlist
      const playlistId = await createPlaylist(numberedItems);

      // Find songs and add each to the playlist
      for (let i = 0; i < numberedItems.length; i++) {
        await findSongAndAddToPlaylist(numberedItems[i], playlistId);
      }
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
