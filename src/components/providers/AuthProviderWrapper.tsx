'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

interface AuthProviderWrapperProps {
  children: ReactNode;
}

export default function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>;
}