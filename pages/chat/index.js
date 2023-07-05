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

const SubmitRequest = () => {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState();

  const chat = new ChatOpenAI({
    openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    temperature: 0,
  });

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
      const code = getResponseCode();
      const res = await chat.call([
        new SystemChatMessage(
          "You are a helpful assistant that comes up with a playlist of songs." +
            "You will give the playlist of songs in a numbered list." +
            "If you can't interpret a message as a song request you will truthfully say you do not know."
        ),
        new HumanChatMessage(userInput),
      ]);
      console.log({ res });

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
