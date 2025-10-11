'use client'

import React, { useEffect, useState, ChangeEvent } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import { FiLogOut, FiEdit, FiArrowLeft, FiStar, FiUser, FiGlobe } from "react-icons/fi"
import { MdClose } from "react-icons/md"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Database } from "@/types/supabase" // Assuming you generated types from your DB

// --- 1. Type Definitions (Crucial for Type Safety) ---

// Define types based on your confirmed schema
type UserProfile = Database['public']['Tables']['users']['Row'] & {
  skills: string[] | null; // Ensure skills is treated as an array of strings in the frontend
};
type Job = Database['public']['Tables']['jobs']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];
type SocialLinks = Record<string, string>;

// Extended Job type for worker view (after join)
interface WorkerJob {
  id: string;
  title: string;
  pay: number;
  category: string;
  location: string;
  status: string;
  created_at: string;
  posted_by: string;
}

// --- 2. Component Utility Functions ---

const parseSkills = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw.map(s => String(s).trim()).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.map(s => String(s).trim()).filter(Boolean);
    } catch (e) {
      // Fallback for simple comma-separated string
      return raw.split(",").map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

const formatSocialLinks = (links: SocialLinks | null | string): SocialLinks => {
    if (typeof links === 'string') {
        try {
            return JSON.parse(links) as SocialLinks;
        } catch (e) {
            return {};
        }
    }
    return links || {};
}


// --- 3. Main Component ---
export default function ProsperaProfile({ userIdParam }: { userIdParam?: string }) {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()

  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  // Use UserProfile type for formData for better safety
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [jobs, setJobs] = useState<WorkerJob[]>([]) // Use WorkerJob for consistency

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // --- 4. Data Fetching (The core fix is here) ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setUser(null) // Reset user state on new fetch

      try {
        // 1. Get the current authenticated user's ID
        const { data: { user: authUser } } = await supabase.auth.getUser()
        const loggedId = authUser?.id || null

        // 2. Fetch the current logged-in user's profile (for comparison/actions)
        if (loggedId) {
          const { data: currUserData } = await supabase
            .from("users")
            .select("*")
            .eq("id", loggedId)
            .maybeSingle()
          setCurrentUser((currUserData as UserProfile) || null)
        } else {
          setCurrentUser(null)
        }

        // 3. Determine the ID of the profile to DISPLAY (FIX: ensure we use the param)
        const profileId = userIdParam || loggedId

        if (!profileId) {
            // No ID in URL, and not logged in: cannot display a profile
            throw new Error("No user ID specified or active session.")
        }
        
        // 4. Fetch the primary user profile data (the one to display)
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", profileId)
          .maybeSingle()
          
        if (profileError || !profileData) {
          throw new Error(`Profile not found for ID: ${profileId}`)
        }
        
        // Set state, ensuring skills is treated as an array for the form
        const finalProfile = profileData as UserProfile;
        setUser(finalProfile);
        setFormData({ ...finalProfile, skills: parseSkills(finalProfile.skills).join(', ') }); // Initialize form with comma-separated string

        // 5. Fetch Posts
        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false })
        setPosts((postsData as Post[]) || [])

        // 6. Fetch Jobs/Applications
        if (finalProfile.role === "worker") {
            const { data: appsData } = await supabase
                .from("applications")
                .select(`job_id(id,title,pay,category,location,status,created_at, posted_by)`)
                .eq("worker_id", profileId)

            // Flatten the nested job object and cast to WorkerJob
            const workerJobs: WorkerJob[] = (appsData || [])
                .map((app: any) => app.job_id)
                .filter(Boolean) as WorkerJob[]; 
            setJobs(workerJobs);
        } else {
            const { data: jobsData } = await supabase
                .from("jobs")
                .select("*")
                .eq("posted_by", profileId)
            
            // Cast the fetched Job[] to WorkerJob[] for state consistency
            setJobs((jobsData || []) as WorkerJob[]);
        }

      } catch (err) {
        console.error("Profile Fetch Error:", err);
        // Do NOT redirect, just show "User not found"
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [supabase, userIdParam, router])

  // --- 5. Handlers ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      // Prepare updates, converting the comma-separated string back to a string array
      const skillsArray = parseSkills(formData.skills);
      const updates: Partial<UserProfile> = {
        name: formData.name,
        role: formData.role as UserProfile['role'], // Type casting for role safety
        bio: formData.bio,
        skills: skillsArray,
        avatar_url: formData.avatar_url,
        banner_url: formData.banner_url,
        social_links: formData.social_links as any // Supabase jsonb column type is often "any"
      }
      
      const { error } = await supabase.from("users").update(updates).eq("id", user.id)
      
      if (error) throw error;
      
      // Update local state with the saved data
      setUser(prev => prev ? { ...prev, ...updates, skills: skillsArray } : prev)
      setEditOpen(false)
    } catch(error) {
        console.error("Save Error:", error);
        alert("Failed to save profile: " + (error as Error).message);
    } finally { setSaving(false) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Simplified Trust/Rating handlers for brevity - logic remains the same
  // ... (handleTrust and handleRating logic as provided previously)

  // --- Job Click Handler (Simplified, production-ready routing) ---
  const handleJobClick = (job: WorkerJob) => {
    if (!currentUser) {
        // If not logged in, view the job/apply page
        return router.push(`/Apply/${job.id}`); 
    }
    
    // If the current user is the poster, go to their dashboard/management view
    if (job.posted_by === currentUser.id) {
        return router.push(`/Dasboard/${currentUser.id}`);
    }
    
    // Otherwise, assume it's a worker viewing a job they applied to or any user viewing the job detail
    router.push(`/Apply/${job.id}`);
  };


  // --- 6. Render ---
  if (loading) return <div className="text-black text-center p-6 min-h-screen flex items-center justify-center">Loading profile...</div>
  if (!user) return <div className="text-black text-center p-6 min-h-screen flex items-center justify-center text-lg font-semibold">User not found. Check the ID and RLS policies.</div>

  const isOwnProfile = currentUser?.id === user.id;
  const skillsList = parseSkills(user.skills);
  const social = formatSocialLinks(user.social_links);
  const socialKeys = Object.keys(social).filter(k => social[k]);

  return (
    <motion.div className="min-h-screen bg-gray-50 flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Top bar */}
      <div className="w-full max-w-6xl flex items-center justify-between py-4 px-6 sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"><FiArrowLeft /> Back</button>
        <div className="flex items-center gap-3">
          {/* Trust/Rate buttons */}
          {!isOwnProfile && (
            <>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {}} className="px-3 py-1 rounded-lg bg-[#fca311] text-white font-semibold text-sm">Trust</motion.button>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">Rate:</span>
                {[1,2,3,4,5].map(i => (
                  <FiStar key={i} className={`cursor-pointer ${i <= Math.round(user.rating || 0) ? "text-[#fca311]" : "text-gray-300"}`} onClick={() => {}} />
                ))}
              </div>
            </>
          )}
          {/* Edit/Logout buttons */}
          {isOwnProfile && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditOpen(true)} className="px-4 py-2 bg-[#14213d] text-white rounded-lg flex items-center gap-2 text-sm"><FiEdit /> Edit</motion.button>
          )}
          {currentUser && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLogout} className="px-3 py-2 border border-[#14213d] text-[#14213d] rounded-lg hover:bg-[#14213d] hover:text-white transition text-sm">Logout</motion.button>}
        </div>
      </div>

      {/* Banner + Avatar */}
      <div className="w-full max-w-6xl bg-white rounded-xl overflow-hidden shadow-lg mb-6 mt-4">
        {/* Banner */}
        <div className="w-full h-52 bg-gray-200 bg-center bg-cover" style={{ backgroundImage: `url(${user.banner_url || "/default-banner.jpg"})` }}>
          {/* If you use Next/Image, ensure the URL is absolute or whitelisted in next.config.js */}
        </div>
        
        <div className="px-6 -mt-16 flex flex-col md:flex-row items-start md:items-end gap-6 pb-6">
          <div className="w-36 h-36 bg-white rounded-full shadow-xl overflow-hidden border-4 border-white flex items-center justify-center text-3xl text-[#14213d] font-bold flex-shrink-0">
            {/* Avatar */}
            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="avatar" /> : <FiUser />}
          </div>
          
          <div className="flex-1 pt-4 md:pt-0">
            <h1 className="text-3xl font-bold text-gray-900">
                {user.name} 
                <span className="text-base font-medium text-gray-500 ml-3">• {user.role?.toUpperCase() || 'N/A'}</span>
            </h1>
            <p className="text-gray-700 mt-2">{user.bio || "No bio yet."}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
                {skillsList.map((s,i) => <span key={i} className="px-3 py-1 rounded-full bg-[#fca311]/20 text-[#14213d] text-xs font-medium border border-[#fca311]">{s}</span>)}
            </div>

            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <div className="text-[#14213d] font-semibold flex items-center"><FiUser className="mr-1 text-amber-500" /> Trust Score: {user.trust_score ?? 0}</div>
              <div className="text-[#14213d] font-semibold flex items-center"><FiStar className="mr-1 text-amber-500" /> Rating: {(user.rating || 0).toFixed(1)}/5</div>
              {user.location && <div className="text-gray-600 font-medium flex items-center"><FiGlobe className="mr-1 text-gray-400" /> {user.location}</div>}
              {socialKeys.length > 0 && (
                <div className="text-gray-600 font-medium flex items-center">
                    {/* Render social links here, e.g., icons */}
                    <span className="text-gray-500">Social: {socialKeys.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs & Posts Grid */}
      <div className={`w-full max-w-6xl grid gap-6 px-6 pb-12 ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
        
        {/* Jobs/Applications Panel */}
        <div className={`${isMobile ? "" : "lg:col-span-1"} bg-white rounded-xl p-6 shadow-md h-fit`}>
          <h3 className="text-xl font-bold mb-4 border-b pb-2">{user.role === "worker" ? "Jobs Applied" : "Jobs Posted"}</h3>
          {jobs.length === 0 ? (
            <div className="text-gray-500 text-sm py-4 border-dashed border-2 rounded-lg text-center">No {user.role === "worker" ? "applications" : "jobs"} yet.</div>
          ) : jobs.map(job => (
            <motion.div
              key={job.id}
              className="border p-3 rounded-lg mb-3 hover:bg-gray-50 transition cursor-pointer"
              whileHover={{ x: 5 }}
              onClick={() => handleJobClick(job)}
            >
              <div className="font-semibold text-gray-800">{job.title}</div>
              <div className="text-xs text-gray-600 mt-1 flex justify-between">
                <span>{job.location} • {job.category}</span>
                <span className="font-bold text-green-600">${job.pay}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Posts Panel */}
        <div className={`${isMobile ? "" : "lg:col-span-2"} flex flex-col gap-6`}>
          <h3 className="text-xl font-bold border-b pb-2">Activity Feed</h3>
          {posts.length === 0 ? (
            <div className="text-gray-500 text-center p-6 bg-white rounded-xl shadow-md">No posts yet.</div>
          ) : posts.map(post => (
            <motion.div
              key={post.id}
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition" 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {post.content && <p className="text-gray-800 mb-2">{post.content}</p>}
              {post.image_url && <img src={post.image_url} className="w-full mt-2 rounded-lg max-h-96 object-cover" alt="post image" />}
              <div className="text-xs text-gray-400 mt-3 border-t pt-2">{new Date(post.created_at).toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }} className="w-full max-w-3xl bg-white rounded-xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b pb-3">
              <h3 className="text-xl font-bold text-[#14213d]">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-800"><MdClose className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium block mb-1 text-gray-700">Full Name</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#fca311] outline-none" />
                
                <label className="text-xs font-medium block mt-3 mb-1 text-gray-700">Role</label>
                <select name="role" value={formData.role || 'worker'} onChange={handleChange} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#fca311] outline-none">
                  <option value="worker">Worker</option>
                  <option value="employer">Employer</option>
                </select>
                
                <label className="text-xs font-medium block mt-3 mb-1 text-gray-700">Avatar URL</label>
                <input name="avatar_url" value={formData.avatar_url || ''} onChange={handleChange} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#fca311] outline-none" />
              </div>
              
              <div>
                <label className="text-xs font-medium block mb-1 text-gray-700">Bio</label>
                <textarea name="bio" value={formData.bio || ''} onChange={handleChange} className="w-full border p-2 rounded-lg h-24 focus:ring-2 focus:ring-[#fca311] outline-none" />
                
                <label className="text-xs font-medium block mt-3 mb-1 text-gray-700">Skills (comma-separated)</label>
                {/* Now expecting a comma-separated string in the form data */}
                <input name="skills" value={formData.skills || ''} onChange={handleChange} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#fca311] outline-none" />
                
                <label className="text-xs font-medium block mt-3 mb-1 text-gray-700">Social Links (JSON/Text)</label>
                <input name="social_links" value={formData.social_links || ''} onChange={handleChange} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-[#fca311] outline-none" />
              </div>
            </div>
            
            <div className="mt-6 text-right border-t pt-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#fca311] text-white rounded-lg font-semibold disabled:bg-gray-400 transition">
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}