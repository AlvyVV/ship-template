import { getPgWrapperClient } from '@/lib/db-wrapper';
import { ItemGenerate } from '@/types/item/image-generate';

/**
 * 根据 code 查询图片生成配置
 * @param code
 * @returns
 */
export async function findImageGenerateByCode(code: string): Promise<ItemGenerate | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from('item_configs')
    .select('*')
    .eq('code', code)
    .eq('project_id', process.env.PROJECT_ID)
    .eq('status', 'online')
    .eq('dataType', 'IMAGE_CONFIG')
    .eq('is_deleted', false)
    .single();

  if (error) {
    return undefined;
  }

  const itemGenerate: ItemGenerate = data.content as ItemGenerate;
  return itemGenerate;
}

/**
 * 查询图片生成配置列表
 * @returns
 */
export async function listImageGenerates(): Promise<ItemGenerate[] | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from('item_configs').select('*').eq('project_id', process.env.PROJECT_ID).eq('status', 'online').eq('dataType', 'IMAGE_CONFIG').eq('is_deleted', false);

  if (error) {
    return undefined;
  }

  const itemGenerates: ItemGenerate[] = data.map((item: any) => item.content as ItemGenerate);
  return itemGenerates;
}
