'use client';

import * as React from 'react';
import { memo } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useModal } from '@/contexts/app';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTranslations } from 'next-intl';
import SignForm from './form';

const SignModal = () => {
  const t = useTranslations();
  const { showSignModal, setShowSignModal } = useModal();

  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('sign_modal.sign_in_title')}</DialogTitle>
            <DialogDescription>{t('sign_modal.sign_in_description')}</DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showSignModal} onOpenChange={setShowSignModal}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t('sign_modal.sign_in_title')}</DrawerTitle>
          <DrawerDescription>{t('sign_modal.sign_in_description')}</DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-4">
          <DrawerClose asChild>
            <Button variant="outline">{t('sign_modal.cancel_title')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const ProfileForm = memo(({ className }: React.ComponentProps<'form'>) => {
  return (
    <div className={cn('', className)}>
      <SignForm />
    </div>
  );
});
ProfileForm.displayName = 'ProfileForm';

export default memo(SignModal);
