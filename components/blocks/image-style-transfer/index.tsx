'use client';

import type React from 'react';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { ImageStyleTransfer } from '@/types/blocks/image-style-transfer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/upload-file';
import { apiClient } from '@/lib/api-client';
import { useUser, useModal } from '@/contexts/app';
import { useServerEvents, ServerEvent } from '@/hooks/use-server-events';
import { getProgress } from '@/lib/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';

export default function ImageStyleTransferBlock({ imageStyleTransfer }: { imageStyleTransfer: ImageStyleTransfer }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exeTime, setExeTime] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [pendingGenerate, setPendingGenerate] = useState<boolean>(false);
  const { user } = useUser();
  const { setShowSignModal } = useModal();
  // 图片上传状态，用于显示遮罩和禁用交互
  const [isUploading, setIsUploading] = useState<boolean>(false);

  /* === SSE 订阅处理 === */
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const sseUrl = `${apiBase}/events/stream`;
  const { events: sseEvents } = useServerEvents(sseUrl);

  /* === 额外：参数输入对话框相关状态 === */
  const [showParamDialog, setShowParamDialog] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  if (imageStyleTransfer.disabled) {
    return null;
  }

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // 本地预览 URL
    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    setProcessedImage(null);

    // 开始上传，显示遮罩
    setIsUploading(true);

    try {
      const remote = await uploadFile(file);
      console.log('remote', remote);
      setImageUrl(remote.url);
    } catch (err) {
      console.error('文件上传失败', err);
    } finally {
      // 无论成功失败，都移除遮罩
      setIsUploading(false);
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      // 关键：上传完立即清空 input 的 value，确保下次选择同一文件也能触发 change
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setProcessedImage(null);
    setSelectedStyle(null);
    setImageUrl(null);
    setTaskId(null);

    // 同时清空 file input，以便用户可重新选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 打开生成确认/参数填写弹框
   * 1. 确保当前选中风格为 styleId
   * 2. 初始化 paramValues（有参则取默认值，无参则设为空）
   * 3. 显示对话框
   */
  const handleOpenGenerateDialog = (styleId: string) => {
    if (isUploading) return; // 上传中禁止操作

    // 若切换风格同时重置部分状态
    if (selectedStyle !== styleId) {
      setSelectedStyle(styleId);
      setProcessedImage(null);
      setTaskId(null);
    }

    const selectedStyleData = imageStyleTransfer.styleOptions?.find(s => s.code === styleId);
    const paramsList = selectedStyleData?.params as { title: string; code: string; description: string; value: string }[] | undefined;

    if (paramsList && paramsList.length > 0) {
      const initial: Record<string, string> = {};
      paramsList.forEach(p => {
        initial[p.code] = p.value ?? '';
      });
      setParamValues(initial);
    } else {
      setParamValues({});
    }

    setShowParamDialog(true);
  };

  const handleStyleSelect = (styleId: string) => {
    if (isUploading) return; // 上传过程中禁止选择风格

    setSelectedStyle(styleId);
    setProcessedImage(null);
    setTaskId(null);
  };

  const doGenerate = async () => {
    if (!uploadedImage || !imageUrl || !selectedStyle) return;

    try {
      const selectedStyleData = imageStyleTransfer.styleOptions?.find(s => s.code === selectedStyle);
      const code = selectedStyleData?.code || selectedStyle;
      // 接口返回格式：{ code: 0, message: 'ok', data: { userMediaRecordId, exeTime, ... } }
      const payload: any = {
        code,
        imageUrl,
      };

      if (paramValues && Object.keys(paramValues).length > 0) {
        payload.params = Object.entries(paramValues).map(([code, value]) => ({ code, value }));
      }

      const resp = await apiClient.post<{
        code: number;
        message: string;
        data: {
          userMediaRecordId: string;
          exeTime: number;
        };
      }>('/api/image-style-transfer', payload);

      // 解析实际业务数据
      const { userMediaRecordId, exeTime } = resp.data || ({} as any);

      // 保存任务信息，供后续进度轮询和 SSE 事件匹配使用
      if (userMediaRecordId) {
        setTaskId(userMediaRecordId);
      }

      if (exeTime !== undefined) {
        setExeTime(exeTime);
      }

      console.log('resp', resp);
    } catch (e) {
      console.error('创建任务失败', e);
    }

    // 开始处理流程，进度条由 getProgress 估算，最终以 SSE 结果为准
    setIsProcessing(true);
    setProgress(0);
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !imageUrl || !selectedStyle) return;

    if (!user) {
      // 记录待执行状态并弹出登录框
      setPendingGenerate(true);
      setShowSignModal(true);
      return;
    }

    doGenerate();
  };

  // 监听 user 变化，如果之前点击过生成但未登录，登录后自动执行
  useEffect(() => {
    if (pendingGenerate && user) {
      setPendingGenerate(false);
      doGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 监听 SSE 事件，匹配当前 taskId
  useEffect(() => {
    if (!taskId) return;

    const matched = sseEvents.find((e: ServerEvent) => {
      if (e.type !== 'user.media.record.completed' && e.type !== 'user.media.record.failed') return false;
      // 后端可能使用不同字段名：transactionNo / userMediaRecordId / taskId
      return e.transactionNo === taskId || e.userMediaRecordId === taskId || e.taskId === taskId;
    });

    if (!matched) return;

    // 根据事件类型处理
    if (matched.type === 'user.media.record.completed') {
      let finalUrl: string | undefined;
      if (Array.isArray(matched.resultUrls) && matched.resultUrls.length) {
        finalUrl = matched.resultUrls[0];
      } else if (Array.isArray(matched.urls) && matched.urls.length) {
        // 兼容旧字段
        finalUrl = matched.urls[0];
      } else if (matched.url) {
        finalUrl = matched.url;
      }

      if (finalUrl) {
        setProcessedImage(finalUrl);
      }

      setIsProcessing(false);
      setProgress(100);
      // 清理进度定时器
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }

    if (matched.type === 'user.media.record.failed') {
      setIsProcessing(false);
      setProgress(0);
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      // 可以弹出错误提示，或设置错误状态
    }
  }, [sseEvents, taskId]);

  /**
   * 下载处理结果图片，避免页面跳转：
   * 先抓取远程图片为 blob，再生成本地 ObjectURL 触发下载。
   * 若跨域受限或失败，则回退打开新标签页。
   */
  const handleDownload = async () => {
    if (!processedImage) return;

    try {
      const res = await fetch(processedImage, { mode: 'cors' });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `styled-image-${selectedStyle || 'image'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放 URL
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed, open in new tab as fallback', err);
      window.open(processedImage, '_blank');
    }
  };

  // Sync left container height after image load
  useEffect(() => {
    if (leftContainerRef.current) {
      setLeftHeight(leftContainerRef.current.offsetHeight);
    }
  }, [uploadedImage]);

  /**
   * 根据任务 ID 周期性调用 getProgress 计算预估进度。
   * 当 isProcessing 为 true 且 taskId 存在时启动；结束时自动清理。
   */
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 启动进度定时器
    if (isProcessing && taskId) {
      // 如果之前已经存在定时器，先清理
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      const expectedSeconds = exeTime && exeTime > 0 ? exeTime : (imageStyleTransfer.processingDuration || 30000) / 1000;
      progressTimerRef.current = setInterval(() => {
        setProgress(prev => getProgress(expectedSeconds, taskId, prev));
      }, 1000);
    }

    // 组件卸载或状态改变时清理定时器
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProcessing, taskId]);

  return (
    <section id={imageStyleTransfer.name} className="w-full py-16 from-slate-50 to-slate-100">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Icon name="LuSparkles" className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-primary">{imageStyleTransfer.title}</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{imageStyleTransfer.description}</p>
        </div>

        {/* Image Comparison Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="LuImage" className="h-5 w-5" />
              {imageStyleTransfer.uploadSection?.title}
            </CardTitle>
            <CardDescription>{imageStyleTransfer.uploadSection?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Original/Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{imageStyleTransfer.uploadSection?.title}</h3>
                {!uploadedImage ? (
                  <Card
                    className={cn('border-dashed border-2 border-muted-foreground/25 h-96 transition-all duration-150', isDragOver && 'ring-2 ring-primary/50 scale-105')}
                    onDragOver={e => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  >
                    <CardContent className="h-full flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <Icon name="LuUpload" className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{imageStyleTransfer.uploadSection?.uploadPlaceholder?.title}</h4>
                          <p className="text-sm text-muted-foreground">{imageStyleTransfer.fileFormats}</p>
                        </div>
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <Icon name="LuImage" className="mr-2 h-4 w-4" />
                          {imageStyleTransfer.uploadSection?.uploadPlaceholder?.buttonText}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div ref={leftContainerRef} className="relative w-full rounded-lg overflow-hidden border">
                      {/* 上传中遮罩，仅覆盖图片区域 */}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                          <Loader />
                        </div>
                      )}
                      <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full z-10">
                        <Icon name="LuX" className="h-4 w-4" />
                      </button>
                      <Image
                        src={uploadedImage || '/placeholder.svg'}
                        alt="Original image"
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain"
                        onLoad={() => {
                          // 图片加载完成后，根据实际渲染高度同步右侧区域高度
                          if (leftContainerRef.current) {
                            setLeftHeight(leftContainerRef.current.offsetHeight);
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        {imageStyleTransfer.uploadSection?.changeButtonText}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Processed Result */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">{imageStyleTransfer.resultSection?.title}</h3>
                {!uploadedImage ? (
                  <Card className="border-dashed border-2 border-muted-foreground/25 h-96">
                    <CardContent className="h-full flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <Icon name="LuSparkles" className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{imageStyleTransfer.resultSection?.uploadFirstMessage?.title}</h4>
                          <p className="text-sm text-muted-foreground">{imageStyleTransfer.resultSection?.uploadFirstMessage?.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : isProcessing ? (
                  <Card className="h-full">
                    <CardContent className="h-full flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <Icon name="LuSparkles" className="h-8 w-8 text-primary animate-spin" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{imageStyleTransfer.resultSection?.processingMessage?.title}</h4>
                          <p className="text-sm text-muted-foreground">{imageStyleTransfer.resultSection?.processingMessage?.description}</p>
                        </div>
                        <div className="max-w-xs mx-auto">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            {progress}% {imageStyleTransfer.progressTexts?.complete}
                          </p>
                          {taskId && <p className="text-xs text-muted-foreground mt-1">Task ID: {taskId}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : processedImage ? (
                  <div className="space-y-4">
                    <div className="relative w-full rounded-lg overflow-hidden border" style={{ height: leftHeight || 'auto' }}>
                      <Image src={processedImage || '/placeholder.svg'} alt="Processed image" fill className="object-cover" />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setProcessedImage(null);
                          setSelectedStyle(null);
                        }}
                      >
                        {imageStyleTransfer.resultSection?.tryAnotherButton?.title}
                      </Button>
                      <Button onClick={handleDownload}>
                        <Icon name="LuDownload" className="mr-2 h-4 w-4" />
                        {imageStyleTransfer.resultSection?.downloadButton?.title}
                      </Button>
                    </div>
                    {taskId && <p className="text-center text-xs text-muted-foreground">Task ID: {taskId}</p>}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 border-muted-foreground/25" style={{ height: leftHeight || undefined }}>
                    <CardContent className="h-full flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <Icon name="LuPalette" className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{imageStyleTransfer.resultSection?.readyMessage?.title}</h4>
                          <p className="text-sm text-muted-foreground">{imageStyleTransfer.resultSection?.readyMessage?.description}</p>
                          {selectedStyle && (
                            <Badge className="mt-2">
                              {imageStyleTransfer.styleOptions?.find(s => s.code === selectedStyle)?.name} {imageStyleTransfer.styleSelection?.selectedBadgeText}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Style Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="LuPalette" className="h-5 w-5" />
              {imageStyleTransfer.styleSelection?.title}
            </CardTitle>
            <CardDescription>{imageStyleTransfer.styleSelection?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageStyleTransfer.styleOptions?.map(style => {
                return (
                  <Card
                    key={style.code}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden border-2',
                      selectedStyle === style.code && 'ring-2 ring-primary ring-offset-2 scale-105',
                      !uploadedImage && 'opacity-75',
                      !uploadedImage && selectedStyle === style.code && 'opacity-100',
                      isUploading && 'pointer-events-none opacity-50'
                    )}
                    onClick={() => handleStyleSelect(style.code)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* 示例图片 */}
                        <div className="relative w-full aspect-square rounded-md overflow-hidden bg-muted">
                          <Image src={style.demoImageUrl} alt={style.name} fill className="object-cover" />
                        </div>

                        <div className="text-center">
                          <h3 className="font-semibold text-sm">{style.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                        </div>

                        {/* 如未上传图片则提示先上传；上传中或未上传时按钮禁用 */}
                        {uploadedImage ? (
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={isUploading}
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenGenerateDialog(style.code);
                            }}
                          >
                            Generate
                          </Button>
                        ) : (
                          <Badge variant="outline" className="w-full justify-center text-xs opacity-60">
                            {imageStyleTransfer.styleSelection?.uploadFirstMessage}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        {/* 确认生成 / 参数填写对话框 */}
        {showParamDialog && (
          <Dialog open={showParamDialog} onOpenChange={setShowParamDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Generation</DialogTitle>
                <DialogDescription>Please confirm and fill in required parameters.</DialogDescription>
              </DialogHeader>

              {(() => {
                const currentParamsList = imageStyleTransfer.styleOptions?.find(s => s.code === selectedStyle)?.params;
                const hasParams = currentParamsList && currentParamsList.length > 0;
                const isParamsValid = !hasParams || currentParamsList.every(param => (paramValues[param.code] || '').trim() !== '');

                return (
                  <>
                    {hasParams && (
                      <div className="space-y-4">
                        {currentParamsList?.map(param => (
                          <div key={param.code} className="space-y-2">
                            <Label htmlFor={param.code}>{param.title}</Label>
                            <Input
                              id={param.code}
                              placeholder={param.description}
                              value={paramValues[param.code] || ''}
                              onChange={e =>
                                setParamValues(prev => ({
                                  ...prev,
                                  [param.code]: e.target.value,
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {!hasParams && <p className="text-sm text-muted-foreground">No additional parameters required. Click confirm to start generation.</p>}

                    <DialogFooter className="pt-4">
                      <Button
                        disabled={!isParamsValid}
                        onClick={() => {
                          setShowParamDialog(false);
                          handleGenerate();
                        }}
                      >
                        Confirm
                      </Button>
                    </DialogFooter>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
}
