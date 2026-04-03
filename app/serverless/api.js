import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());

app.get('/api/traklin', async (req, res) => {
  try {
    const { fk_content_id, page_number, pm, pfacg, prange, st } = req.query;

    if (!fk_content_id || !page_number) {
      return res.status(400).json({ error: 'Missing required params fk_content_id and page_number' });
    }

    const params = new URLSearchParams();
    params.append('fk_content_id', String(fk_content_id));
    params.append('page_number', String(page_number));
    params.append('vs', '0');
    params.append('t', Date.now().toString());

    if (pm) params.append('pm', String(pm));
    if (pfacg) params.append('pfacg', String(pfacg));
    if (prange) params.append('prange', String(prange));
    if (st) params.append('st', String(st));

    // AbortController for timeout behavior (e.g. 10s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const targetUrl = `https://www.traklin.co.il/ajax/category_contents.ashx?${params.toString()}`;
    const response = await fetch(targetUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch upstream' });
    }

    const rawData = await response.text();
    let jsonData = {};
    try {
      jsonData = JSON.parse(rawData);
    } catch(e) {
      // Return raw if it structurally fails, but usually it's JSON
      jsonData = { parseError: true, raw: rawData };
    }

    res.json(jsonData);

  } catch (error) {
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'Gateway timeout from upstream' });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serverless MVP proxy running on port ${PORT}`);
});
