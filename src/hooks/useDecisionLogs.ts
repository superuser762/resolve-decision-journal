'use client'

import { useState, useEffect } from 'react'

export interface DecisionLog {
  id: string
  title: string
  pros: string[]
  cons: string[]
  gutFeeling: number // 0-100
  keyFactors: string[]
  status: 'Pending' | 'Decision Made' | 'Reviewing Outcome'
  reflection?: string
  outcome?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'resolve_decision_logs'
const FREE_TIER_LIMIT = 3

export function useDecisionLogs() {
  const [logs, setLogs] = useState<DecisionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load logs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedLogs = JSON.parse(stored)
        setLogs(parsedLogs)
      }
    } catch (err) {
      console.error('Error loading decision logs:', err)
      setError('Failed to load decision logs')
    } finally {
      setLoading(false)
    }
  }, [])

  // Save logs to localStorage whenever logs change
  const saveLogs = (newLogs: DecisionLog[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs))
      setLogs(newLogs)
      setError(null)
    } catch (err) {
      console.error('Error saving decision logs:', err)
      setError('Failed to save decision logs')
    }
  }

  // Add a new decision log
  const addLog = (logData: Omit<DecisionLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Check free tier limit
      const activeLogs = logs.filter(log => log.status !== 'Reviewing Outcome')
      if (activeLogs.length >= FREE_TIER_LIMIT) {
        throw new Error(`Free tier limit reached. You can only have ${FREE_TIER_LIMIT} active decision logs.`)
      }

      const newLog: DecisionLog = {
        ...logData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const newLogs = [...logs, newLog]
      saveLogs(newLogs)
      return newLog
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add decision log'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Update an existing decision log
  const updateLog = (id: string, updates: Partial<DecisionLog>) => {
    try {
      const newLogs = logs.map(log =>
        log.id === id
          ? { ...log, ...updates, updatedAt: new Date().toISOString() }
          : log
      )
      saveLogs(newLogs)
    } catch {
      const errorMessage = 'Failed to update decision log'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Delete a decision log
  const deleteLog = (id: string) => {
    try {
      const newLogs = logs.filter(log => log.id !== id)
      saveLogs(newLogs)
    } catch {
      const errorMessage = 'Failed to delete decision log'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Get active logs count (for free tier check)
  const getActiveLogsCount = () => {
    return logs.filter(log => log.status !== 'Reviewing Outcome').length
  }

  // Check if free tier limit is reached
  const isFreeTierLimitReached = () => {
    return getActiveLogsCount() >= FREE_TIER_LIMIT
  }

  return {
    logs,
    loading,
    error,
    addLog,
    updateLog,
    deleteLog,
    getActiveLogsCount,
    isFreeTierLimitReached,
    FREE_TIER_LIMIT,
  }
}
