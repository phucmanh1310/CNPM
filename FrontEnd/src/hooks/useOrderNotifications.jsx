import React, { useState } from 'react'

function useOrderNotifications() {
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
    }
    setNotifications((prev) => [...prev, notification])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return { notifications, addNotification, removeNotification }
}

export default useOrderNotifications
