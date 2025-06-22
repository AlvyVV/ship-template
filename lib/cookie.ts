/**
 * Cookie 操作工具函数
 */
import Cookies from 'js-cookie';

/**
 * 从 cookie 中获取特定 cookie 的值
 * @param name cookie 名称
 * @returns cookie 值，如果不存在则返回 undefined
 */
export const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  return Cookies.get(name);
};

/**
 * 设置 cookie
 * @param name cookie 名称
 * @param value cookie 值
 * @param days 过期天数
 */
export const setCookieValue = (name: string, value: string, days?: number): void => {
  if (typeof document === 'undefined') return;
  const options = days ? { expires: days, path: '/' } : { path: '/' };
  Cookies.set(name, value, options);
};

/**
 * 删除 cookie（基础版本，保留向后兼容）
 * @param name cookie 名称
 */
export const removeCookieValue = (name: string): void => {
  if (typeof document === 'undefined') return;

  Cookies.remove(name, { path: '/' });
};

/**
 * 安全删除 cookie（多重策略）
 * @param name cookie 名称
 * @returns 是否成功删除
 */
export const removeCookieValueSafely = (name: string): boolean => {
  if (typeof document === 'undefined') return false;

  // 记录删除前的状态
  const initialValue = getCookieValue(name);
  if (!initialValue) {
    console.log(`[Cookie删除] ${name} cookie 不存在，无需删除`);
    return true;
  }

  console.log(`[Cookie删除] 开始删除 ${name} cookie，当前值存在`);

  // 策略1: 针对 .aidreamscope.com 域名删除
  try {
    Cookies.remove(name, { path: '/', domain: '.aidreamscope.com' });
    console.log(`[Cookie删除] 策略1: 指定域名 .aidreamscope.com 删除尝试完成`);
  } catch (e) {
    console.warn(`[Cookie删除] 策略1失败:`, e);
  }

  // 检查是否删除成功
  if (!getCookieValue(name)) {
    console.log(`[Cookie删除] ${name} cookie 删除成功 (策略1)`);
    return true;
  }

  // 策略2: 基础路径删除（不指定域名）
  try {
    Cookies.remove(name, { path: '/' });
    console.log(`[Cookie删除] 策略2: 基础路径删除尝试完成`);
  } catch (e) {
    console.warn(`[Cookie删除] 策略2失败:`, e);
  }

  // 再次检查
  if (!getCookieValue(name)) {
    console.log(`[Cookie删除] ${name} cookie 删除成功 (策略2)`);
    return true;
  }

  // 策略3: 无点前缀域名删除
  try {
    Cookies.remove(name, { path: '/', domain: 'aidreamscope.com' });
    console.log(`[Cookie删除] 策略3: 无点前缀域名删除尝试完成`);
  } catch (e) {
    console.warn(`[Cookie删除] 策略3失败:`, e);
  }

  // 再次检查
  if (!getCookieValue(name)) {
    console.log(`[Cookie删除] ${name} cookie 删除成功 (策略3)`);
    return true;
  }

  // 策略4: 强制过期删除
  try {
    const expiredDate = new Date(Date.now() - 86400000); // 1天前
    document.cookie = `${name}=; expires=${expiredDate.toUTCString()}; path=/; domain=.aidreamscope.com`;
    document.cookie = `${name}=; expires=${expiredDate.toUTCString()}; path=/; domain=aidreamscope.com`;
    document.cookie = `${name}=; expires=${expiredDate.toUTCString()}; path=/`;
    console.log(`[Cookie删除] 策略4: 强制过期删除尝试完成`);
  } catch (e) {
    console.warn(`[Cookie删除] 策略4失败:`, e);
  }

  // 最终检查
  const finalCheck = getCookieValue(name);
  const success = !finalCheck;

  if (success) {
    console.log(`[Cookie删除] ${name} cookie 删除成功 (策略4)`);
  } else {
    console.error(`[Cookie删除] ${name} cookie 删除失败，所有策略均无效。当前值仍为:`, finalCheck);
  }

  return success;
};

/**
 * 解析用户信息 cookie
 * @returns 解析后的用户信息，或 null
 */
export const parseUserInfoCookie = () => {
  try {
    const userInfoCookie = getCookieValue('user_info');

    if (!userInfoCookie) {
      return null;
    }

    // URL解码并解析JSON
    const userInfoString = decodeURIComponent(userInfoCookie);
    return JSON.parse(userInfoString);
  } catch (e) {
    console.error('解析用户信息 cookie 失败:', e);
    return null;
  }
};
