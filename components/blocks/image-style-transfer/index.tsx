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

export default function ImageStyleTransferBlock({ imageStyleTransfer }: { imageStyleTransfer: ImageStyleTransfer }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [pendingGenerate, setPendingGenerate] = useState<boolean>(false);
  const { user } = useUser();
  const { setShowSignModal } = useModal();

  if (imageStyleTransfer.disabled) {
    return null;
  }

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    // 本地预览 URL
    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    setProcessedImage(null);

    // 调用后端上传
    try {
      const remote = await uploadFile(file);
      console.log('remote', remote);
      setImageUrl(remote.url);
    } catch (err) {
      console.error('文件上传失败', err);
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setProcessedImage(null);
    setSelectedStyle(null);
    setImageUrl(null);
    setTaskId(null);
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    setProcessedImage(null);
    setTaskId(null);
  };

  const doGenerate = async () => {
    if (!uploadedImage || !imageUrl || !selectedStyle) return;

    try {
      const selectedStyleData = imageStyleTransfer.styleOptions?.find(s => s.id === selectedStyle);
      const code = selectedStyleData?.code || selectedStyle;
      const resp = await apiClient.post<{ taskId: string }>('/api/image-style-transfer', {
        code,
        imageUrl,
      });
      setTaskId(resp.taskId);
    } catch (e) {
      console.error('创建任务失败', e);
    }

    // 前端模拟处理流程
    setIsProcessing(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      const selectedStyleData = imageStyleTransfer.styleOptions?.find(s => s.id === selectedStyle);
      setProcessedImage(`/placeholder.svg?height=500&width=500&query=${selectedStyleData?.name} style processed image`);
      setIsProcessing(false);
      setProgress(0);
    }, imageStyleTransfer.processingDuration || 2000);
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

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `styled-image-${selectedStyle}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Sync left container height after image load
  useEffect(() => {
    if (leftContainerRef.current) {
      setLeftHeight(leftContainerRef.current.offsetHeight);
    }
  }, [uploadedImage]);

  return (
    <section id={imageStyleTransfer.name} className="w-full py-16 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Icon name="LuSparkles" className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{imageStyleTransfer.title}</h1>
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
                    className={cn('border-dashed border-2 border-muted-foreground/25 h-96 transition-all duration-150', isDragOver && 'ring-2 ring-purple-500/50 scale-105')}
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
                        <Button onClick={() => fileInputRef.current?.click()} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          <Icon name="LuImage" className="mr-2 h-4 w-4" />
                          {imageStyleTransfer.uploadSection?.uploadPlaceholder?.buttonText}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <div ref={leftContainerRef} className="relative w-full rounded-lg overflow-hidden border">
                      <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full z-10">
                        <Icon name="LuX" className="h-4 w-4" />
                      </button>
                      <Image src={uploadedImage || '/placeholder.svg'} alt="Original image" width={800} height={600} className="w-full h-auto object-contain" />
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
                        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                          <Icon name="LuSparkles" className="h-8 w-8 text-purple-600 animate-spin" />
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
                      <Button onClick={handleDownload} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
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
                            <Badge className="mt-2 bg-purple-600">
                              {imageStyleTransfer.styleOptions?.find(s => s.id === selectedStyle)?.name} {imageStyleTransfer.styleSelection?.selectedBadgeText}
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
                    key={style.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden',
                      style.bgColor,
                      style.borderColor,
                      'border-2',
                      selectedStyle === style.id && 'ring-2 ring-purple-500 ring-offset-2 scale-105',
                      !uploadedImage && 'opacity-75',
                      !uploadedImage && selectedStyle === style.id && 'opacity-100'
                    )}
                    onClick={() => handleStyleSelect(style.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className={cn('relative w-full h-20 rounded-md overflow-hidden bg-gradient-to-br', style.gradient, 'flex items-center justify-center')}>
                          <Icon name={style.icon} className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>

                        <div className="text-center">
                          <h3 className="font-semibold text-sm">{style.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                        </div>

                        {selectedStyle === style.id && <Badge className="w-full justify-center bg-purple-600 text-white">{imageStyleTransfer.styleSelection?.selectedBadgeText}</Badge>}

                        {!uploadedImage && (
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

        {/* 生成按钮：已选风格且已上传图片时出现 */}
        {uploadedImage && selectedStyle && imageUrl && !processedImage && !isProcessing && (
          <Button onClick={handleGenerate} className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full" disabled={isProcessing}>
            <Icon name="LuSparkles" className="mr-2 h-4 w-4" />
            {'开始生成'}
          </Button>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>
    </section>
  );
}
