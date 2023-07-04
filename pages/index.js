import Head from "next/head";
import SpotifyAuth from "./components/SpotifyAuth";
import SubmitRequest from "./components/SubmitRequest";
import styles from "./index.module.css";

export default function Home() {
  return (
    <div>
      <Head>
        <title>🎵 Song Sensei 🎵</title>
      </Head>

      <main className={styles.main}>
        <h3>🎵 Song Sensei 🎵</h3>

        <div className="App">
          <SpotifyAuth />
        </div>


        <div className="App">
          <SubmitRequest />
        </div>
      </main>
    </div>
  );
}
