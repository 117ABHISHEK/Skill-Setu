import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';
import { SKILL_CATEGORIES } from '@/lib/constants';

export default function CreateCourse() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skill: '',
    skillCategory: 'Tech',
    price: 0,
    modules: [] as any[],
  });
  const [loading, setLoading] = useState(false);

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        {
          title: '',
          description: '',
          order: formData.modules.length,
          lessons: [],
        },
      ],
    });
  };

  const addLesson = (moduleIndex: number) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].lessons.push({
      title: '',
      description: '',
      order: updatedModules[moduleIndex].lessons.length,
      content: {
        type: 'text',
        text: '',
      },
    });
    setFormData({ ...formData, modules: updatedModules });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/courses/create', formData);
      toast.success('Course created successfully! 🎉');
      router.push('/courses');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Course - Skill-Setu</title>
      </Head>
      <Layout>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">➕ Create New Course</h1>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Introduction to React"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={4}
                placeholder="Describe what students will learn..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skill *</label>
                <input
                  type="text"
                  required
                  value={formData.skill}
                  onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., React, JavaScript"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                <select
                  required
                  value={formData.skillCategory}
                  onChange={(e) => setFormData({ ...formData, skillCategory: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (Tokens)</label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Modules</label>
                <button
                  type="button"
                  onClick={addModule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  + Add Module
                </button>
              </div>

              {formData.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
                  <input
                    type="text"
                    placeholder="Module title"
                    value={module.title}
                    onChange={(e) => {
                      const updated = [...formData.modules];
                      updated[moduleIndex].title = e.target.value;
                      setFormData({ ...formData, modules: updated });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => addLesson(moduleIndex)}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm mb-2 hover:bg-purple-700 font-medium transition-colors"
                  >
                    + Add Lesson
                  </button>
                  {module.lessons.map((lesson: any, lessonIndex: number) => (
                    <div key={lessonIndex} className="ml-4 mt-2 p-3 bg-white rounded-lg border border-gray-200">
                      <input
                        type="text"
                        placeholder="Lesson title"
                        value={lesson.title}
                        onChange={(e) => {
                          const updated = [...formData.modules];
                          updated[moduleIndex].lessons[lessonIndex].title = e.target.value;
                          setFormData({ ...formData, modules: updated });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </form>
      </Layout>
    </>
  );
}
