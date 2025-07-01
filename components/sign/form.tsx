'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SiGithub, SiGoogle } from 'react-icons/si';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const t = useTranslations();

  // 添加状态以跟踪登录过程和错误
  const [loginStatus, setLoginStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  console.log('ENV:', process.env.NEXT_PUBLIC_API_BASE_URL);
  // 动态获取当前域名的函数
  const getCurrentDomain = (): string => {
    if (typeof window === 'undefined') {
      // 服务器端渲染时返回空字符串
      return '';
    }
    return window.location.origin;
  };

  // 处理登录方法
  const handleSignIn = async (provider: string) => {
    try {
      // 重置状态
      setLoginStatus(`Processing ${provider} sign in...`);
      setError('');

      if (provider === 'google') {
        try {
          // 获取当前页面的路径
          const currentPath = window.location.pathname;

          // 设置获取 state 的状态信息
          setLoginStatus('Fetching login parameters...');

          // 从服务器获取 state 参数
          const currentDomain = getCurrentDomain();
          const stateData = await api.get(`/auth/google/state?redirectPath=${currentDomain}${encodeURIComponent(currentPath)}`);

          if (stateData.status !== 'success' || !stateData.data || !stateData.data.state) {
            throw new Error('Invalid state data format returned by server');
          }

          const state = stateData.data.state;

          // 获取环境变量
          const googleClientId = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID;
          const googleRedirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
          console.log('googleClientId', googleClientId);
          console.log('googleRedirectUri', googleRedirectUri);
          // 检查必要的环境变量是否设置
          if (!googleClientId || !googleRedirectUri) {
            const errorMsg = 'Google OAuth configuration incomplete, please check environment variables';
            setError(errorMsg);
            setLoginStatus('');
            return;
          }

          // 构建 Google OAuth URL
          const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
            googleRedirectUri
          )}&response_type=code&scope=openid%20email%20profile&state=${encodeURIComponent(state)}`;

          // 设置状态，表示即将跳转
          setLoginStatus('Redirecting to Google sign-in page...');

          // 延迟一下，确保状态更新后再跳转
          setTimeout(() => {
            window.location.href = googleAuthUrl;
          }, 100);
        } catch (innerError) {
          const errorMsg = `Google sign-in failed: ${innerError instanceof Error ? innerError.message : String(innerError)}`;
          setError(errorMsg);
          setLoginStatus('');
        }
      } else if (provider === 'github') {
        // 实现 GitHub 登录逻辑
        try {
          // 获取当前页面的路径
          const currentPath = window.location.pathname;

          // 设置获取 state 的状态信息
          setLoginStatus('Fetching login parameters...');

          // 从服务器获取 state 参数
          const currentDomain = getCurrentDomain();
          const stateData = await api.get(`/auth/github/state?redirectPath=${currentDomain}${encodeURIComponent(currentPath)}`);

          if (stateData.status !== 'success' || !stateData.data || !stateData.data.state) {
            throw new Error('Invalid state data format returned by server');
          }

          const state = stateData.data.state;

          // 获取环境变量
          const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
          const githubRedirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;

          // 检查必要的环境变量是否设置
          if (!githubClientId || !githubRedirectUri) {
            const errorMsg = 'GitHub OAuth configuration incomplete, please check environment variables';
            setError(errorMsg);
            setLoginStatus('');
            return;
          }

          // 构建 GitHub OAuth URL
          const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${encodeURIComponent(githubRedirectUri)}&scope=user:email&state=${encodeURIComponent(
            state
          )}`;

          // 设置状态，表示即将跳转
          setLoginStatus('Redirecting to GitHub sign-in page...');

          // 延迟一下，确保状态更新后再跳转
          setTimeout(() => {
            window.location.href = githubAuthUrl;
          }, 100);
        } catch (innerError) {
          const errorMsg = `GitHub sign-in failed: ${innerError instanceof Error ? innerError.message : String(innerError)}`;
          setError(errorMsg);
          setLoginStatus('');
        }
      }
    } catch (outerError) {
      setError(`Sign-in processing error: ${outerError instanceof Error ? outerError.message : String(outerError)}`);
      setLoginStatus('');
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center"></CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loginStatus && (
              <Alert>
                <AlertDescription>{loginStatus}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-4">
              {process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true' && (
                <Button variant="outline" className="w-full" onClick={() => handleSignIn('google')}>
                  <SiGoogle className="w-4 h-4" />
                  {t('sign_modal.google_sign_in')}
                </Button>
              )}
            </div>

            {false && (
              <>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                        Forgot your password?
                      </a>
                    </div>
                    <Input id="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{' '}
                  <a href="#" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our{' '}
        <a href="/terms-of-service" target="_blank">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy-policy" target="_blank">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
