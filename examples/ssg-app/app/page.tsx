import styles from "./page.module.css";
import { getCloudflareContext } from "@opennextjs/azion";

export default async function Home() {
  const cloudflareContext = await getCloudflareContext({
    async: true,
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Hello from a Statically generated page</h1>
        <p data-testid="my-secret">{cloudflareContext.env.MY_SECRET}</p>
      </main>
    </div>
  );
}
