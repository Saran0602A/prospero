'use client'

import React, { useEffect, useState, ChangeEvent } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import { FiLogOut, FiEdit, FiArrowLeft, FiStar } from "react-icons/fi"
import { useRouter } from "next/navigation"
import Image from "next/image" // Added Image import

// --- Types ---
interface UserProfile {
  id: string
  name: string | null
  email: string | null
  role: "worker" | "employer" | null
  avatar_url: string | null
  banner_url: string | null
  bio: string | null
  skills: string | null
  social_links: string | null
  trust_score: number | null
  rating: number | null
  created_at: string
}

interface Job {
  id: string
  title: string
  pay: number
  category: string
  location: string
  status: string
  created_at: string
  posted_by: string // Ensure job has poster ID for comparison
}

interface Post {
  id: string
  user_id: string
  content: string | null
  image_url: string | null
  created_at: string
}

// --- Component ---
export default function ProsperaProfile({ userIdParam }: { userIdParam?: string }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [jobs, setJobs] = useState<Job[]>([])

  // --- Mobile detection ---
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // --- Utility ---
  const parseSkills = (raw?: string | string[] | null) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.map(s => String(s).trim()).filter(Boolean)
    if (typeof raw === "string" && raw.startsWith("[")) {
      try {
        const arr = JSON.parse(raw)
        if (Array.isArray(arr)) return arr.map(s => String(s).trim()).filter(Boolean)
      } catch (e) { console.error("Error parsing skills JSON:", e) }
    }
    if (typeof raw === "string") return raw.split(",").map(s => s.trim()).filter(Boolean)
    return []
  }

  // --- Fetch profile, posts, jobs ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        // Current user
        const { data: authData } = await supabase.auth.getUser()
        if (!authData.user) throw new Error("Not logged in")
        const loggedId = authData.user.id

        const { data: currUserData } = await supabase
          .from("users")
          .select("*")
          .eq("id", loggedId)
          .maybeSingle()
        setCurrentUser(currUserData || null)

        const profileId = userIdParam || loggedId

        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", profileId)
          .maybeSingle()
        if (!profileData) throw new Error("User not found")
        setUser(profileData)
        setFormData(profileData)

        // Posts
        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false })
        setPosts(postsData || [])

        // Jobs
        const jobsQuery = profileData.role === "worker"
          ? supabase.from("applications").select(`job_id(id,title,pay,category,location,status,created_at, posted_by)`).eq("worker_id", profileId) // Added posted_by
          : supabase.from("jobs").select("*").eq("posted_by", profileId)

        const { data: jobsData } = await jobsQuery
        if (profileData.role === "worker") setJobs((jobsData || []).map((j: any) => ({ ...j.job_id, posted_by: j.job_id.posted_by }))) // Map to include posted_by
        else setJobs(jobsData || [])

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [supabase, userIdParam])

  // --- Handlers ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const updates = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        skills: formData.skills,
        avatar_url: formData.avatar_url,
        banner_url: formData.banner_url,
        social_links: formData.social_links
      }
      await supabase.from("users").update(updates).eq("id", user.id)
      setUser(prev => prev ? { ...prev, ...updates } : prev)
      setEditOpen(false)
    } finally { setSaving(false) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // --- Trust ---
  const handleTrust = async () => {
    if (!user || !currentUser || currentUser.id === user.id) return
    const { data: existing } = await supabase
      .from("trusts")
      .select("*")
      .eq("trusted_user_id", user.id)
      .eq("truster_id", currentUser.id)
      .single()
    if (existing) return alert("Already trusted")
    await supabase.from("trusts").insert({ trusted_user_id: user.id, truster_id: currentUser.id })
    const { count } = await supabase.from("trusts").select("*", { count: "exact", head: true }).eq("trusted_user_id", user.id)
    await supabase.from("users").update({ trust_score: count }).eq("id", user.id)
    setUser(prev => prev ? { ...prev, trust_score: count } : prev)
  }

  // --- Rating ---
  const handleRating = async (score: number) => {
    if (!user || !currentUser || currentUser.id === user.id) return
    const { data: existing } = await supabase
      .from("ratings")
      .select("*")
      .eq("rated_user_id", user.id)
      .eq("rater_id", currentUser.id)
      .single()
    if (existing) await supabase.from("ratings").update({ score }).eq("id", existing.id)
    else await supabase.from("ratings").insert({ rated_user_id: user.id, rater_id: currentUser.id, score })
    const { data: allRatings } = await supabase.from("ratings").select("score").eq("rated_user_id", user.id)
    const avg = allRatings?.reduce((a, b) => a + b.score, 0) / (allRatings?.length || 1)
    await supabase.from("users").update({ rating: avg }).eq("id", user.id)
    setUser(prev => prev ? { ...prev, rating: avg } : prev)
  }

  // --- Job Click Handler ---
  const handleJobClick = (job: Job) => {
    if (!currentUser) {
        return router.push('/Signup'); // Must be logged in
    }
    
    // Check if the current user is the poster of the job
    if (job.posted_by === currentUser.id) {
        // Redirect employer to their dashboard or management view
        return router.push(`/Dasboard/${currentUser.id}`);
    }
    
    // Check if the user is a worker (who would apply)
    if (currentUser.role === 'worker') {
        // Worker navigates to the application page
        return router.push(`/Apply/${job.id}`);
    }

    // Default: View the job details page (if applicable)
    // We default to applying since /Find/[id] is the general feed route
    router.push(`/Apply/${job.id}`);
  };


  // --- Render ---
  if (loading) return <div className="text-black text-center p-6">Loading...</div>
  if (!user) return <div className="text-black text-center p-6">User not found</div>

  return (
    <motion.div className="min-h-screen bg-gray-50 flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Top bar */}
      <div className="w-full max-w-6xl flex items-center justify-between py-4 px-6">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-gray-700 hover:text-gray-900"><FiArrowLeft /> Back</button>
        <div className="flex items-center gap-3">
          {currentUser?.id !== user.id && (
            <>
              <button onClick={handleTrust} className="px-3 py-1 rounded-lg bg-[#fca311] text-white font-semibold hover:scale-105 transition">Trust</button>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">Rate:</span>
                {[1,2,3,4,5].map(i => (
                  <FiStar key={i} className={`cursor-pointer ${i <= (user.rating || 0) ? "text-[#fca311]" : "text-gray-300"}`} onClick={() => handleRating(i)} />
                ))}
              </div>
            </>
          )}
          {currentUser?.id === user.id && <button onClick={() => setEditOpen(true)} className="px-4 py-2 bg-[#0b72ff] text-white rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"><FiEdit /> Edit</button>}
          <button onClick={handleLogout} className="px-3 py-2 border border-[#0b72ff] text-[#0b72ff] rounded-lg hover:bg-[#0b72ff] hover:text-white transition">Logout</button>
        </div>
      </div>

      {/* Banner + Avatar */}
      <div className="w-full max-w-6xl bg-white rounded-xl overflow-hidden shadow-sm mb-6">
        {/* Banner - Check for Image component usage compatibility */}
        <div className="w-full h-52 bg-center bg-cover" style={{ backgroundImage: `url(${user.banner_url || "/default-banner.jpg"})` }} />
        <div className="px-6 -mt-16 flex items-end gap-6">
          <div className="w-36 h-36 bg-white rounded-full shadow-lg overflow-hidden border-4 border-white flex items-center justify-center text-3xl text-[#0b72ff] font-bold">
            {/* Avatar - Assuming external URL is allowed via next.config.js or using standard img tag */}
            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : (user.name || "U").charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name} <span className="text-sm text-gray-500">• {user.role}</span></h1>
            <p className="text-gray-600 mt-1">{user.bio || "No bio yet."}</p>
            <div className="mt-2 flex flex-wrap gap-2">{parseSkills(user.skills).map((s,i) => <span key={i} className="px-2 py-1 rounded-full bg-[#0b72ff]/20 text-[#0b72ff] text-xs">{s}</span>)}</div>
            <div className="mt-3 flex gap-4">
              <div className="text-[#fca311] font-semibold">Trust: {user.trust_score ?? 0}</div>
              <div className="text-[#fca311] font-semibold">Rating: {(user.rating || 0).toFixed(1)}/5</div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs & Posts */}
      <div className={`w-full max-w-6xl grid gap-6 px-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
        {/* Jobs */}
        <div className={`${isMobile ? "" : "lg:col-span-1"} bg-white rounded-xl p-6 shadow`}>
          <h3 className="font-semibold mb-2">{user.role === "worker" ? "Joined Jobs" : "Posted Jobs"}</h3>
          {jobs.length === 0 ? (
            <div className="text-gray-500 text-sm">No jobs yet.</div>
          ) : jobs.map(job => (
            <div
              key={job.id}
              className="border p-2 rounded-md mb-2 hover:bg-gray-50 transition cursor-pointer" // Re-added cursor-pointer
              onClick={() => handleJobClick(job)} // Added click handler
            >
              <div className="font-semibold">{job.title}</div>
              <div className="text-xs text-gray-500">{job.category} • ${job.pay}</div>
            </div>
          ))}
        </div>

        {/* Posts */}
        <div className={`${isMobile ? "" : "lg:col-span-2"} flex flex-col gap-6`}>
          <h3 className="font-semibold">Posts</h3>
          {posts.length === 0 ? (
            <div className="text-gray-500 text-center p-4 bg-white rounded-xl shadow">No posts yet</div>
          ) : posts.map(post => (
            <div
              key={post.id}
              className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition" 
            >
              {post.content && <p>{post.content}</p>}
              {post.image_url && <img src={post.image_url} className="w-full mt-2 rounded-md max-h-96 object-cover" alt="post image" />}
              <div className="text-xs text-gray-400 mt-1">{new Date(post.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal (Modal logic unchanged) */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-3xl bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="px-3 py-1 rounded-md">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium">Full Name</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
                <label className="text-xs font-medium mt-2">Role</label>
                <select name="role" value={formData.role || 'worker'} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md">
                  <option value="worker">Worker</option>
                  <option value="employer">Employer</option>
                </select>
                <label className="text-xs font-medium mt-2">Avatar URL</label>
                <input name="avatar_url" value={formData.avatar_url || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
              </div>
              <div>
                <label className="text-xs font-medium">Bio</label>
                <textarea name="bio" value={formData.bio || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md h-32" />
                <label className="text-xs font-medium mt-2">Skills</label>
                <input name="skills" value={formData.skills || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
                <label className="text-xs font-medium mt-2">Social Links</label>
                <input name="social_links" value={formData.social_links || ''} onChange={handleChange} className="mt-1 w-full border p-2 rounded-md" />
              </div>
            </div>
            <div className="mt-4 text-right">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#0b72ff] text-white rounded-md">{saving ? "Saving..." : "Save"}</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
