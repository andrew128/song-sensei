import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import { BufferWindowMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState();

  const model = new OpenAI({openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, temperature: 0.8});
  const memory = new BufferWindowMemory({ k: 100 });
  const chain = new ConversationChain({ llm: model, memory: memory });

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const res = await chain.call({ input: userInput });
      console.log({ res });

      setResult(res.response);
      setUserInput("");
    } catch(error) {
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
}
