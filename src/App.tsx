import { useEffect, useState } from 'react'
import './App.css'
import type { MiniCrossword } from './lib/types'
import Mini from './Components/Mini';
import Modal from 'react-responsive-modal';

function App() {
  const [data, setData] = useState<MiniCrossword | null>(null);
  const [modalOpen, setModalOpen] = useState(true);
  // const [paused, setPaused] = useState(false);

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
      {data && <Modal open={modalOpen} onClose={() => {}} showCloseIcon={false} center classNames={{ modal: 'welcome-modal' }}>
        <h2>Welcome to minimini</h2>
        <h4>{new Date(data.publicationDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).replace(/\b(\d{1,2})\b/, (match) => {
          const suffix = ['th', 'st', 'nd', 'rd'];
          const day = parseInt(match, 10);
          const value = day % 100;
          return day + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
        })}</h4>
        <h4>by {data.constructors.join(", ")}</h4>
        <button onClick={() => {
          setModalOpen(false);
        }}>Start Solving</button>
      </Modal>}
      {data && !modalOpen ? <Mini data={data} /> : <p>Loading...</p>}
    </>
  )
}

export default App
