import { useEffect, useState } from 'react'

interface UseTimerOptions {
  initialTime?: number
  onComplete?: () => void
}

interface UseTimerReturn {
  timeLeft: number
  isActive: boolean
  start: () => void
  reset: () => void
  stop: () => void
}

export function useTimer(
  duration: number,
  options: UseTimerOptions = {}
): UseTimerReturn {
  const { initialTime = duration, onComplete } = options
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false)
            onComplete?.()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isActive, timeLeft, onComplete])

  const start = () => {
    setIsActive(true)
  }

  const reset = () => {
    setTimeLeft(initialTime)
    setIsActive(false)
  }

  const stop = () => {
    setIsActive(false)
  }

  return {
    timeLeft,
    isActive,
    start,
    reset,
    stop,
  }
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
