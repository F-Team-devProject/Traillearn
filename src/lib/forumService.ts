import { supabase } from './supabase'
import { Forum, ForumPost } from '@/types'

export interface ForumFilters {
  category?: string
  country?: string
  school?: string
  domain?: string
  status?: 'active' | 'pending' | 'archived'
  search?: string
}

export interface PostFilters {
  forumId?: string
  userId?: string
  status?: 'published' | 'pending' | 'deleted'
  search?: string
  pinned?: boolean
}

export interface CreateForumData {
  title: string
  description: string
  category: string
  country?: string
  school?: string
  domain?: string
  isPrivate: boolean
  tags: string[]
  createdBy: string
}

export interface CreatePostData {
  forumId: string
  title: string
  content: string
  authorId: string
  isPinned?: boolean
  tags?: string[]
  parentPostId?: string // Pour les réponses
}

export const forumService = {
  // Créer un nouveau forum
  async createForum(data: CreateForumData): Promise<{ 
    forum: Forum | null, 
    error: string | null 
  }> {
    try {
      const { data: forum, error } = await supabase
        .from('forums')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          country: data.country,
          school: data.school,
          domain: data.domain,
          is_private: data.isPrivate,
          tags: data.tags,
          owner_id: data.createdBy,
          status: 'pending', // Nécessite validation admin
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { forum: null, error: error.message }
      }

      return { forum, error: null }
    } catch (error) {
      return { forum: null, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les forums avec filtres
  async getForums(filters: ForumFilters = {}): Promise<{ 
    forums: Forum[], 
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('forums')
        .select(`
          *,
          owner:users!forums_owner_id_fkey (
            first_name,
            last_name,
            profile_picture
          ),
          moderator:users!forums_moderator_id_fkey (
            first_name,
            last_name,
            profile_picture
          )
        `)
        .eq('status', 'active')

      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.country) {
        query = query.eq('country', filters.country)
      }
      if (filters.school) {
        query = query.eq('school', filters.school)
      }
      if (filters.domain) {
        query = query.eq('domain', filters.domain)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
        .order('updated_at', { ascending: false })

      if (error) {
        return { forums: [], error: error.message }
      }

      return { forums: data || [], error: null }
    } catch (error) {
      return { forums: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer un forum par ID
  async getForumById(forumId: string): Promise<{ 
    forum: Forum | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('forums')
        .select(`
          *,
          owner:users!forums_owner_id_fkey (
            first_name,
            last_name,
            profile_picture
          ),
          moderator:users!forums_moderator_id_fkey (
            first_name,
            last_name,
            profile_picture
          )
        `)
        .eq('id', forumId)
        .single()

      if (error) {
        return { forum: null, error: error.message }
      }

      return { forum: data, error: null }
    } catch (error) {
      return { forum: null, error: 'Une erreur est survenue' }
    }
  },

  // Valider un forum (admin)
  async validateForum(forumId: string, adminId: string, approved: boolean, notes?: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('forums')
        .update({
          status: approved ? 'active' : 'rejected',
          admin_notes: notes,
          validated_by: adminId,
          validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', forumId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Assigner un modérateur à un forum
  async assignModerator(forumId: string, moderatorId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('forums')
        .update({
          moderator_id: moderatorId,
          updated_at: new Date().toISOString()
        })
        .eq('id', forumId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Créer un nouveau post
  async createPost(data: CreatePostData): Promise<{ 
    post: ForumPost | null, 
    error: string | null 
  }> {
    try {
      const { data: post, error } = await supabase
        .from('forum_posts')
        .insert({
          forum_id: data.forumId,
          title: data.title,
          content: data.content,
          author_id: data.authorId,
          is_pinned: data.isPinned || false,
          tags: data.tags || [],
          parent_post_id: data.parentPostId,
          status: 'published',
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          author:users!forum_posts_author_id_fkey (
            first_name,
            last_name,
            profile_picture
          ),
          forum:forums!forum_posts_forum_id_fkey (
            title,
            category
          )
        `)
        .single()

      if (error) {
        return { post: null, error: error.message }
      }

      // Mettre à jour la date de mise à jour du forum
      await supabase
        .from('forums')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.forumId)

      return { post, error: null }
    } catch (error) {
      return { post: null, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les posts d'un forum
  async getForumPosts(forumId: string, filters: PostFilters = {}): Promise<{ 
    posts: ForumPost[], 
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          author:users!forum_posts_author_id_fkey (
            first_name,
            last_name,
            profile_picture
          ),
          replies:forum_posts!forum_posts_parent_post_id_fkey (
            id,
            title,
            content,
            author_id,
            created_at,
            author:users!forum_posts_author_id_fkey (
              first_name,
              last_name,
              profile_picture
            )
          )
        `)
        .eq('forum_id', forumId)
        .eq('status', 'published')
        .is('parent_post_id', null) // Posts principaux seulement

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }
      if (filters.pinned) {
        query = query.eq('is_pinned', true)
      }

      const { data, error } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        return { posts: [], error: error.message }
      }

      return { posts: data || [], error: null }
    } catch (error) {
      return { posts: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les posts d'un utilisateur
  async getUserPosts(userId: string): Promise<{ 
    posts: ForumPost[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum:forums!forum_posts_forum_id_fkey (
            title,
            category,
            country,
            school
          )
        `)
        .eq('author_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        return { posts: [], error: error.message }
      }

      return { posts: data || [], error: null }
    } catch (error) {
      return { posts: [], error: 'Une erreur est survenue' }
    }
  },

  // Signaler un post
  async reportPost(postId: string, userId: string, reason: string, description?: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: userId,
          reason,
          description,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Modérer un post (supprimer, épingler, etc.)
  async moderatePost(postId: string, action: 'delete' | 'pin' | 'unpin' | 'approve', moderatorId: string, reason?: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      let updateData: any = {
        updated_at: new Date().toISOString()
      }

      switch (action) {
        case 'delete':
          updateData.status = 'deleted'
          updateData.moderation_reason = reason
          break
        case 'pin':
          updateData.is_pinned = true
          break
        case 'unpin':
          updateData.is_pinned = false
          break
        case 'approve':
          updateData.status = 'published'
          break
      }

      const { error } = await supabase
        .from('forum_posts')
        .update(updateData)
        .eq('id', postId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Ajouter une réaction à un post
  async addReaction(postId: string, userId: string, reaction: 'like' | 'dislike' | 'love' | 'laugh'): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Vérifier si l'utilisateur a déjà réagi
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (existingReaction) {
        // Mettre à jour la réaction existante
        const { error } = await supabase
          .from('post_reactions')
          .update({ reaction, updated_at: new Date().toISOString() })
          .eq('id', existingReaction.id)

        if (error) {
          return { success: false, error: error.message }
        }
      } else {
        // Créer une nouvelle réaction
        const { error } = await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: userId,
            reaction,
            created_at: new Date().toISOString()
          })

        if (error) {
          return { success: false, error: error.message }
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les réactions d'un post
  async getPostReactions(postId: string): Promise<{ 
    reactions: { reaction: string, count: number }[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('post_reactions')
        .select('reaction')
        .eq('post_id', postId)

      if (error) {
        return { reactions: [], error: error.message }
      }

      // Compter les réactions par type
      const reactionCounts = data?.reduce((acc: Record<string, number>, item) => {
        acc[item.reaction] = (acc[item.reaction] || 0) + 1
        return acc
      }, {}) || {}

      const reactions = Object.entries(reactionCounts)
        .map(([reaction, count]) => ({ reaction, count }))
        .sort((a, b) => b.count - a.count)

      return { reactions, error: null }
    } catch (error) {
      return { reactions: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les forums en attente de validation (admin)
  async getPendingForums(): Promise<{ 
    forums: Forum[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('forums')
        .select(`
          *,
          owner:users!forums_owner_id_fkey (
            first_name,
            last_name,
            email,
            profile_picture
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) {
        return { forums: [], error: error.message }
      }

      return { forums: data || [], error: null }
    } catch (error) {
      return { forums: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les signalements (admin/moderator)
  async getPostReports(): Promise<{ 
    reports: Array<{
      id: string
      post_id: string
      reporter_id: string
      reason: string
      description?: string
      status: string
      created_at: string
      post: {
        title: string
        content: string
        author_id: string
        forum_id: string
        author: {
          first_name: string
          last_name: string
        }
        forum: {
          title: string
        }
      }
      reporter: {
        first_name: string
        last_name: string
      }
    }>, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('post_reports')
        .select(`
          *,
          post:forum_posts!post_reports_post_id_fkey (
            title,
            content,
            author_id,
            forum_id,
            author:users!forum_posts_author_id_fkey (
              first_name,
              last_name
            ),
            forum:forums!forum_posts_forum_id_fkey (
              title
            )
          ),
          reporter:users!post_reports_reporter_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        return { reports: [], error: error.message }
      }

      return { reports: data || [], error: null }
    } catch (error) {
      return { reports: [], error: 'Une erreur est survenue' }
    }
  },

  // Résoudre un signalement (admin/moderator)
  async resolveReport(reportId: string, action: 'dismiss' | 'delete_post', moderatorId: string, notes?: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Mettre à jour le statut du signalement
      const { error: reportError } = await supabase
        .from('post_reports')
        .update({
          status: 'resolved',
          resolved_by: moderatorId,
          resolution_notes: notes,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (reportError) {
        return { success: false, error: reportError.message }
      }

      // Si l'action est de supprimer le post
      if (action === 'delete_post') {
        const { error: postError } = await supabase
          .from('forum_posts')
          .update({
            status: 'deleted',
            moderation_reason: notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', reportId)

        if (postError) {
          return { success: false, error: postError.message }
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les statistiques d'un forum
  async getForumStats(forumId: string): Promise<{ 
    stats: {
      totalPosts: number
      totalReplies: number
      activeUsers: number
      lastActivity: string | null
    }, 
    error: string | null 
  }> {
    try {
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select('id, author_id, created_at, parent_post_id')
        .eq('forum_id', forumId)
        .eq('status', 'published')

      if (postsError) {
        return { 
          stats: { totalPosts: 0, totalReplies: 0, activeUsers: 0, lastActivity: null }, 
          error: postsError.message 
        }
      }

      const totalPosts = posts?.filter(p => !p.parent_post_id).length || 0
      const totalReplies = posts?.filter(p => p.parent_post_id).length || 0
      const activeUsers = new Set(posts?.map(p => p.author_id)).size
      const lastActivity = posts?.length > 0 
        ? posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null

      return {
        stats: {
          totalPosts,
          totalReplies,
          activeUsers,
          lastActivity
        },
        error: null
      }
    } catch (error) {
      return { 
        stats: { totalPosts: 0, totalReplies: 0, activeUsers: 0, lastActivity: null }, 
        error: 'Une erreur est survenue' 
      }
    }
  }
}
