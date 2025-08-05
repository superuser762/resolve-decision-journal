'use client'

import { useState, useEffect } from 'react'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

export interface MobileServicesState {
  isNative: boolean
  cameraPermission: boolean
  notificationPermission: boolean
  pushToken?: string
}

export function useMobileServices() {
  const [state, setState] = useState<MobileServicesState>({
    isNative: false,
    cameraPermission: false,
    notificationPermission: false,
  })

  useEffect(() => {
    const initializeMobileServices = async () => {
      const isNative = Capacitor.isNativePlatform()
      
      setState(prev => ({ ...prev, isNative }))

      if (isNative) {
        await requestPermissions()
        await setupPushNotifications()
      }
    }

    initializeMobileServices()
  }, [])

  const requestPermissions = async () => {
    try {
      // Request camera permissions
      const cameraPermission = await Camera.requestPermissions()
      
      // Request notification permissions
      const notificationPermission = await LocalNotifications.requestPermissions()
      
      setState(prev => ({
        ...prev,
        cameraPermission: cameraPermission.camera === 'granted',
        notificationPermission: notificationPermission.display === 'granted',
      }))
    } catch (error) {
      console.error('Error requesting permissions:', error)
    }
  }

  const setupPushNotifications = async () => {
    try {
      // Request permission to use push notifications
      await PushNotifications.requestPermissions()

      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register()

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value)
        setState(prev => ({ ...prev, pushToken: token.value }))
      })

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error))
      })

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification)
      })

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue)
      })
    } catch (error) {
      console.error('Error setting up push notifications:', error)
    }
  }

  const takePicture = async (): Promise<string | null> => {
    try {
      if (!state.cameraPermission) {
        await requestPermissions()
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      })

      return image.dataUrl || null
    } catch (error) {
      console.error('Error taking picture:', error)
      return null
    }
  }

  const selectFromGallery = async (): Promise<string | null> => {
    try {
      if (!state.cameraPermission) {
        await requestPermissions()
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      })

      return image.dataUrl || null
    } catch (error) {
      console.error('Error selecting from gallery:', error)
      return null
    }
  }

  const scheduleDecisionReminder = async (
    title: string,
    body: string,
    scheduledTime: Date
  ) => {
    try {
      if (!state.notificationPermission) {
        await requestPermissions()
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: scheduledTime },
            sound: 'default',
            attachments: [],
            actionTypeId: '',
            extra: {
              type: 'decision_reminder'
            }
          }
        ]
      })

      console.log('Decision reminder scheduled for:', scheduledTime)
    } catch (error) {
      console.error('Error scheduling notification:', error)
    }
  }

  const sendPushNotification = async (title: string, body: string) => {
    try {
      // This would typically be handled by your backend server
      // For demo purposes, we'll just log it
      console.log('Push notification would be sent:', { title, body, token: state.pushToken })
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  return {
    ...state,
    takePicture,
    selectFromGallery,
    scheduleDecisionReminder,
    sendPushNotification,
    requestPermissions,
  }
}
