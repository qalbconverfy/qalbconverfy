import React, { useState, useCallback } from 'react';
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import LoopCard from '../components/LoopCard';
import { useSelector } from 'react-redux';

function Loops() {
  const navigate = useNavigate();
  const { loopData } = useSelector(state => state.loop);
  const [showAd, setShowAd] = useState(false);

  const handleShowAd = useCallback(() => {
    setShowAd(true);
    setTimeout(() => setShowAd(false), 5000); // Ad auto remove after 5 seconds
  }, []);

  return (
    <div className='w-screen h-screen bg-black overflow-hidden flex justify-center items-center'>
      <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px] fixed top-[10px] left-[10px] z-[100]'>
        <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
        <h1 className='text-white text-[20px] font-semibold'>Loops</h1>
      </div>

      <div className='h-[100vh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide'>
        {loopData.map((loop, index) => (
          <div className='h-screen snap-start' key={loop._id}>
            <LoopCard loop={loop} index={index} showAdCallback={handleShowAd} />
            {showAd && index > 0 && index % 3 === 0 && (
              <div className='absolute top-0 left-0 w-full h-full bg-black flex items-center justify-center z-50'>
                <ins className="adsbygoogle"
                     style={{display:"block"}}
                     data-ad-client="ca-pub-XXXXXXXXXXXXXX" // Replace with your AdSense client
                     data-ad-slot="YYYYYYYYYY"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Loops;
