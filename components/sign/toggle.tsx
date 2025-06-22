'use client';

import { useUser } from '@/contexts/app';
import { memo } from 'react';
import SignIn from './sign-in';
import User from './user';

const SignToggle = () => {
  const { user } = useUser();
  console.log('SignToggle - user:', user);
  return <div className="flex items-center gap-x-2 px-2">{user ? <User user={user} /> : <SignIn />}</div>;
};

export default memo(SignToggle);
