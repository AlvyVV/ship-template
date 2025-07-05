'use client';

import React from 'react';
import ReactCompareImage from 'react-compare-image';

interface ImageCompareSliderProps {
  /** 左侧图片地址 */
  leftImage: string;
  /** 右侧图片地址 */
  rightImage: string;
  /** 左侧图片标签 */
  leftImageLabel?: string;
  /** 右侧图片标签 */
  rightImageLabel?: string;
  /** 滑动条位置 (0-1) */
  sliderPositionPercentage?: number;
  /** 是否垂直方向 */
  vertical?: boolean;
  /** 自定义样式 */
  className?: string;
  /** 图片样式 */
  imageStyle?: React.CSSProperties;
  /** 滑动条样式 */
  sliderStyle?: React.CSSProperties;
  /** 左侧图片加载完成回调 */
  onLeftImageLoad?: () => void;
  /** 右侧图片加载完成回调 */
  onRightImageLoad?: () => void;
  /** 滑动条位置变化回调 */
  onSliderPositionChange?: (position: number) => void;
}

export function ImageCompareSlider({
                                     leftImage,
                                     rightImage,
                                     leftImageLabel,
                                     rightImageLabel,
                                     sliderPositionPercentage = 0.5,
                                     vertical = false,
                                     className = '',
                                     imageStyle = {},
                                     sliderStyle = {},
                                     onLeftImageLoad,
                                     onRightImageLoad,
                                     onSliderPositionChange,
                                   }: ImageCompareSliderProps) {
  return (
      <div className={`w-full ${className}`}>
        <ReactCompareImage
            leftImage={leftImage}
            rightImage={rightImage}
            leftImageLabel={leftImageLabel}
            rightImageLabel={rightImageLabel}
            sliderPositionPercentage={sliderPositionPercentage}
            vertical={vertical}
            aspectRatio="wider"
            leftImageCss={imageStyle}
            rightImageCss={imageStyle}
            sliderLineColor="#ffffff"
            sliderLineWidth={2}
            handleSize={40}
            onSliderPositionChange={onSliderPositionChange}
            {...(sliderStyle && {sliderStyle})}
        />
      </div>
  );
}