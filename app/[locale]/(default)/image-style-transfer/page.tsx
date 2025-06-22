import ImageStyleTransferBlock from '@/components/blocks/image-style-transfer'
import type { ImageStyleTransfer } from '@/types/blocks/image-style-transfer'

const imageStyleTransferData: ImageStyleTransfer = {
  name: 'image-style-transfer',
  title: 'AI Image Style Transfer',
  description: 'Transform your photos with AI-powered artistic styles. Upload an image and choose from various artistic filters to create stunning visual effects.',
  uploadSection: {
    title: 'Upload Your Image',
    description: 'Choose an image to transform with our AI-powered style transfer technology',
    uploadPlaceholder: {
      title: 'Drop your image here',
      description: 'Supports JPG, PNG, WebP formats up to 10MB',
      buttonText: 'Choose Image'
    },
    changeButtonText: 'Change Image'
  },
  resultSection: {
    title: 'Styled Result',
    uploadFirstMessage: {
      title: 'Upload an image first',
      description: 'Select an image and choose a style to see the transformation'
    },
    processingMessage: {
      title: 'Creating magic...',
      description: 'AI is applying the selected style to your image'
    },
    readyMessage: {
      title: 'Select a style',
      description: 'Choose an artistic style below to transform your image'
    },
    downloadButton: {
      title: 'Download Image'
    },
    tryAnotherButton: {
      title: 'Try Another Style'
    }
  },
  styleSelection: {
    title: 'Choose Artistic Style',
    description: 'Select from our collection of AI-powered artistic filters and transformations',
    uploadFirstMessage: 'Upload image first',
    selectedBadgeText: 'Selected'
  },
  styleOptions: [
    {
      id: 'van-gogh',
      name: 'Van Gogh',
      description: 'Post-impressionist swirls and bold colors',
      icon: 'LuBrush',
      gradient: 'from-blue-500 to-yellow-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'picasso',
      name: 'Picasso',
      description: 'Cubist geometric forms and abstract shapes',
      icon: 'LuShapes',
      gradient: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'monet',
      name: 'Monet',
      description: 'Impressionist light and water reflections',
      icon: 'LuDroplets',
      gradient: 'from-green-500 to-blue-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'anime',
      name: 'Anime',
      description: 'Japanese animation style with vibrant colors',
      icon: 'LuSparkles',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'watercolor',
      name: 'Watercolor',
      description: 'Soft watercolor painting effect',
      icon: 'LuPaintBucket',
      gradient: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    },
    {
      id: 'sketch',
      name: 'Pencil Sketch',
      description: 'Hand-drawn pencil sketch appearance',
      icon: 'LuPencil',
      gradient: 'from-gray-500 to-slate-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      id: 'oil-painting',
      name: 'Oil Painting',
      description: 'Classic oil painting with rich textures',
      icon: 'LuPalette',
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      id: 'cartoon',
      name: 'Cartoon',
      description: 'Colorful cartoon-style transformation',
      icon: 'LuSmile',
      gradient: 'from-yellow-500 to-red-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ],
  fileFormats: 'Supports JPG, PNG, WebP (max 10MB)',
  processingDuration: 3000,
  progressTexts: {
    processing: 'Processing...',
    complete: 'Complete'
  }
}

export default function ImageStyleTransferPage() {
  return (
    <div className="min-h-screen">
      <ImageStyleTransferBlock imageStyleTransfer={imageStyleTransferData} />
    </div>
  )
}