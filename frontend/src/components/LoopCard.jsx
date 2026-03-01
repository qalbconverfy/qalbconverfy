import React, { useState, useEffect, useRef } from 'react'
import { FiVolume2, FiVolumeX, FiShare2 } from "react-icons/fi";
import dp from "../assets/dp.webp"
import FollowButton from './FollowButton';
import { GoHeart, GoHeartFill } from "react-icons/go";
import { MdOutlineComment } from "react-icons/md";
import { IoSendSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { setLoopData } from '../redux/loopSlice';
import axios from 'axios';
import { serverUrl } from '../App';

function LoopCard({ loop }) {

  const videoRef = useRef(null)
  const commentRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [isMute, setIsMute] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showHeart, setShowHeart] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [message, setMessage] = useState("")

  const { userData } = useSelector(state => state.user)
  const { socket } = useSelector(state => state.socket)
  const { loopData } = useSelector(state => state.loop)

  const dispatch = useDispatch()

  /* ---------------- Video Progress ---------------- */
  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (video && video.duration) {
      const percent = (video.currentTime / video.duration) * 100
      setProgress(percent)
    }
  }

  /* ---------------- Play / Pause ---------------- */
  const handleClick = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play()
      setIsPlaying(true)
    }
  }

  /* ---------------- Like ---------------- */
  const handleLike = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/loop/like/${loop._id}`,
        { withCredentials: true }
      )

      const updatedLoop = result.data
      const updatedLoops = loopData.map(p =>
        p._id === loop._id ? updatedLoop : p
      )

      dispatch(setLoopData(updatedLoops))
    } catch (error) {
      console.log(error)
    }
  }

  const handleLikeOnDoubleClick = () => {
    setShowHeart(true)
    setTimeout(() => setShowHeart(false), 600)

    if (!loop.likes?.includes(userData._id)) {
      handleLike()
    }
  }

  /* ---------------- Comment ---------------- */
  const handleComment = async () => {
    if (!message.trim()) return

    try {
      const result = await axios.post(
        `${serverUrl}/api/loop/comment/${loop._id}`,
        { message },
        { withCredentials: true }
      )

      const updatedLoop = result.data
      const updatedLoops = loopData.map(p =>
        p._id === loop._id ? updatedLoop : p
      )

      dispatch(setLoopData(updatedLoops))
      setMessage("")
    } catch (error) {
      console.log(error)
    }
  }

  /* ---------------- Share ---------------- */
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
