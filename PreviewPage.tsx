/**
 * NPC 身体地图 UI 预览页面
 * 临时页面，用于直接预览敏感点经络图和服装层次图组件
 */

import { useState } from 'react';
import type { NPC结构 } from './models/social';
import type { 完整演化状态, 敏感点档案 } from './models/npcNSFWEnhancement/types';
import { SensitivePointMeridianMap } from './components/features/Social/SensitivePointMeridianMap';
import { ClothingLayerMap } from './components/features/Social/ClothingLayerMap';

const mockNPC: NPC结构 = {
  id: 'demo-001',
  姓名: '夏清歌',
  性别: '女',
  年龄: 22,
  境界: '筑基期',
  身份: '明月教圣女',
  是否在场: true,
  是否队友: false,
  是否主要角色: true,
  好感度: 60,
  关系状态: '暧昧',
  对主角称呼: '公子',
  简介: '明月教圣女，外表清冷，实则内心炽热。',
  记忆: [],
  服饰档案: {
    外套: { 名称: '月白披风', 描述: '轻盈的月白色丝质披风，边缘绣有暗纹' },
    上衣: { 名称: '水绿襦裙', 描述: '柔软的水绿色丝绸襦裙' },
    下着: { 名称: '留仙百褶裙', 描述: '百褶留仙裙，行走间裙摆翻飞' },
    袜子: { 名称: '云纹罗袜', 描述: '精致的云纹白色罗袜' },
    鞋子: { 名称: '绣鞋', 描述: '绣花缎面鞋' },
    内衣: { 名称: '鸳鸯肚兜', 描述: '红色鸳鸯戏水肚兜' },
    配饰: { 名称: '玉佩', 描述: '温润的翡翠玉佩' },
  },
  完整演化状态: {
    服装层次: {
      层次: [
        { 部位: '外套', 名称: '月白披风', 损坏程度: '完好', 污渍: false, 移除顺序: 1 },
        { 部位: '上衣', 名称: '水绿襦裙', 损坏程度: '褶皱', 污渍: false, 移除顺序: 3 },
        { 部位: '下着', 名称: '留仙百褶裙', 损坏程度: '完好', 污渍: false, 移除顺序: 4 },
        { 部位: '袜子', 名称: '云纹罗袜', 损坏程度: '完好', 污渍: false, 移除顺序: 5 },
        { 部位: '鞋子', 名称: '绣鞋', 损坏程度: '完好', 污渍: false, 移除顺序: 2 },
        { 部位: '内衣', 名称: '鸳鸯肚兜', 损坏程度: '凌乱', 污渍: false, 移除顺序: 6 },
        { 部位: '配饰', 名称: '玉佩', 损坏程度: '完好', 污渍: false, 移除顺序: 2 },
      ],
      变更日志: [],
      最后变更时间: '',
    },
    演化日志: [],
    事件计数器: { NSFW互动次数: 0 },
    最后演化时间: '',
  } as 完整演化状态,
  敏感点档案: {
    主要敏感点: [
      { 区域: '头颈区', 名称: '耳垂', 敏感度: 5, 时代名称: '耳珠', 反应描述: '被轻咬或轻吹时全身微颤，呼吸节奏被打乱', 发现状态: '已开发', 描写提示词: '耳尖泛红,轻颤,呼吸急促', 开发程度: '深度开发' },
      { 区域: '头颈区', 名称: '后颈', 敏感度: 4, 反应描述: '被指尖从发际线滑到颈后的触碰会让人不自觉地缩起肩膀', 发现状态: '已发现', 描写提示词: '缩肩,后颈泛红,本能战栗', 开发程度: '初步探索' },
      { 区域: '头颈区', 名称: '太阳穴', 敏感度: 2, 反应描述: '被轻柔按摩时会不自觉放松，闭上眼卸下防备', 发现状态: '未发觉', 描写提示词: '闭眼,放松,微张的唇', 开发程度: '未开发' },
      { 区域: '胸胸区', 名称: '锁骨', 敏感度: 3, 反应描述: '被唇瓣从锁骨一端滑到另一端时呼吸会突然加重', 发现状态: '已发现', 描写提示词: '锁骨起伏,呼吸加重,指尖收紧', 开发程度: '渐入佳境' },
      { 区域: '胸胸区', 名称: '胸口', 敏感度: 5, 反应描述: '被触碰时会本能地弓起身体，发出压抑的低哼', 发现状态: '已开发', 描写提示词: '弓身,低哼,手指抓紧', 开发程度: '完全开发' },
      { 区域: '腰腹区', 名称: '腰侧', 敏感度: 3, 反应描述: '被轻抚腰侧时会不自觉地扭动躲闪，笑着求饶', 发现状态: '已发现', 描写提示词: '扭动躲闪,轻笑,求饶', 开发程度: '初步探索' },
      { 区域: '腰腹区', 名称: '小腹', 敏感度: 4, 反应描述: '温热的手掌覆上小腹时会安静下来，感受那份重量和温度', 发现状态: '未发觉', 描写提示词: '安静,感受温度,掌心贴合', 开发程度: '未开发' },
      { 区域: '四肢区', 名称: '大腿内侧', 敏感度: 5, 反应描述: '被指尖轻触大腿内侧时双腿会本能收紧，呼吸骤停一瞬', 发现状态: '已开发', 描写提示词: '双腿收紧,呼吸骤停,指尖发抖', 开发程度: '渐入佳境' },
      { 区域: '四肢区', 名称: '手心', 敏感度: 2, 反应描述: '十指交握时掌心的温度传递，简单却让人安心', 发现状态: '已发现', 描写提示词: '十指交握,掌心温热,目光闪躲', 开发程度: '初步探索' },
      { 区域: '四肢区', 名称: '膝盖后', 敏感度: 3, 反应描述: '被轻抚膝盖后方时会腿软，需要扶着什么才能站稳', 发现状态: '未发觉', 描写提示词: '腿软,扶住,膝盖微弯', 开发程度: '未开发' },
      { 区域: '背部区', 名称: '脊柱线', 敏感度: 4, 反应描述: '被指尖沿着脊柱从上到下缓慢划过时会起鸡皮疙瘩', 发现状态: '已发现', 描写提示词: '鸡皮疙瘩,脊背弓起,倒吸一口气', 开发程度: '初步探索' },
      { 区域: '背部区', 名称: '肩胛骨', 敏感度: 3, 反应描述: '被从背后环抱时肩胛骨处的触碰让人想要更深地贴紧', 发现状态: '已发现', 描写提示词: '背后环抱,肩胛紧贴,身体后仰', 开发程度: '渐入佳境' },
      { 区域: '特殊区', 名称: '发丝', 敏感度: 2, 反应描述: '被轻柔梳理头发时会像猫一样不自觉眯起眼睛', 发现状态: '已开发', 描写提示词: '眯眼,蹭手心,放松呢喃', 开发程度: '完全开发' },
      { 区域: '特殊区', 名称: '脚踝', 敏感度: 3, 反应描述: '被握住脚踝时会本能地抽腿但又在下一秒放松', 发现状态: '未发觉', 描写提示词: '脚踝微缩,欲拒还迎,脚趾蜷起', 开发程度: '未开发' },
    ],
    隐藏敏感点: [],
    弱点摘要: '她最为敏感的是耳垂与胸口，一旦被触碰便难以保持冷静。',
  } as 敏感点档案,
};

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<'敏感点' | '服装'>('敏感点');

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-6">
      <h1 className="text-2xl font-bold text-wuxia-gold mb-6">NPC 身体地图 UI 预览</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('敏感点')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            activeTab === '敏感点'
              ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/40'
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}
        >
          敏感点经络图
        </button>
        <button
          onClick={() => setActiveTab('服装')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            activeTab === '服装'
              ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/40'
              : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}
        >
          服装层次图
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-[400px] h-[500px] bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden">
          {activeTab === '敏感点' ? (
            <SensitivePointMeridianMap npc={mockNPC} />
          ) : (
            <ClothingLayerMap npc={mockNPC} />
          )}
        </div>

        <div className="w-[300px] bg-gray-900/50 rounded-xl border border-gray-700/50 p-4">
          <h2 className="text-lg font-bold text-pink-400 mb-2">{mockNPC.姓名}</h2>
          <div className="text-xs text-gray-400 space-y-1">
            <p><span className="text-gray-500">身份：</span>{mockNPC.身份}</p>
            <p><span className="text-gray-500">好感度：</span>{mockNPC.好感度}</p>
            <p><span className="text-gray-500">关系：</span>{mockNPC.关系状态}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
