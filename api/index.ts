import express from 'express';
import { Cache } from 'memory-cache'

const cache = new Cache();

const port = process.env.PORT || 3000;

const app = express();

async function fetchJSONWithCache(url:string, ttl = 1000 * 60 * 10) {
	if (cache.get(url)) {
		return cache.get(url)
	}
	const res = await fetch(url)
	const json = await res.json()
	cache.put(url, json, ttl)
	console.log(`Caching response for ${url}`)
	return json
}

app.get('/api/today', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	try {
		const data = await fetchJSONWithCache('https://www.nytimes.com/svc/crosswords/v6/puzzle/mini.json');
		return res.status(200).json(data);
	} catch(err) {
		console.error(err);
		return res.status(500).json({ error: 'Failed to fetch data' });
	}
})

app.listen(port, () => console.log(`Listening on port ${port}`))