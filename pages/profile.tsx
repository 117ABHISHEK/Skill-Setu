import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
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
      toast.success('Profile updated! ✨');
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
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
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Profile - Skill-Setu</title>
      </Head>
      <Layout>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">👤 My Profile</h1>
              {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(false);
                        fetchProfile();
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium border border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-lg text-gray-900 font-medium">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600">{user?.bio || 'No bio yet'}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">🎯 Skills I Teach</h2>
                  {editing && (
                    <button
                      onClick={() => addSkill('known')}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      + Add Skill
                    </button>
                  )}
                </div>
                {editing ? (
                  <div className="space-y-3">
                    {formData.skills_known.map((skill, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <input
                          type="text"
                          placeholder="Skill name"
                          value={skill.name}
                          onChange={(e) => {
                            const updated = [...formData.skills_known];
                            updated[index].name = e.target.value;
                            setFormData({ ...formData, skills_known: updated });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        />
                        <select
                          value={skill.category}
                          onChange={(e) => {
                            const updated = [...formData.skills_known];
                            updated[index].category = e.target.value;
                            setFormData({ ...formData, skills_known: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                        >
                          {SKILL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <select
                          value={skill.proficiency}
                          onChange={(e) => {
                            const updated = [...formData.skills_known];
                            updated[index].proficiency = e.target.value;
                            setFormData({ ...formData, skills_known: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                        >
                          {PROFICIENCY_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeSkill('known', index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {user?.skills_known?.map((skill: Skill, index: number) => (
                      <div
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
                      >
                        {skill.name} ({skill.proficiency})
                      </div>
                    ))}
                    {(!user?.skills_known || user.skills_known.length === 0) && (
                      <p className="text-gray-500">No skills added yet</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">📚 Skills I'm Learning</h2>
                  {editing && (
                    <button
                      onClick={() => addSkill('learning')}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      + Add Skill
                    </button>
                  )}
                </div>
                {editing ? (
                  <div className="space-y-3">
                    {formData.skills_learning.map((skill, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="text"
                          placeholder="Skill name"
                          value={skill.name}
                          onChange={(e) => {
                            const updated = [...formData.skills_learning];
                            updated[index].name = e.target.value;
                            setFormData({ ...formData, skills_learning: updated });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <select
                          value={skill.category}
                          onChange={(e) => {
                            const updated = [...formData.skills_learning];
                            updated[index].category = e.target.value;
                            setFormData({ ...formData, skills_learning: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                        >
                          {SKILL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <select
                          value={skill.proficiency}
                          onChange={(e) => {
                            const updated = [...formData.skills_learning];
                            updated[index].proficiency = e.target.value;
                            setFormData({ ...formData, skills_learning: updated });
                          }}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                        >
                          {PROFICIENCY_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeSkill('learning', index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {user?.skills_learning?.map((skill: Skill, index: number) => (
                      <div
                        key={index}
                        className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium"
                      >
                        {skill.name} ({skill.proficiency})
                      </div>
                    ))}
                    {(!user?.skills_learning || user.skills_learning.length === 0) && (
                      <p className="text-gray-500">No skills added yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
      </Layout>
    </>
  );
}
