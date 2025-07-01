import { Button } from '@/types/blocks/base';

export interface StyleOption {
  /** 样式唯一编码 */
  code: string;
  /** 样式名称 */
  name: string;
  /** 样式描述 */
  description: string;
  /** 示例图片 URL，用于列表展示 */
  demoImageUrl: string;
  /**
   * 参数列表 用于替换
   */
  params?: [{ title: string; code: string; description: string; value: string }];
}

export interface ImageStyleTransfer {
  meta?: {
    title?: string;
    description?: string;
  };
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  uploadSection?: {
    title?: string;
    description?: string;
    uploadPlaceholder?: {
      title?: string;
      description?: string;
      buttonText?: string;
    };
    changeButtonText?: string;
  };
  resultSection?: {
    title?: string;
    uploadFirstMessage?: {
      title?: string;
      description?: string;
    };
    processingMessage?: {
      title?: string;
      description?: string;
    };
    readyMessage?: {
      title?: string;
      description?: string;
    };
    downloadButton?: Button;
    tryAnotherButton?: Button;
  };
  styleSelection?: {
    title?: string;
    description?: string;
    uploadFirstMessage?: string;
    selectedBadgeText?: string;
  };
  styleOptions?: StyleOption[];
  fileFormats?: string;
  processingDuration?: number;
  progressTexts?: {
    processing?: string;
    complete?: string;
  };
}
