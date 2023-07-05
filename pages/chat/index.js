import Head from "next/head";
import { useState } from "react";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import styles from "./../index.module.css";

const SubmitRequest = () => {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState();

  const chat = new ChatOpenAI({
    openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    temperature: 0,
  });

  async function onSubmit(event) {
    event.preventDefault();
    try {
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
        <div>
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
        </div>
      </main>
    </div>
  );
};

export default SubmitRequest;
