import { useState, useEffect } from 'react'
import { ticketsService } from '@/services/tickets.service'

export function useTickets() {
  const [tickets,   setTickets]   = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ticketsService.getAll().then(setTickets).finally(() => setIsLoading(false))
  }, [])

  return { tickets, isLoading }
}

export function useTicket(ticketId) {
  const [ticket,    setTicket]    = useState(null)
  const [history,   setHistory]   = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!ticketId) return
    Promise.all([
      ticketsService.getById(ticketId),
      ticketsService.getHistory(ticketId),
    ])
      .then(([t, h]) => { setTicket(t); setHistory(h) })
      .finally(() => setIsLoading(false))
  }, [ticketId])

  return { ticket, history, isLoading }
}

export function useAvailableTickets() {
  const [available, setAvailable] = useState([])
  const [sectors,   setSectors]   = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      ticketsService.getAvailable(),
      ticketsService.getSectors(),
    ])
      .then(([a, s]) => { setAvailable(a); setSectors(s) })
      .finally(() => setIsLoading(false))
  }, [])

  return { available, sectors, isLoading }
}
