'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { useAppContext } from '@/contexts/app';
import { removeCookieValueSafely } from '@/lib/cookie';
import { User } from '@/types/user';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUser({ user }: { user: User }) {
  const t = useTranslations();
  const router = useRouter();
  const { setUser } = useAppContext();

  // 真正的登出逻辑
  const handleSignOut = () => {
    console.log('[登出] 开始登出流程...');

    // 使用增强的 cookie 删除方法
    const userInfoDeleted = removeCookieValueSafely('user_info');
    const authTokenDeleted = removeCookieValueSafely('auth_token');

    console.log('[登出] Cookie 删除结果:', { userInfoDeleted, authTokenDeleted });

    if (!userInfoDeleted || !authTokenDeleted) {
      console.warn('[登出] 警告: 部分 Cookie 删除失败，但将继续登出流程');
    }

    // 更新用户状态
    setUser(null);

    // 重定向到首页
    router.push('/');

    console.log('[登出] 登出流程完成');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user.avatarUrl} alt={user.nickname} />
          <AvatarFallback>{user.nickname}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-4">
        <DropdownMenuLabel className="text-center truncate">{user.nickname}</DropdownMenuLabel>
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuItem className="flex justify-center cursor-pointer">
          <Link href="/my-orders">{t('user.user_center')}</Link>
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />

        {/* <DropdownMenuItem className="flex justify-center cursor-pointer">
          <Link href="/my-chat" target="_blank">
            {t('user.my_chat')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex justify-center cursor-pointer" onClick={handleSignOut}>
          {t('user.sign_out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
