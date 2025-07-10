'use client';

import { parseUserInfoCookie } from '@/lib/cookie';
import { ReactNode, createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ContextValue } from '@/types/context';
import { User } from '@/types/user';

// 创建专用的 Context
const ThemeContext = createContext<{
  theme: string;
  setTheme: (theme: string) => void;
}>({
  theme: '',
  setTheme: () => {},
});

const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => {},
});

const ModalContext = createContext<{
  showSignModal: boolean;
  setShowSignModal: (show: boolean) => void;
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  paymentStatus: 'waiting' | 'completed' | 'expired' | 'failed';
  setPaymentStatus: (status: 'waiting' | 'completed' | 'expired' | 'failed') => void;
  paymentOrderInfo: {
    orderNo?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
  };
  setPaymentOrderInfo: (info: {
    orderNo?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
  }) => void;
}>({
  showSignModal: false,
  setShowSignModal: () => {},
  showPaymentModal: false,
  setShowPaymentModal: () => {},
  paymentStatus: 'waiting',
  setPaymentStatus: () => {},
  paymentOrderInfo: {},
  setPaymentOrderInfo: () => {},
});

// 为了向后兼容，保留原来的 AppContext
const AppContext = createContext({} as ContextValue);

// 专用的 hooks，用于细粒度订阅
export const useTheme = () => useContext(ThemeContext);
export const useUser = () => useContext(UserContext);
export const useModal = () => useContext(ModalContext);

// 向后兼容的 hook
export const useAppContext = () => useContext(AppContext);

// 主题提供者组件
const ThemeProvider = memo(({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<string>(() => {
    return process.env.NEXT_PUBLIC_DEFAULT_THEME || '';
  });

  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>;
});
ThemeProvider.displayName = 'ThemeProvider';

// 用户提供者组件
const UserProvider = memo(({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // 使用 useCallback 包装 fetchUserInfo 函数，避免在每次渲染时重新创建
  const fetchUserInfo = useCallback(async function () {
    try {
      console.log('fetchUserInfo - starting...');
      // 使用 parseUserInfoCookie 替代内联的 cookie 解析逻辑
      const userData = parseUserInfoCookie();

      console.log('fetchUserInfo - parsed userData:', userData);

      if (!userData) {
        console.log('fetchUserInfo - No user_info cookie found');
        return;
      }

      setUser(userData);
    } catch (e) {
      console.log('fetchUserInfo - error:', e);
    }
  }, []);

  // 在组件挂载时获取用户信息
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const userValue = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={userValue}>{children}</UserContext.Provider>;
});
UserProvider.displayName = 'UserProvider';

// 模态窗口提供者组件
const ModalProvider = memo(({ children }: { children: ReactNode }) => {
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'completed' | 'expired' | 'failed'>('waiting');
  const [paymentOrderInfo, setPaymentOrderInfo] = useState<{
    orderNo?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
  }>({});

  const modalValue = useMemo(
    () => ({
      showSignModal,
      setShowSignModal,
      showPaymentModal,
      setShowPaymentModal,
      paymentStatus,
      setPaymentStatus,
      paymentOrderInfo,
      setPaymentOrderInfo,
    }),
    [showSignModal, showPaymentModal, paymentStatus, paymentOrderInfo]
  );

  return <ModalContext.Provider value={modalValue}>{children}</ModalContext.Provider>;
});
ModalProvider.displayName = 'ModalProvider';

// 主应用上下文提供者
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <UserProvider>
        <ModalProvider>
          <AppContextBridge>{children}</AppContextBridge>
        </ModalProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

// 向后兼容的桥接组件
const AppContextBridge = memo(({ children }: { children: ReactNode }) => {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useUser();
  const { 
    showSignModal, 
    setShowSignModal,
    showPaymentModal,
    setShowPaymentModal,
    paymentStatus,
    setPaymentStatus,
    paymentOrderInfo,
    setPaymentOrderInfo
  } = useModal();

  // 整合所有上下文到一个值中，用于向后兼容
  const appContextValue = useMemo(
    () => ({
      theme,
      setTheme,
      showSignModal,
      setShowSignModal,
      user,
      setUser,
      showPaymentModal,
      setShowPaymentModal,
      paymentStatus,
      setPaymentStatus,
      paymentOrderInfo,
      setPaymentOrderInfo,
    }),
    [theme, showSignModal, user, setTheme, setShowSignModal, setUser, showPaymentModal, setShowPaymentModal, paymentStatus, setPaymentStatus, paymentOrderInfo, setPaymentOrderInfo]
  );

  return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>;
});
AppContextBridge.displayName = 'AppContextBridge';
