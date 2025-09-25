'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle,
  Send,
  ArrowLeft,
  User,
  Clock,
  Mail,
  Phone
} from 'lucide-react'
import { localUserAPI, localMentorAPI } from '@/lib/localStorage'
import { User as UserType, Mentor } from '@/types'

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
}

export default function MessagesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      setLoading(true)
      const mentorsData = await localMentorAPI.getAllMentors()
      setMentors(mentorsData)
      
      // Simuler des messages existants
      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: user?.id || '',
          receiver_id: mentorsData[0]?.id || '',
          content: 'Bonjour, j\'aimerais discuter de mes options d\'orientation en informatique.',
          created_at: new Date().toISOString(),
          read: true
        },
        {
          id: '2',
          sender_id: mentorsData[0]?.id || '',
          receiver_id: user?.id || '',
          content: 'Bonjour ! Je serais ravi de vous aider. Pouvez-vous me dire quel est votre niveau actuel ?',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read: false
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      sender_id: user?.id || '',
      receiver_id: selectedConversation,
      content: newMessage,
      created_at: new Date().toISOString(),
      read: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const getConversationPartner = (message: Message) => {
    const partnerId = message.sender_id === user?.id ? message.receiver_id : message.sender_id
    return mentors.find(mentor => mentor.id === partnerId)
  }

  const getUnreadCount = (partnerId: string) => {
    return messages.filter(msg => 
      msg.receiver_id === user?.id && 
      msg.sender_id === partnerId && 
      !msg.read
    ).length
  }

  const getLastMessage = (partnerId: string) => {
    const conversationMessages = messages.filter(msg => 
      (msg.sender_id === user?.id && msg.receiver_id === partnerId) ||
      (msg.sender_id === partnerId && msg.receiver_id === user?.id)
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    return conversationMessages[0]
  }

  const getConversationMessages = (partnerId: string) => {
    return messages.filter(msg => 
      (msg.sender_id === user?.id && msg.receiver_id === partnerId) ||
      (msg.sender_id === partnerId && msg.receiver_id === user?.id)
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">Communiquez avec vos mentors</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push('/nav')}>
                Navigation
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {mentors.map((mentor) => {
                    const unreadCount = getUnreadCount(mentor.id)
                    const lastMessage = getLastMessage(mentor.id)
                    const isSelected = selectedConversation === mentor.id

                    return (
                      <div
                        key={mentor.id}
                        onClick={() => setSelectedConversation(mentor.id)}
                        className={`p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {(mentor.name || 'M').split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate">
                                {mentor.name}
                              </p>
                              {unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            {lastMessage && (
                              <p className="text-sm text-gray-500 truncate">
                                {lastMessage.content}
                              </p>
                            )}
                            {lastMessage && (
                              <p className="text-xs text-gray-400">
                                {new Date(lastMessage.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zone de conversation */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Header de la conversation */}
                  <CardHeader className="border-b">
                    {(() => {
                      const mentor = mentors.find(m => m.id === selectedConversation)
                      return mentor ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {(mentor.name || 'M').split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {mentor.name}
                            </CardTitle>
                            <CardDescription>
                              Mentor • {mentor.specialties.slice(0, 2).join(', ')}
                            </CardDescription>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {getConversationMessages(selectedConversation).map((message) => {
                        const isOwn = message.sender_id === user?.id
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwn ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>

                  {/* Zone de saisie */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        className="flex-1 min-h-[60px]"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Sélectionnez une conversation
                    </h3>
                    <p className="text-gray-600">
                      Choisissez un mentor pour commencer à échanger
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}


