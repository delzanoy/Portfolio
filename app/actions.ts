// app/actions.ts

import { getTweet } from 'react-tweet/api';

export async function getTweetData(id: string) {
    try {
        const tweet = await getTweet(id);
        if (tweet && tweet.entities) {
            tweet.entities.hashtags = tweet.entities.hashtags || [];
            tweet.entities.urls = tweet.entities.urls || [];
            tweet.entities.user_mentions = tweet.entities.user_mentions || [];
            tweet.entities.symbols = tweet.entities.symbols || [];
        }
        return tweet;
    } catch (error) {
        console.error('Error fetching tweet:', error);
        return undefined;
    }
}
