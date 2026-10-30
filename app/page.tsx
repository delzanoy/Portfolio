import HomeClient from "./HomeClient";
import { getTweetData } from "./actions";

export default async function Home() {
  const tweetData = await getTweetData('1590536251157147650');

  return <HomeClient tweetData={tweetData} />;
}
