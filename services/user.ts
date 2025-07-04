import { CreditsAmount, CreditsTransType } from './credit';
import { findUserByEmail, findUserByUuid, insertUser } from '@/models/user';

import { User } from '@/types/user';
import { getOneYearLaterTimestr } from '@/lib/time';
import { cookies } from 'next/headers';
import { increaseCredits } from './credit';

export async function saveUser(user: User) {
  try {
    const existUser = await findUserByEmail(user.email);
    if (!existUser) {
      await insertUser(user);

      // increase credits for new user, expire in one year
      await increaseCredits({
        userUuid: user.uuid || '',
        transType: CreditsTransType.NewUser,
        credits: CreditsAmount.NewUserGet,
        expiredAt: getOneYearLaterTimestr(),
      });
    } else {
      user.id = existUser.id;
      user.uuid = existUser.uuid;
      user.createdAt = existUser.createdAt;
    }

    return user;
  } catch (e) {
    console.log('save user failed: ', e);
    throw e;
  }
}

export async function getUserUuid() {
  // 1. 优先从 cookie 中解析 user_info（旧命名）或 userInfo（新命名）
  try {
    const cookieStore: any = await (cookies() as any);

    // 兼容大小写和新旧命名
    const rawUserInfo = cookieStore.get('user_info')?.value || cookieStore.get('userInfo')?.value;

    if (rawUserInfo) {
      try {
        const decoded = decodeURIComponent(rawUserInfo);
        const userInfo = JSON.parse(decoded);

        // 可能的字段：uuid 或 id（后端目前写入 id）
        if (userInfo?.uuid) {
          return userInfo.uuid;
        }

        if (userInfo?.id) {
          return userInfo.id;
        }
      } catch (e) {
        console.warn('解析 user_info cookie 失败', e);
      }
    }
  } catch (e) {
    console.warn('读取 cookie 失败', e);
  }

  // 如果未能通过 Cookie 获取到用户标识，直接返回空字符串，不做降级处理
  return '';
}

export async function getUserEmail() {
  let userEmail = '';

  return userEmail;
}

export async function getUserInfo() {
  try {
    const cookieStore: any = await (cookies() as any);

    // 兼容 user_info / userInfo 命名，并允许大小写差异
    const rawUserInfo = cookieStore.get('user_info')?.value || cookieStore.get('userInfo')?.value;

    if (rawUserInfo) {
      try {
        const decoded = decodeURIComponent(rawUserInfo);
        const parsed: Partial<User> = JSON.parse(decoded);

        // 若解析成功且包含 email / uuid，直接返回，避免额外查询
        if (parsed && Object.keys(parsed).length > 0) {
          return parsed as User;
        }
      } catch (e) {
        console.warn('解析 user_info cookie 失败', e);
      }
    }
  } catch (e) {
    console.warn('读取 cookie 失败', e);
  }

  // // Fallback：依旧按照 uuid -> 数据库 查询方式
  // const userUuid = await getUserUuid();

  // if (!userUuid) {
  //   return;
  // }

  // const user = await findUserByUuid(userUuid);
}
