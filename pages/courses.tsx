import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { api } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.courses || []);
    } catch (error: any) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Courses - Skill-Setu</title>
      </Head>
      <Layout>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">📖 Courses</h1>
            <Link
              href="/create-course"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              + Create Course
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-600">Loading courses...</div>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h2>
              <p className="text-gray-600 mb-6">Create your first course or enroll in existing ones</p>
              <Link
                href="/create-course"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Create Course
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Link
                  key={course._id}
                  href={`/courses/${course._id}`}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                      {course.skill}
                    </span>
                    <span className="text-gray-600 font-medium">{course.price} 🪙</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </Layout>
    </>
  );
}
