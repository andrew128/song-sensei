import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState();
  const [conversationHistory, setConversationHistory] = useState([]);

  const updateConversationHistoryValue = (newConversationHistory) => {
    if (conversationHistory.length > 10) {
      newConversationHistory.shift()
    }
    setConversationHistory(newConversationHistory);
  }

  async function onSubmit(event) {
    event.preventDefault();
    try {
      let newConversationHistory = [...conversationHistory, userInput];
      updateConversationHistoryValue(newConversationHistory);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ musicRequest: newConversationHistory.join('.') }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setUserInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
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
