/**
 * Galgame 预设数据
 *
 * 定义默认路线、结局、CG 和亲密事件。
 * 这些预设数据在引擎初始化时如果没有显式传入，则使用此默认值。
 */

import type {
  GalgameRoute,
  GalgameEnding,
  GalgameCG,
} from '../models/avg/galgame';
import type { IntimacyEvent } from '../hooks/useGame/avg/intimacy/intimacyStateMachine';

// ==================== 路线预设 ====================

export const DEFAULT_GALGAME_ROUTES: GalgameRoute[] = [
  // === 主角线 ===
  {
    id: 'route_main_heroine',
    npcId: 'main_heroine',
    routeName: '红颜知己',
    mutualGroup: 'main_heroine',
    lockLevel: 3,
    eventIds: {
      0: ['evt_main_first_meet', 'evt_main_casual_talk'],
      1: ['evt_main_share_secret', 'evt_main_walk_together'],
      2: ['evt_main_festival_date', 'evt_main_gift_exchange'],
      3: ['evt_main_confession', 'evt_main_secret_garden'],
      4: ['evt_main_moonlight_vow', 'evt_main_future_plan'],
      5: ['evt_main_eternal_bond'],
    },
  },
  {
    id: 'route_sub_heroine',
    npcId: 'sub_heroine',
    routeName: '江湖侠侣',
    mutualGroup: 'sub_heroine',
    lockLevel: 4,
    eventIds: {
      0: ['evt_sub_first_encounter'],
      1: ['evt_sub_martial_exchange'],
      2: ['evt_sub_adventure_partner'],
      3: ['evt_sub_life_danger_save'],
      4: ['evt_sub_heart_to_heart'],
      5: ['evt_sub_sword_dance_duet'],
    },
  },

  // === 中立/友情线 ===
  {
    id: 'route_neutral_friend',
    npcId: 'neutral_friend',
    routeName: '莫逆之交',
    mutualGroup: 'neutral',
    lockLevel: 4,
    eventIds: {
      0: ['evt_neutral_first_meet'],
      1: ['evt_neutral_drinking_buddies'],
      2: ['evt_neutral_martial_brothers'],
      3: ['evt_neutral_life_and_death_oath'],
      4: ['evt_neutral_battle_companion'],
      5: [],
    },
  },
];

// ==================== 结局预设 ====================

export const DEFAULT_GALGAME_ENDINGS: GalgameEnding[] = [
  // === 主角线结局 ===
  {
    id: 'ending_main_good',
    routeId: 'route_main_heroine',
    endingType: 'good',
    title: '琴瑟和鸣',
    description: '你们携手共度余生，成为武林中人人称羡的神仙眷侣。',
    requirements: [
      { type: 'intimacy_min', field: 'intimacy', value: 4 },
      { type: 'event_completed', field: 'evt_main_eternal_bond', value: true },
    ],
    cgIds: ['cg_main_good'],
  },
  {
    id: 'ending_main_normal',
    routeId: 'route_main_heroine',
    endingType: 'normal',
    title: '相忘江湖',
    description: '虽然彼此有情，但最终因各自的道路而渐行渐远，留下一段美好的回忆。',
    requirements: [
      { type: 'intimacy_min', field: 'intimacy', value: 2 },
    ],
    cgIds: ['cg_main_normal'],
  },
  {
    id: 'ending_main_bad',
    routeId: 'route_main_heroine',
    endingType: 'bad',
    title: '陌路殊途',
    description: '误会与猜忌最终让你们形同陌路，再无交集。',
    requirements: [
      { type: 'intimacy_min', field: 'intimacy', value: 1 },
    ],
    cgIds: ['cg_main_bad'],
  },
  {
    id: 'ending_main_true',
    routeId: 'route_main_heroine',
    endingType: 'true',
    title: '比翼双飞',
    description: '历经生死考验，你们终于放下所有顾虑，携手隐居山林，远离江湖纷争。',
    requirements: [
      { type: 'intimacy_min', field: 'intimacy', value: 5 },
      { type: 'event_completed', field: 'evt_main_moonlight_vow', value: true },
      { type: 'event_completed', field: 'evt_main_eternal_bond', value: true },
    ],
    cgIds: ['cg_main_true'],
  },
  {
    id: 'ending_main_secret',
    routeId: 'route_main_heroine',
    endingType: 'secret',
    title: '前世今生',
    description: '一段跨越轮回的缘分，原来你们在前世便已结缘。',
    requirements: [
      { type: 'flag_set', field: 'discovered_past_life', value: true },
      { type: 'intimacy_min', field: 'intimacy', value: 5 },
    ],
    cgIds: ['cg_main_secret'],
  },

  // === 支线结局 ===
  {
    id: 'ending_sub_good',
    routeId: 'route_sub_heroine',
    endingType: 'good',
    title: '剑影侠心',
    description: '你们并肩闯荡江湖，成为人人敬仰的侠侣。',
    requirements: [
      { type: 'intimacy_min', field: 'intimacy', value: 4 },
      { type: 'event_completed', field: 'evt_sub_sword_dance_duet', value: true },
    ],
    cgIds: ['cg_sub_good'],
  },
  {
    id: 'ending_sub_normal',
    routeId: 'route_sub_heroine',
    endingType: 'normal',
    title: '各自天涯',
    description: '江湖路远，你们在不同的道路上继续前行。',
    requirements: [
      { type: 'intimacy_min', field: 'intimacy', value: 2 },
    ],
    cgIds: ['cg_sub_normal'],
  },
  {
    id: 'ending_sub_bad',
    routeId: 'route_sub_heroine',
    endingType: 'bad',
    title: '恩断义绝',
    description: '一场误会让你们反目成仇，剑拔弩张。',
    requirements: [
      { type: 'intimacy_min', field: 'intimacy', value: 1 },
    ],
    cgIds: ['cg_sub_bad'],
  },

  // === 中立线结局 ===
  {
    id: 'ending_neutral_good',
    routeId: 'route_neutral_friend',
    endingType: 'good',
    title: '生死之交',
    description: '你们是真正的知己，可以为对方付出生命。',
    requirements: [
      { type: 'intimacy_min', field: 'intimacy', value: 4 },
      { type: 'event_completed', field: 'evt_neutral_life_and_death_oath', value: true },
    ],
    cgIds: ['cg_neutral_good'],
  },
  {
    id: 'ending_neutral_normal',
    routeId: 'route_neutral_friend',
    endingType: 'normal',
    title: '君子之交',
    description: '淡如水的友情，却能在关键时刻相互扶持。',
    requirements: [
      { type: 'intimacy_min', field: 'intimacy', value: 2 },
    ],
    cgIds: ['cg_neutral_normal'],
  },
];

// ==================== CG 预设 ====================

export const DEFAULT_GALGAME_CGS: GalgameCG[] = [
  // === 主角线 CG ===
  {
    id: 'cg_main_good',
    routeId: 'route_main_heroine',
    title: '琴瑟和鸣',
    description: '月下抚琴，竹林和鸣',
    unlockCondition: { type: 'ending_reached', field: 'ending_main_good', value: true },
    unlocked: false,
  },
  {
    id: 'cg_main_normal',
    routeId: 'route_main_heroine',
    title: '相忘江湖',
    description: '渡口分别，背影渐远',
    unlockCondition: { type: 'ending_reached', field: 'ending_main_normal', value: true },
    unlocked: false,
  },
  {
    id: 'cg_main_bad',
    routeId: 'route_main_heroine',
    title: '陌路殊途',
    description: '雨中背影，形同陌路',
    unlockCondition: { type: 'ending_reached', field: 'ending_main_bad', value: true },
    unlocked: false,
  },
  {
    id: 'cg_main_true',
    routeId: 'route_main_heroine',
    title: '比翼双飞',
    description: '山间小屋前，两人携手远眺云海',
    unlockCondition: { type: 'ending_reached', field: 'ending_main_true', value: true },
    unlocked: false,
  },
  {
    id: 'cg_main_secret',
    routeId: 'route_main_heroine',
    title: '前世今生',
    description: '古寺壁画中，前世的你与她并肩而立',
    unlockCondition: { type: 'ending_reached', field: 'ending_main_secret', value: true },
    unlocked: false,
  },
  {
    id: 'cg_main_confession',
    routeId: 'route_main_heroine',
    title: '月下告白',
    description: '满月之下，她红着脸说出了心意',
    unlockCondition: { type: 'event_triggered', field: 'evt_main_confession', value: true },
    unlocked: false,
  },
  {
    id: 'cg_main_festival',
    routeId: 'route_main_heroine',
    title: '灯会同行',
    description: '元宵灯会，人潮中她悄悄牵住了你的手',
    unlockCondition: { type: 'event_triggered', field: 'evt_main_festival_date', value: true },
    unlocked: false,
  },
  {
    id: 'cg_main_moonlight',
    routeId: 'route_main_heroine',
    title: '月光誓约',
    description: '月光下两人的剪影，许下一生的承诺',
    unlockCondition: { type: 'event_triggered', field: 'evt_main_moonlight_vow', value: true },
    unlocked: false,
  },

  // === 支线 CG ===
  {
    id: 'cg_sub_good',
    routeId: 'route_sub_heroine',
    title: '剑影侠心',
    description: '剑光中她回眸一笑，英姿飒爽',
    unlockCondition: { type: 'ending_reached', field: 'ending_sub_good', value: true },
    unlocked: false,
  },
  {
    id: 'cg_sub_normal',
    routeId: 'route_sub_heroine',
    title: '各自天涯',
    description: '岔路口，两人各奔前程',
    unlockCondition: { type: 'ending_reached', field: 'ending_sub_normal', value: true },
    unlocked: false,
  },
  {
    id: 'cg_sub_bad',
    routeId: 'route_sub_heroine',
    title: '恩断义绝',
    description: '剑刃相向，昔日情义化为乌有',
    unlockCondition: { type: 'ending_reached', field: 'ending_sub_bad', value: true },
    unlocked: false,
  },
  {
    id: 'cg_sub_save',
    routeId: 'route_sub_heroine',
    title: '生死相救',
    description: '危难之际她奋不顾身，挡下了致命一击',
    unlockCondition: { type: 'event_triggered', field: 'evt_sub_life_danger_save', value: true },
    unlocked: false,
  },
  {
    id: 'cg_sub_sword',
    routeId: 'route_sub_heroine',
    title: '剑舞双飞',
    description: '两人对练剑法，剑光交错间心意相通',
    unlockCondition: { type: 'event_triggered', field: 'evt_sub_sword_dance_duet', value: true },
    unlocked: false,
  },

  // === 中立线 CG ===
  {
    id: 'cg_neutral_good',
    routeId: 'route_neutral_friend',
    title: '生死之交',
    description: '战场之上，背靠背的身影是最可靠的信任',
    unlockCondition: { type: 'ending_reached', field: 'ending_neutral_good', value: true },
    unlocked: false,
  },
  {
    id: 'cg_neutral_normal',
    routeId: 'route_neutral_friend',
    title: '君子之交',
    description: '煮酒论剑，快意人生',
    unlockCondition: { type: 'ending_reached', field: 'ending_neutral_normal', value: true },
    unlocked: false,
  },
  {
    id: 'cg_neutral_oath',
    routeId: 'route_neutral_friend',
    title: '生死誓言',
    description: '桃园结义般的仪式，从此生死与共',
    unlockCondition: { type: 'event_triggered', field: 'evt_neutral_life_and_death_oath', value: true },
    unlocked: false,
  },
];

// ==================== 亲密事件预设 ====================

export const DEFAULT_INTIMACY_EVENTS: IntimacyEvent[] = [
  // 主角线事件
  {
    id: 'evt_main_first_meet',
    npcId: 'main_heroine',
    requiredLevel: 0,
    title: '初次相遇',
    description: '命运般的邂逅',
    triggered: false,
  },
  {
    id: 'evt_main_casual_talk',
    npcId: 'main_heroine',
    requiredLevel: 0,
    title: '闲谈',
    description: '轻松愉快的日常对话',
    triggered: false,
  },
  {
    id: 'evt_main_share_secret',
    npcId: 'main_heroine',
    requiredLevel: 1,
    title: '分享秘密',
    description: '向你吐露心底的秘密',
    triggered: false,
  },
  {
    id: 'evt_main_walk_together',
    npcId: 'main_heroine',
    requiredLevel: 1,
    title: '并肩而行',
    description: '一起漫步在林间小道',
    triggered: false,
  },
  {
    id: 'evt_main_festival_date',
    npcId: 'main_heroine',
    requiredLevel: 2,
    title: '灯会约会',
    description: '一起参加节日庆典',
    triggered: false,
  },
  {
    id: 'evt_main_gift_exchange',
    npcId: 'main_heroine',
    requiredLevel: 2,
    title: '互赠礼物',
    description: '精心准备的礼物传递心意',
    triggered: false,
  },
  {
    id: 'evt_main_confession',
    npcId: 'main_heroine',
    requiredLevel: 3,
    title: '告白',
    description: '终于说出了那句话',
    triggered: false,
  },
  {
    id: 'evt_main_secret_garden',
    npcId: 'main_heroine',
    requiredLevel: 3,
    title: '秘密花园',
    description: '发现属于你们的秘密场所',
    triggered: false,
  },
  {
    id: 'evt_main_moonlight_vow',
    npcId: 'main_heroine',
    requiredLevel: 4,
    title: '月光誓约',
    description: '在月光下许下一生的承诺',
    triggered: false,
  },
  {
    id: 'evt_main_future_plan',
    npcId: 'main_heroine',
    requiredLevel: 4,
    title: '规划未来',
    description: '一起憧憬未来的生活',
    triggered: false,
  },
  {
    id: 'evt_main_eternal_bond',
    npcId: 'main_heroine',
    requiredLevel: 5,
    title: '永恒羁绊',
    description: '命运将你们紧紧相连',
    triggered: false,
  },

  // 支线事件
  {
    id: 'evt_sub_first_encounter',
    npcId: 'sub_heroine',
    requiredLevel: 0,
    title: '江湖初遇',
    description: '刀光剑影中的第一次相遇',
    triggered: false,
  },
  {
    id: 'evt_sub_martial_exchange',
    npcId: 'sub_heroine',
    requiredLevel: 1,
    title: '切磋武艺',
    description: '通过比武增进了解',
    triggered: false,
  },
  {
    id: 'evt_sub_adventure_partner',
    npcId: 'sub_heroine',
    requiredLevel: 2,
    title: '冒险搭档',
    description: '一起经历江湖冒险',
    triggered: false,
  },
  {
    id: 'evt_sub_life_danger_save',
    npcId: 'sub_heroine',
    requiredLevel: 3,
    title: '生死相救',
    description: '在危难时刻奋不顾身',
    triggered: false,
  },
  {
    id: 'evt_sub_heart_to_heart',
    npcId: 'sub_heroine',
    requiredLevel: 4,
    title: '促膝长谈',
    description: '深夜里敞开心扉',
    triggered: false,
  },
  {
    id: 'evt_sub_sword_dance_duet',
    npcId: 'sub_heroine',
    requiredLevel: 5,
    title: '剑舞双飞',
    description: '心意相通的剑舞',
    triggered: false,
  },

  // 中立线事件
  {
    id: 'evt_neutral_first_meet',
    npcId: 'neutral_friend',
    requiredLevel: 0,
    title: '意气相投',
    description: '一见如故的相遇',
    triggered: false,
  },
  {
    id: 'evt_neutral_drinking_buddies',
    npcId: 'neutral_friend',
    requiredLevel: 1,
    title: '把酒言欢',
    description: '酒逢知己千杯少',
    triggered: false,
  },
  {
    id: 'evt_neutral_martial_brothers',
    npcId: 'neutral_friend',
    requiredLevel: 2,
    title: '武林知己',
    description: '以武会友，相见恨晚',
    triggered: false,
  },
  {
    id: 'evt_neutral_life_and_death_oath',
    npcId: 'neutral_friend',
    requiredLevel: 3,
    title: '生死之誓',
    description: '从此生死与共',
    triggered: false,
  },
  {
    id: 'evt_neutral_battle_companion',
    npcId: 'neutral_friend',
    requiredLevel: 4,
    title: '战场搭档',
    description: '浴血奋战的战友之情',
    triggered: false,
  },
];

// ==================== 导出合集 ====================

export interface GalgamePresetBundle {
  routes: GalgameRoute[];
  endings: GalgameEnding[];
  cgs: GalgameCG[];
  events: IntimacyEvent[];
}

export const DEFAULT_GALGAME_PRESET: GalgamePresetBundle = {
  routes: DEFAULT_GALGAME_ROUTES,
  endings: DEFAULT_GALGAME_ENDINGS,
  cgs: DEFAULT_GALGAME_CGS,
  events: DEFAULT_INTIMACY_EVENTS,
};

// 统计信息
export const GALGAME_PRESET_STATS = {
  routeCount: DEFAULT_GALGAME_ROUTES.length,
  endingCount: DEFAULT_GALGAME_ENDINGS.length,
  cgCount: DEFAULT_GALGAME_CGS.length,
  eventCount: DEFAULT_INTIMACY_EVENTS.length,
} as const;
