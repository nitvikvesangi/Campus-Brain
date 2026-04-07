import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function Home() {
  const uid = cookies().get('uid')?.value;
  if (uid) redirect('/dashboard');
  redirect('/login');
}
