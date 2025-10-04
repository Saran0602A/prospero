'use client'

import React, { useEffect, useState, ChangeEvent } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import { FiLogOut, FiEdit, FiArrowLeft } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  role: string | null
  avatar_url: string | null
  bio: string | null
  skills: string | null
  social_links: string | null
  trust_score: number | null
  rating: number | null
  created_at: string
}

interface UserPost {
  id: string
  user_id: string
  content: string | null
  image_url: string | null
  created_at: string
}

export default function LinkedInProfile() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [posts, setPosts] = useState<UserPost[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const { data: authData } = await supabase.auth.getUser()
        if (!authData.user) throw new Error('Not logged in')
        const userId = authData.user.id

        const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle()
        if (!data) {
          const { data: newUser } = await supabase
            .from('users')
            .insert({ id: userId, email: authData.user.email })
            .select()
            .single()
          setUser(newUser)
          setFormData(newUser)
          return
        }

        setUser(data)
        setFormData(data)

        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        setPosts(postsData || [])
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [supabase])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const updates = {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills,
        avatar_url: formData.avatar_url,
        social_links: formData.social_links,
      }
      const { error } = await supabase.from('users').update(updates).eq('id', user.id)
      if (!error) setUser(prev => (prev ? { ...prev, ...updates } : prev))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="text-black text-center p-6">Loading...</div>
  if (!user) return <div className="text-black text-center p-6">User not found</div>

  const socialLinks = formData.social_links
    ? formData.social_links.startsWith('{')
      ? Object.values(JSON.parse(formData.social_links))
      : formData.social_links.split(',')
    : []

  return (
    <motion.div
      className="min-h-screen bg-white flex flex-col items-center font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="self-start mt-4 ml-6 flex items-center gap-2 text-[#fca311] font-medium hover:underline"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Banner */}
      <div className="w-full h-48 bg-[#fca311]/20 relative mt-4">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md">
          {formData.avatar_url ? (
            <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#fca311] text-xl">
              No Avatar
            </div>
          )}
        </div>
        {/* Edit & Logout */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 bg-[#fca311] text-white px-3 py-2 rounded-lg hover:scale-105 transition-transform"
          >
            <FiEdit /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 border border-[#fca311] text-[#fca311] px-3 py-2 rounded-lg hover:bg-[#fca311] hover:text-white transition-colors"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 text-center flex flex-col items-center gap-3 w-full max-w-2xl px-6">
        {/* Name */}
        <input
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="Full Name"
          className="text-2xl font-bold text-[#fca311] border-b border-[#fca311]/50 px-2 py-1 w-full text-center focus:outline-none"
        />
        {/* Role */}
        <p className="text-[#fca311]/70">{user.role || 'User Role'}</p>
        {/* Bio */}
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          placeholder="Bio"
          className="w-full p-3 border border-[#fca311]/50 rounded-md text-black text-sm mt-2 focus:outline-none"
        />
        {/* Skills */}
        <input
          type="text"
          name="skills"
          value={formData.skills || ''}
          onChange={handleChange}
          placeholder="Skills (comma separated)"
          className="w-full p-2 border border-[#fca311]/50 rounded-md text-black text-sm mt-2 focus:outline-none"
        />
        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fca311] text-sm underline"
              >
                {link.length > 20 ? link.slice(0, 20) + '...' : link}
              </a>
            ))}
          </div>
        )}
        {/* Trust & Rating */}
        <div className="flex gap-6 mt-4 text-[#fca311] font-medium">
          <div>Trust Score: {user.trust_score || 0}</div>
          <div>Rating: {user.rating || 0}</div>
        </div>
      </div>

      {/* Avatar Edit Input */}
      <div className="mt-4 w-full max-w-2xl px-6 flex justify-center">
        <input
          type="text"
          name="avatar_url"
          value={formData.avatar_url || ''}
          onChange={handleChange}
          placeholder="Avatar URL"
          className="w-full p-2 border border-[#fca311]/50 rounded-md text-black text-sm focus:outline-none"
        />
      </div>

      {/* Posts */}
      <div className="mt-10 w-full max-w-3xl flex flex-col gap-6 px-6 pb-10">
        {posts.length === 0 ? (
          <p className="text-[#fca311]/70 text-center text-lg">No posts yet.</p>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              className="bg-white border border-[#fca311] rounded-xl p-5 shadow hover:shadow-lg transition-shadow"
            >
              {post.content && <p className="text-black text-base">{post.content}</p>}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full max-h-72 object-cover rounded-md mt-2"
                />
              )}
              <p className="text-[#fca311]/60 text-sm mt-1">
                Posted: {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
