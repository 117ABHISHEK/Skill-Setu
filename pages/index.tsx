import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Skill-Setu - AI-Powered Skill Learning Platform</title>
        <meta name="description" content="Learn and teach skills in a unified platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">🎓 Skill-Setu</h1>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    </>
  );
}
