import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { FiVolume2 } from "react-icons/fi";
import { FiShare2 } from "react-icons/fi";
import { FiVolumeX } from "react-icons/fi";
import dp from "../assets/dp.webp"
import FollowButton from './FollowButton';
import { GoHeart } from "react-icons/go";
import { GoHeartFill } from "react-icons/go";
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineComment } from "react-icons/md";
import { setLoopData } from '../redux/loopSlice';
import axios from 'axios';
import { serverUrl } from '../App';
import { IoSendSharp } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaLink } from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { FaTelegram } from "react-icons/fa";
import { FaReddit } from "react-icons/fa";

function LoopCard({ loop }) {
    const videoRef = useRef()
    const [isPlaying, setIsPlaying] = useState(true)
    const [isMute, setIsMute] = useState(false)
    const [progress, setProgress] = useState(0)
    const { userData } = useSelector(state => state.user)
    const { socket } = useSelector(state => state.socket)
    const { loopData } = useSelector(state => state.loop)
    const [showHeart, setShowHeart] = useState(false)
    const [showComment, setShowComment] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [message, setMessage] = useState("")
    const [shareLinkCopied, setShareLinkCopied] = useState(false)
    const dispatch = useDispatch()
    const commentRef = useRef()
    const shareRef = useRef()

    const handleTimeUpdate = () => {
        const video = videoRef.current
        if (video) {
            const percent = (video.currentTime / video.duration) * 100
            setProgress(percent)
        }
    }

    const handleLikeOnDoubleClick = () => {
        setShowHeart(true)
        setTimeout(() => setShowHeart(false), 6000)
        if (!loop.likes?.includes(userData._id)) {
            handleLike()
        }
    }

    const handleClick = () => {
        if (isPlaying) {
            videoRef.current.pause()
            setIsPlaying(false)
        } else {
            videoRef.current.play()
            setIsPlaying(true)
        }
    }

    const handleLike = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/loop/like/${loop._id}`, { withCredentials: true })
            const updatedLoop = result.data

            const updatedLoops = loopData.map(p => p._id == loop._id ? updatedLoop : p)
            dispatch(setLoopData(updatedLoops))
        } catch (error) {
            console.log(error)
        }
    }

    const handleComment = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/loop/comment/${loop._id}`, { message }, { withCredentials: true })
            const updatedLoop = result.data

            const updatedLoops = loopData.map(p => p._id == loop._id ? updatedLoop : p)
            dispatch(setLoopData(updatedLoops))
            setMessage("")
        } catch (error) {
            console.log(error)
        }
    }

    // Share functionality
    const getShareUrl = () => {
        return `${window.location.origin}/loop/${loop._id}`
    }

    const handleShare = (platform) => {
        const shareUrl = getShareUrl()
        const text = `Check out this loop by ${loop.author?.userName}: ${loop.caption || 'Amazing video!'}`
        const encodedText = encodeURIComponent(text)
        const encodedUrl = encodeURIComponent(shareUrl)

        let shareLink = ''

        switch (platform) {
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
                break
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
                break
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
                break
            case 'telegram':
                shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
                break
            case 'reddit':
                shareLink = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`
                break
            case 'copy':
                navigator.clipboard.writeText(shareUrl)
                setShareLinkCopied(true)
                setTimeout(() => setShareLinkCopied(false), 2000)
                return
            default:
                return
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'noopener,noreferrer')
        }
    }

    const handleNativeShare = async () => {
        const shareUrl = getShareUrl()
        const shareData = {
            title: `Loop by ${loop.author?.userName}`,
            text: loop.caption || 'Check out this amazing loop!',
            url: shareUrl
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (error) {
                console.log('Error sharing:', error)
            }
        } else {
            // Fallback to custom share modal
            setShowShare(true)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (commentRef.current && !commentRef.current.contains(event.target)) {
                setShowComment(false)
            }
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setShowShare(false)
            }
        }

        if (showComment || showShare) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showComment, showShare])

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            const video = videoRef.current
            if (entry.isIntersecting) {
                video.play()
                setIsPlaying(true)
            } else {
                video.pause()
                setIsPlaying(false)
            }
        }, { threshold: 0.6 })

        if (videoRef.current) {
            observer.observe(videoRef.current)
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current)
            }
        }
    }, [])

    useEffect(() => {
        socket?.on("likedLoop", (updatedData) => {
            const updatedLoops = loopData.map(p => p._id == updatedData.loopId ? { ...p, likes: updatedData.likes } : p)
            dispatch(setLoopData(updatedLoops))
        })
        socket?.on("commentedLoop", (updatedData) => {
            const updatedLoops = loopData.map(p => p._id == updatedData.loopId ? { ...p, comments: updatedData.comments } : p)
            dispatch(setLoopData(updatedLoops))
        })

        return () => {
            socket?.off("likedLoop")
            socket?.off("commentedLoop")
        }
    }, [socket, loopData, dispatch])

    return (
        <div className='w-full lg:w-[480px] h-[100vh] flex items-center justify-center border-l-2 border-r-2 border-gray-800 relative overflow-hidden'>

            {/* Heart Animation */}
            {showHeart && <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 heart-animation z-50'>
                <GoHeartFill className='w-[100px] h-[100px] text-white drop-shadow-2xl' />
            </div>}

            {/* Comments Modal */}
            <div ref={commentRef} className={`absolute z-[200] bottom-0 w-full h-[500px] p-[10px] rounded-t-4xl transform transition-transform duration-500 ease-in-out left-0 shadow-2xl shadow-black ${showComment ? "translate-y-0" : "translate-y-[100%]"}`} style={{ backgroundImage: 'url(/bgi.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <h1 className='text-white text-[20px] text-center font-semibold'>Comments</h1>

                <div className='w-full h-[350px] overflow-y-auto flex flex-col gap-[20px]'>
                    {loop.comments.length == 0 && <div className='text-center text-white text-[20px] font-semibold mt-[50px]'>No Comments Yet</div>}

                    {loop.comments?.map((com, index) => (
                        <div key={index} className='w-full flex flex-col gap-[5px] border-b-[1px] border-gray-800 justify-center pb-[10px] mt-[10px]'>
                            <div className='flex justify-start items-center md:gap-[20px] gap-[10px]'>
                                <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                                    <img src={com.author?.profileImage || dp} alt="" className='w-full h-full object-cover' />
                                </div>
                                <div className='w-[150px] font-semibold text-white truncate'>{com.author?.userName}</div>
                            </div>
                            <div className='text-white pl-[60px]'>{com.message}</div>
                        </div>
                    ))}
                </div>

                <div className='w-full fixed bottom-0 h-[80px] flex items-center justify-between px-[20px] py-[20px] bg-black bg-opacity-50 backdrop-blur-sm'>
                    <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                        <img src={userData?.profileImage || dp} alt="" className='w-full h-full object-cover' />
                    </div>
                    <input 
                        type="text" 
                        className='px-[10px] border-b-2 border-b-gray-500 w-[90%] text-white placeholder:text-white outline-none h-[40px] bg-transparent' 
                        placeholder='Write comment...' 
                        onChange={(e) => setMessage(e.target.value)} 
                        value={message}
                    />
                    {message && <button className='absolute right-[20px] cursor-pointer' onClick={handleComment}><IoSendSharp className='w-[25px] h-[25px] text-white' /></button>}
                </div>
            </div>

            {/* Share Modal */}
            <div ref={shareRef} className={`absolute z-[200] bottom-0 w-full p-[20px] rounded-t-4xl transform transition-transform duration-500 ease-in-out left-0 shadow-2xl shadow-black ${showShare ? "translate-y-0" : "translate-y-[100%]"}`} style={{ backgroundImage: 'url(/bgi.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className='flex justify-between items-center mb-[20px]'>
                    <h1 className='text-white text-[20px] font-semibold'>Share Loop</h1>
                    <IoClose className='w-[30px] h-[30px] text-white cursor-pointer' onClick={() => setShowShare(false)} />
                </div>

                {/* Share Options */}
                <div className='grid grid-cols-4 gap-[15px] mb-[20px]'>
                    <button onClick={() => handleShare('whatsapp')} className='flex flex-col items-center gap-[5px]'>
                        <div className='w-[50px] h-[50px] bg-green-600 rounded-full flex items-center justify-center'>
                            <FaWhatsapp className='w-[30px] h-[30px] text-white' />
                        </div>
                        <span className='text-white text-[12px]'>WhatsApp</span>
                    </button>

                    <button onClick={() => handleShare('facebook')} className='flex flex-col items-center gap-[5px]'>
                        <div className='w-[50px] h-[50px] bg-blue-600 rounded-full flex items-center justify-center'>
                            <FaFacebook className='w-[30px] h-[30px] text-white' />
                        </div>
                        <span className='text-white text-[12px]'>Facebook</span>
                    </button>

                    <button onClick={() => handleShare('twitter')} className='flex flex-col items-center gap-[5px]'>
                        <div className='w-[50px] h-[50px] bg-blue-400 rounded-full flex items-center justify-center'>
                            <FaTwitter className='w-[30px] h-[30px] text-white' />
                        </div>
                        <span className='text-white text-[12px]'>Twitter</span>
                    </button>

                    <button onClick={() => handleShare('telegram')} className='flex flex-col items-center gap-[5px]'>
                        <div className='w-[50px] h-[50px] bg-blue-500 rounded-full flex items-center justify-center'>
                            <FaTelegram className='w-[30px] h-[30px] text-white' />
                        </div>
                        <span className='text-white text-[12px]'>Telegram</span>
                    </button>

                    <button onClick={() => handleShare('reddit')} className='flex flex-col items-center gap-[5px]'>
                        <div className='w-[50px] h-[50px] bg-orange-600 rounded-full flex items-center justify-center'>
                            <FaReddit className='w-[30px] h-[30px] text-white' />
                        </div>
                        <span className='text-white text-[12px]'>Reddit</span>
                    </button>
                </div>

                {/* Copy Link Section */}
                <div className='mt-[20px] border-t border-gray-700 pt-[20px]'>
                    <div className='flex items-center gap-[10px] bg-black bg-opacity-50 rounded-lg p-[10px]'>
                        <FaLink className='w-[20px] h-[20px] text-gray-400' />
                        <input 
                            type="text" 
                            value={getShareUrl()} 
                            readOnly 
                            className='flex-1 bg-transparent text-white outline-none text-[14px]'
                        />
                        <button 
                            onClick={() => handleShare('copy')}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-[15px] py-[8px] rounded-lg text-[14px] flex items-center gap-[5px] transition-colors'
                        >
                            {shareLinkCopied ? (
                                <>
                                    <FaCheck className='w-[14px] h-[14px]' />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <FaCopy className='w-[14px] h-[14px]' />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Video */}
            <video 
                ref={videoRef} 
                autoPlay 
                muted={isMute} 
                loop 
                src={loop?.media} 
                className='w-full max-h-full object-contain' 
                onClick={handleClick} 
                onTimeUpdate={handleTimeUpdate} 
                onDoubleClick={handleLikeOnDoubleClick}
            />

            {/* Mute/Unmute Button */}
            <div className='absolute top-[20px] z-[100] right-[20px] cursor-pointer bg-black bg-opacity-50 p-[8px] rounded-full' onClick={() => setIsMute(prev => !prev)}>
                {!isMute ? <FiVolume2 className='w-[20px] h-[20px] text-white' /> : <FiVolumeX className='w-[20px] h-[20px] text-white' />}
            </div>

            {/* Progress Bar */}
            <div className='absolute bottom-0 w-full h-[5px] bg-gray-900'>
                <div className='h-full bg-white transition-all duration-200 ease-linear' style={{ width: `${progress}%` }}></div>
            </div>

            {/* Bottom Controls */}
            <div className='w-full absolute h-[100px] bottom-[10px] p-[10px] flex flex-col gap-[10px]'>
                <div className='flex items-center gap-[5px]'>
                    <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                        <img src={loop.author?.profileImage || dp} alt="" className='w-full h-full object-cover' />
                    </div>
                    <div className='w-[120px] font-semibold truncate text-white'>{loop.author?.userName}</div>
                    <FollowButton targetUserId={loop.author?._id} tailwind={"px-[10px] py-[5px] text-white border-2 text-[14px] rounded-[10px] border-white"} />
                </div>

                <div className='text-white px-[10px] text-shadow'>
                    {loop.caption}
                </div>

                {/* Right Side Actions */}
                <div className='absolute right-0 flex flex-col gap-[20px] text-white bottom-[150px] justify-center px-[10px]'>
                    {/* Like Button */}
                    <div className='flex flex-col items-center cursor-pointer'>
                        <div onClick={handleLike}>
                            {!loop.likes?.includes(userData._id) && <GoHeart className='w-[25px] cursor-pointer h-[25px] hover:scale-110 transition-transform' />}
                            {loop.likes?.includes(userData._id) && <GoHeartFill className='w-[25px] cursor-pointer h-[25px] text-red-500 hover:scale-110 transition-transform' />}
                        </div>
                        <div className='text-[12px]'>{loop.likes?.length || 0}</div>
                    </div>

                    {/* Comment Button */}
                    <div className='flex flex-col items-center cursor-pointer' onClick={() => setShowComment(true)}>
                        <div><MdOutlineComment className='w-[25px] cursor-pointer h-[25px] hover:scale-110 transition-transform' /></div>
                        <div className='text-[12px]'>{loop.comments?.length || 0}</div>
                    </div>

                    {/* Share Button - NEW */}
                    <div className='flex flex-col items-center cursor-pointer' onClick={handleNativeShare}>
                        <div><FiShare2 className='w-[25px] cursor-pointer h-[25px] hover:scale-110 transition-transform' /></div>
                        <div className='text-[12px]'>Share</div>
                    </div>
                </div>
            </div>

            {/* Custom CSS for text shadow */}
            <style jsx>{`
                .text-shadow {
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    )
}

export default LoopCard  /* ---------------- Share ---------------- */
  const handleShare = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/loop/share/${loop._id}`,
        {},
        { withCredentials: true }
      )

      const updatedLoop = result.data
      const updatedLoops = loopData.map(p =>
        p._id === loop._id ? updatedLoop : p
      )

      dispatch(setLoopData(updatedLoops))

      const shareUrl = `${window.location.origin}/loop/${loop._id}`

      if (navigator.share) {
        await navigator.share({
          title: "Watch this reel on QalbConverfy",
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert("Link copied!")
      }

    } catch (error) {
      console.log(error)
    }
  }

  /* ---------------- Close Comment Modal ---------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        setShowComment(false)
      }
    }

    if (showComment) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showComment])

  /* ---------------- Auto Play on Scroll ---------------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current
        if (!video) return

        if (entry.isIntersecting) {
          video.play()
          setIsPlaying(true)
        } else {
          video.pause()
          setIsPlaying(false)
        }
      },
      { threshold: 0.6 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  /* ---------------- Socket Real-time Updates ---------------- */
  useEffect(() => {
    socket?.on("likedLoop", (updatedData) => {
      const updatedLoops = loopData.map(p =>
        p._id === updatedData.loopId
          ? { ...p, likes: updatedData.likes }
          : p
      )
      dispatch(setLoopData(updatedLoops))
    })

    socket?.on("commentedLoop", (updatedData) => {
      const updatedLoops = loopData.map(p =>
        p._id === updatedData.loopId
          ? { ...p, comments: updatedData.comments }
          : p
      )
      dispatch(setLoopData(updatedLoops))
    })

    return () => {
      socket?.off("likedLoop")
      socket?.off("commentedLoop")
    }
  }, [socket, loopData, dispatch])

  /* ======================== UI ======================== */

  return (
    <div className='w-full lg:w-[480px] h-[100vh] flex items-center justify-center border-l-2 border-r-2 border-gray-800 relative overflow-hidden'>

      {/* Double Tap Heart */}
      {showHeart && (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'>
          <GoHeartFill className='w-[100px] h-[100px] text-white drop-shadow-2xl' />
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        muted={isMute}
        loop
        src={loop?.media}
        className='w-full max-h-full'
        onClick={handleClick}
        onTimeUpdate={handleTimeUpdate}
        onDoubleClick={handleLikeOnDoubleClick}
      />

      {/* Volume */}
      <div
        className='absolute top-[20px] right-[20px] z-[100]'
        onClick={() => setIsMute(prev => !prev)}
      >
        {!isMute
          ? <FiVolume2 className='w-[20px] h-[20px] text-white' />
          : <FiVolumeX className='w-[20px] h-[20px] text-white' />
        }
      </div>

      {/* Progress */}
      <div className='absolute bottom-0 w-full h-[5px] bg-gray-900'>
        <div
          className='h-full bg-white transition-all duration-200'
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Right Side Actions */}
      <div className='absolute right-0 flex flex-col gap-[20px] text-white bottom-[150px] px-[10px]'>

        {/* Like */}
        <div className='flex flex-col items-center cursor-pointer'>
          <div onClick={handleLike}>
            {!loop.likes.includes(userData._id)
              ? <GoHeart className='w-[25px] h-[25px]' />
              : <GoHeartFill className='w-[25px] h-[25px] text-blue-600' />
            }
          </div>
          <div>{loop.likes.length}</div>
        </div>

        {/* Comment */}
        <div className='flex flex-col items-center cursor-pointer' onClick={() => setShowComment(true)}>
          <MdOutlineComment className='w-[25px] h-[25px]' />
          <div>{loop.comments.length}</div>
        </div>

        {/* Share */}
        <div className='flex flex-col items-center cursor-pointer' onClick={handleShare}>
          <FiShare2 className='w-[25px] h-[25px]' />
          <div>{loop.shares || 0}</div>
        </div>

      </div>
    </div>
  )
}

export default LoopCard
