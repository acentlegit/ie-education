// LiveKit API service
import { getAPIURL } from './httpsHelper'
const API_BASE_URL = getAPIURL() || '' // Use empty string for relative URLs (CloudFront proxy)

export const getToken = async (name, room, role = 'host') => {
  try {
    const base = API_BASE_URL || ''
    const url = base ? `${base}/token?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}&role=${role}` : `/token?name=${encodeURIComponent(name)}&room=${encodeURIComponent(room)}&role=${role}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to get token')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting token:', error)
    // Fallback for demo - return mock token
    return {
      token: 'demo_token',
      url: 'wss://demo.livekit.cloud'
    }
  }
}

export const startRTMPStream = async (room, rtmpUrl) => {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/stream/rtmp` : '/stream/rtmp'
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, rtmpUrl })
    })
    return await response.json()
  } catch (error) {
    console.error('Error starting RTMP stream:', error)
    return { egressId: null }
  }
}

export const startRecording = async (room) => {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/stream/record` : '/stream/record'
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room })
    })
    return await response.json()
  } catch (error) {
    console.error('Error starting recording:', error)
    return { egressId: null }
  }
}

export const kickParticipant = async (room, identity) => {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/moderate/kick` : '/moderate/kick'
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, identity })
    })
    return response.ok
  } catch (error) {
    console.error('Error kicking participant:', error)
    return false
  }
}

