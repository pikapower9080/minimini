import { useEffect, useState } from 'react'
import './App.css'
import type { MiniCrossword } from './lib/types'
import Mini from './Components/Mini';

function App() {
  const [data, setData] = useState<MiniCrossword | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem('mini-cache');
    const cachedDate = localStorage.getItem('mini-cache-date');
    const today = new Date().toISOString().split('T')[0];

    if (cached && cachedDate && cachedDate.split('T')[0] === today) {
      setData(JSON.parse(cached));
      return;
    }
    fetch("https://corsanywhere.vercel.app/www.nytimes.com/svc/crosswords/v6/puzzle/mini.json").then(res => res.json()).then(json => {
      setData(json);
      localStorage.setItem('mini-cache', JSON.stringify(json));
      localStorage.setItem('mini-cache-date', new Date().toISOString());
    });
  }, []);

  return (
    <>
      {/* <h2>Minimini</h2> */}
      {data ? <Mini data={data} /> : <p>Loading...</p>}
    </>
  )
}

export default App
