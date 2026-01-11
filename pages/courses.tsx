import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
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
      toast.error('Failed to load knowledge tracks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return <Loading fullScreen />;
  }

  return (
    <>
      <Head>
        <title>Courses | Skill-Setu</title>
      </Head>
      <Layout>
        <div className="max-w-7xl mx-auto py-8 lg:py-12 space-y-12 pb-32">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
               <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase mb-2">
                 Knowledge <span className="text-purple-600">Tracks</span>
               </h1>
               <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Immersive curated learning ecosystems</p>
            </div>
            
            <Link
              href="/create-course"
              className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 shadow-xl shadow-purple-500/20 active:scale-95 transition-all w-full md:w-auto text-center"
            >
              + Create Track
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-xl border border-dashed border-gray-200 dark:border-gray-700 rounded-[3rem] p-24 text-center">
              <div className="text-7xl mb-8 grayscale opacity-30">📚</div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter mb-2">No active tracks detected</h2>
              <p className="text-gray-400 font-medium mb-10 max-w-xs mx-auto text-sm italic">"The journey of a thousand miles begins with a single enrollment."</p>
              <Link
                href="/create-course"
                className="px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
              >
                Launch First Track
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link
                  key={course._id}
                  href={`/courses/${course._id}`}
                  className="group bg-white dark:bg-gray-800/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:border-purple-200 dark:hover:border-purple-900 transition-all flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                     <span className="text-8xl">🎓</span>
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase leading-none mb-3">{course.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 line-clamp-2 font-medium leading-relaxed italic">"{course.description}"</p>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800 relative z-10">
                    <span className="px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                      {course.skill}
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry</span>
                       <span className="text-xl font-black text-gray-900 dark:text-white italic">{course.price} 🪙</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
