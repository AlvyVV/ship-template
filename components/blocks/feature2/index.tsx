import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import {ImageCompareSlider} from '@/components/ui/image-compare-slider';
import { Section as SectionType } from '@/types/blocks/section';

export default function Feature2({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-32">
      <div className="container">
        <div className="mx-auto grid gap-20 lg:grid-cols-2">
          <div>
            {section.label && (
              <Badge variant="outline" className="mb-4">
                {section.label}
              </Badge>
            )}
            <h2 className="mb-6 text-pretty text-3xl font-bold lg:text-4xl">{section.title}</h2>
            <p className="mb-4 max-w-xl text-muted-foreground lg:max-w-none lg:text-lg">{section.description}</p>
            
            {/* 直接展示列表内容 */}
            <div className="space-y-6">
              {section.items?.map((item, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-lg border border-secondary hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    {item.icon && (
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted shrink-0">
                        <Icon name={item.icon} className="size-5 lg:size-6" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium lg:text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm lg:text-base">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            {/* 展示section级别的图片 */}
            {section.compareLeftImage && section.compareRightImage ? (
              <ImageCompareSlider
                leftImage={section.compareLeftImage.src || ''}
                rightImage={section.compareRightImage.src || ''}
                leftImageLabel="处理前"
                rightImageLabel="处理后"
                className="rounded-md overflow-hidden"
              />
            ) : section.image ? (
              <img 
                src={section.image.src} 
                alt={section.image.alt || section.title} 
                className="max-h-auto w-full object-cover lg:max-h-none rounded-md" 
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <p className="text-muted-foreground">暂无图片</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
