'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function FooterHead() {
  const [userInitials, setUserInitials] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserName = async () => {
      // get current authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      // fetch full_name from your users_data table
      const { data, error } = await supabase
        .from('users_data')
        .select('user_name')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.user_name) {
        // take first three letters, uppercase
        setUserInitials(data.user_name.slice(0, 3).toUpperCase());
      }
    };

    fetchUserName();
  }, [supabase]);

  return (
    <header className="w-full bg-white h-[70px] flex items-center justify-between px-4 shadow-sm">
      {/* Left: Back button */}
      <Link
        href="/"
        className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors"
      >
        <IoIosArrowRoundBack className="text-2xl text-black font-bold" />
        Back
      </Link>

      {/* Right: User initials */}
      {userInitials ? (
        <Link
          href="/profile"
          className="px-3 py-1 rounded-full bg-gray-800 text-white text-sm font-semibold tracking-wide hover:bg-black transition-colors"
          aria-label="User Profile"
        >
          {userInitials}
        </Link>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
      )}
    </header>
  );
}
