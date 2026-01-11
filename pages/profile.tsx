import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '@/lib/constants';

interface Skill {
  name: string;
  category: string;
  proficiency: string;
  verified: boolean;
  xp: number;
}

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills_known: [] as Skill[],
    skills_learning: [] as Skill[],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name,
        bio: userData.bio || '',
        skills_known: userData.skills_known || [],
        skills_learning: userData.skills_learning || [],
      });
    } catch (error: any) {
      toast.error('Failed to load profile');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/users/profile', formData);
      toast.success('Core identity synced! ✨');
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to sync identity');
    }
  };

  const addSkill = (type: 'known' | 'learning') => {
    const newSkill: Skill = {
      name: '',
      category: SKILL_CATEGORIES[0],
      proficiency: PROFICIENCY_LEVELS[0],
      verified: false,
      xp: 0,
    };

    if (type === 'known') {
      setFormData({
        ...formData,
        skills_known: [...formData.skills_known, newSkill],
      });
    } else {
      setFormData({
        ...formData,
        skills_learning: [...formData.skills_learning, newSkill],
      });
    }
  };

  const removeSkill = (type: 'known' | 'learning', index: number) => {
    if (type === 'known') {
      setFormData({
        ...formData,
        skills_known: formData.skills_known.filter((_, i) => i !== index),
      });
    } else {
      setFormData({
        ...formData,
        skills_learning: formData.skills_learning.filter((_, i) => i !== index),
      });
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      <Head>
        <title>Identity | Skill-Setu</title>
      </Head>
      <Layout>
        <div className="max-w-5xl mx-auto py-12 space-y-12 pb-32">
          {/* Header & Main Info */}
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left relative">
             {/* Avatar Area */}
             <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600/30 to-teal-500/30 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-40 h-40 md:w-48 md:h-48 bg-[#050505] rounded-[3rem] border border-white/10 flex items-center justify-center text-6xl shadow-2xl overflow-hidden group">
                   {user?.name?.charAt(0).toUpperCase()}
                   <div className="absolute inset-0 bg-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
             </div>

             <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                      <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase leading-none">
                         {editing ? 'MOD MODIFY' : user?.name?.toUpperCase()}
                      </h1>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Member Since {new Date(user?.createdAt).getFullYear()}</p>
                   </div>
                   
                   {!editing ? (
                     <button
                       onClick={() => setEditing(true)}
                       className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all active:scale-95"
                     >
                       Edit Identity
                     </button>
                   ) : (
                     <div className="flex gap-3">
                       <button
                         onClick={() => { setEditing(false); fetchProfile(); }}
                         className="px-8 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-all"
                       >
                         Discard
                       </button>
                       <button
                         onClick={handleSave}
                         className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 shadow-xl shadow-purple-500/20 transition-all active:scale-95"
                       >
                         Sync Changes
                       </button>
                     </div>
                   )}
                </div>

                <div className="p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden">
                   <div className="relative z-10">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Bio / Expertise Definition</label>
                      {editing ? (
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          className="w-full bg-transparent border-none focus:outline-none p-0 text-gray-900 dark:text-white font-medium text-lg italic placeholder:text-gray-400 leading-relaxed"
                          rows={3}
                          placeholder="Describe your skillset..."
                        />
                      ) : (
                        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium italic leading-relaxed">
                           "{user?.bio || 'Initializing skill-set bio...'}"
                        </p>
                      )}
                   </div>
                </div>
             </div>
          </div>

          {/* Core Skills - Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Skills I Teach */}
             <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                   <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Teaching Streams</h2>
                   {editing && (
                     <button onClick={() => addSkill('known')} className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline">+ New Stream</button>
                   )}
                </div>

                <div className="space-y-4">
                   {editing ? (
                     formData.skills_known.map((skill, index) => (
                       <div key={index} className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
                          <input
                            type="text"
                            placeholder="Skill (e.g. Next.js)"
                            value={skill.name}
                            onChange={(e) => {
                              const updated = [...formData.skills_known];
                              updated[index].name = e.target.value;
                              setFormData({ ...formData, skills_known: updated });
                            }}
                            className="bg-transparent border-none text-xl font-black italic uppercase tracking-tight focus:outline-none dark:text-white p-0"
                          />
                          <div className="flex flex-wrap gap-2">
                             <select
                               value={skill.category}
                               onChange={(e) => {
                                 const updated = [...formData.skills_known];
                                 updated[index].category = e.target.value;
                                 setFormData({ ...formData, skills_known: updated });
                               }}
                               className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest dark:text-gray-400 focus:outline-none"
                             >
                               {SKILL_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                             </select>
                             <select
                               value={skill.proficiency}
                               onChange={(e) => {
                                 const updated = [...formData.skills_known];
                                 updated[index].proficiency = e.target.value;
                                 setFormData({ ...formData, skills_known: updated });
                               }}
                               className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest dark:text-gray-400 focus:outline-none"
                             >
                               {PROFICIENCY_LEVELS.map(level => <option key={level}>{level}</option>)}
                             </select>
                             <button onClick={() => removeSkill('known', index)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Delete</button>
                          </div>
                       </div>
                     ))
                   ) : (
                     user?.skills_known?.map((skill: Skill, index: number) => (
                       <div key={index} className="group flex items-center justify-between p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all">
                          <div>
                             <h4 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase leading-none mb-1">{skill.name}</h4>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{skill.category} • {skill.proficiency}</p>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">XP Earned</div>
                             <div className="text-xl font-black text-gray-900 dark:text-white italic">{skill.xp}</div>
                          </div>
                       </div>
                     ))
                   )}
                   {(!user?.skills_known || user.skills_known.length === 0) && !editing && (
                     <p className="px-4 text-gray-400 font-medium italic text-sm italic">No expertise definitions stored yet.</p>
                   )}
                </div>
             </div>

             {/* Skills I'm Learning */}
             <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                   <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Learning Tracks</h2>
                   {editing && (
                     <button onClick={() => addSkill('learning')} className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:underline">+ New Track</button>
                   )}
                </div>

                <div className="space-y-4">
                   {editing ? (
                     formData.skills_learning.map((skill, index) => (
                       <div key={index} className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700">
                          <input
                            type="text"
                            placeholder="Skill (e.g. Design)"
                            value={skill.name}
                            onChange={(e) => {
                              const updated = [...formData.skills_learning];
                              updated[index].name = e.target.value;
                              setFormData({ ...formData, skills_learning: updated });
                            }}
                            className="bg-transparent border-none text-xl font-black italic uppercase tracking-tight focus:outline-none dark:text-white p-0"
                          />
                          <div className="flex flex-wrap gap-2">
                             <select
                               value={skill.category}
                               onChange={(e) => {
                                 const updated = [...formData.skills_learning];
                                 updated[index].category = e.target.value;
                                 setFormData({ ...formData, skills_learning: updated });
                               }}
                               className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest dark:text-gray-400 focus:outline-none"
                             >
                               {SKILL_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                             </select>
                             <select
                               value={skill.proficiency}
                               onChange={(e) => {
                                 const updated = [...formData.skills_learning];
                                 updated[index].proficiency = e.target.value;
                                 setFormData({ ...formData, skills_learning: updated });
                               }}
                               className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest dark:text-gray-400 focus:outline-none"
                             >
                               {PROFICIENCY_LEVELS.map(level => <option key={level}>{level}</option>)}
                             </select>
                             <button onClick={() => removeSkill('learning', index)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Delete</button>
                          </div>
                       </div>
                     ))
                   ) : (
                     user?.skills_learning?.map((skill: Skill, index: number) => (
                       <div key={index} className="group flex items-center justify-between p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all">
                          <div>
                             <h4 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase leading-none mb-1">{skill.name}</h4>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{skill.category} • {skill.proficiency}</p>
                          </div>
                          <div className="text-right">
                             <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600">
                                📈
                             </div>
                          </div>
                       </div>
                     ))
                   )}
                   {(!user?.skills_learning || user.skills_learning.length === 0) && !editing && (
                     <p className="px-4 text-gray-400 font-medium italic text-sm italic">No active learning tracks detected.</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
