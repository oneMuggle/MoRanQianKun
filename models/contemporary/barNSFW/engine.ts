/**
 * 酒吧场景 NSFW 引擎
 *
 * 继承 BaseEngine，实现酒吧场景的回合推进、玩家操作、事件触发和叙事约束注入。
 */

import { BaseEngine } from '../../../hooks/useGame/engine/baseEngine';
import type {
  GameEvent,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
} from '../../../hooks/useGame/engine/types';
import type { NPC结构 } from '../../../models/social';
import {
  酒吧NSFW状态,
  酒吧操作类型,
  酒吧NSFW设置,
  酒吧场景模板,
  酒吧NSFW叙事约束参数,
} from './types';
import { 生成酒吧叙事约束 } from './prompts/酒吧叙事约束';
import { 调度NPC到酒吧 } from './npcScheduling';

import type { 醉酒程度, 消费者核心状态, 服务人员核心状态, 夜场场所状态 } from '../../contemporary/nightlife/types';

const DEFAULT_STATE: 酒吧NSFW状态 = {
  当前场所: null,
  消费者状态: null,
  在场服务人员: [],
  在场NPC: [],
  当前暧昧场景: null,
  当前事件: null,
  已激活: false,
  回合数: 0,
  历史事件: [],
};

export class BarNSFWEngine extends BaseEngine {
  private _state: 酒吧NSFW状态;
  private _settings: 酒吧NSFW设置;
  private _npcMap: Map<string, NPC结构>;

  constructor(settings: 酒吧NSFW设置) {
    super('barNSFW');
    this._state = { ...DEFAULT_STATE };
    this._settings = settings;
    this._npcMap = new Map();
  }

  // ==================== 引擎控制 ====================

  activate(sceneTemplate: 酒吧场景模板, npcList: NPC结构[]): void {
    this._state = {
      ...DEFAULT_STATE,
      当前场所: this._createVenue(sceneTemplate),
      消费者状态: this._createConsumer(),
      已激活: true,
    };
    this._npcMap.clear();
    for (const npc of npcList) {
      this._npcMap.set(npc.id, npc);
    }

    // 使用调度规则计算在场 NPC（替代简单的 是否在场 检查）
    const scheduledNPCs = 调度NPC到酒吧(sceneTemplate, npcList);
    for (const npc of scheduledNPCs) {
      this._state.在场NPC.push(npc.id);
    }

    // 同时保留标记为 是否在场 的 NPC（兼容无调度规则覆盖的情况）
    for (const npc of npcList) {
      if (npc.是否在场 && !this._state.在场NPC.includes(npc.id)) {
        this._state.在场NPC.push(npc.id);
      }
    }

    if (this._settings.启用陪酒服务) {
      this._state.在场服务人员 = this._generateServiceStaff(sceneTemplate);
    }
    this.resume();
  }

  deactivate(): void {
    this._state = { ...DEFAULT_STATE };
    this.pause('phase-change');
  }

  get state(): Readonly<酒吧NSFW状态> {
    return this._state;
  }

  // ==================== SLGEngine 接口实现 ====================

  advanceTurn(): TurnResult {
    this._state.回合数++;
    const events: GameEvent[] = [];

    if (this._settings.启用醉酒系统 && this._state.消费者状态) {
      const 旧醉酒值 = this._state.消费者状态.醉酒值;
      const 新醉酒值 = this._calculateNaturalDrunkChange(this._state.消费者状态.醉酒值);
      this._state.消费者状态.醉酒值 = 新醉酒值;
      this._state.消费者状态.醉酒程度 = this._mapDrunkLevel(新醉酒值);

      if (旧醉酒值 !== 新醉酒值) {
        events.push({
          id: `drunk_change_${this._state.回合数}`,
          engineType: 'barNSFW',
          type: '醉酒变化',
          description: `醉酒值从 ${旧醉酒值}% 变为 ${新醉酒值}%`,
          status: 'resolved',
          payload: { 旧值: 旧醉酒值, 新值: 新醉酒值 },
          createdAt: Date.now(),
          resolvedAt: Date.now(),
        });
      }
    }

    if (this._settings.启用危机事件) {
      const crisisEvent = this._tryTriggerCrisisEvent();
      if (crisisEvent) {
        events.push(crisisEvent);
        this._state.历史事件.push(crisisEvent.type);
      }
    }

    return {
      turnNumber: this._state.回合数,
      phase: 'resolution',
      eventsTriggered: events,
      stateChanges: [],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    if (!this._state.已激活 || !this.canExecuteAction(action)) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<error>场景未激活或操作不可执行</error>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const actionType = action.type as 酒吧操作类型;
    const narrativeParts: string[] = [];

    switch (actionType) {
      case '点酒':
        this._handleOrderDrink(action);
        narrativeParts.push('主角点了一杯酒，酒保熟练地调制好端上桌。');
        break;
      case '搭讪':
        this._handleFlirt(action);
        narrativeParts.push('主角走向目标，开始了搭讪。');
        break;
      case '邀请跳舞':
        this._handleInviteDance(action);
        narrativeParts.push('主角邀请对方跳舞，音乐节奏渐快。');
        break;
      case '邀请唱歌':
        this._handleInviteSing(action);
        narrativeParts.push('主角邀请对方一起唱歌，两人靠近了点歌屏。');
        break;
      case '邀请喝酒':
        this._handleInviteDrink(action);
        narrativeParts.push('主角举杯邀请对方共饮。');
        break;
      case '玩骰子':
        this._handleDiceGame(action);
        narrativeParts.push('骰盅碰撞声响起，两人开始了一场骰子大战。');
        break;
      case '真心话大冒险':
        this._handleTruthOrDare(action);
        narrativeParts.push('气氛变得微妙起来，真心话大冒险开始了。');
        break;
      case '单独聊天':
        this._handleChat(action);
        narrativeParts.push('主角和对方找了个安静的角落坐下聊天。');
        break;
      case '离开酒吧':
        narrativeParts.push('主角起身离开了酒吧。');
        break;
      default:
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: `<error>未知操作: ${actionType}</error>`,
          keyStep: false,
          sideEffects: [],
        };
    }

    this._state.回合数++;

    return {
      success: true,
      stateUpdates: { barState: this._state },
      narrativeConstraint: narrativeParts.join('\n'),
      keyStep: actionType === '搭讪' || actionType === '邀请跳舞' || actionType === '真心话大冒险',
      sideEffects: [],
    };
  }

  canExecuteAction(action: PlayerAction): boolean {
    if (!this._state.已激活) return false;
    const actionType = action.type as 酒吧操作类型;
    const validActions: 酒吧操作类型[] = [
      '点酒', '搭讪', '邀请跳舞', '邀请唱歌',
      '邀请喝酒', '玩骰子', '真心话大冒险', '单独聊天', '离开酒吧',
    ];
    return validActions.includes(actionType);
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._state.回合数,
      timestamp: Date.now(),
      engineStates: {
        barNSFW: {
          ...this._state,
          npcIds: Array.from(this._npcMap.keys()),
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    if (!this._state.已激活 || !this._state.当前场所) {
      return {
        scene: '酒吧未激活',
        turn: this._state.回合数,
        tension: 0,
        playerAction: '无',
        keyStep: false,
        nsfwTriggered: false,
        participants: [],
        nextEvent: '等待玩家行动',
      };
    }

    const params: 酒吧NSFW叙事约束参数 = {
      酒吧类型: this._state.当前场所.类型,
      醉酒程度: this._state.消费者状态?.醉酒程度 || '清醒',
      内容强度: this._settings.内容强度,
      场所档次: this._state.当前场所.档次,
      在场NPC: this._state.在场NPC,
      当前事件: this._state.当前事件 || undefined,
    };

    const primaryNpcId = this._state.在场NPC[0];
    if (primaryNpcId && this._npcMap.has(primaryNpcId)) {
      const npc = this._npcMap.get(primaryNpcId)!;
      params.暧昧对象 = {
        姓名: npc.姓名,
        身份: npc.身份 || '未知',
        好感度: npc.好感度 || 0,
        当前情绪: '平静',
      };
    }

    生成酒吧叙事约束(params);

    return {
      scene: this._state.当前场所.场所名称,
      turn: this._state.回合数,
      tension: this._state.消费者状态?.兴奋程度 || 0,
      playerAction: '酒吧场景中',
      keyStep: this._state.当前事件 !== null,
      nsfwTriggered: this._settings.启用 && this._settings.尺度上限 !== '无',
      participants: this._state.在场NPC.map(id => {
        const npc = this._npcMap.get(id);
        return { id, name: npc?.姓名 || id, status: '在场' };
      }),
      nextEvent: this._state.当前事件 || '等待玩家行动',
    };
  }

  // ==================== 内部辅助 ====================

  private _createVenue(template: 酒吧场景模板): 夜场场所状态 {
    return {
      场所ID: template.id,
      场所名称: template.名称,
      类型: template.类型,
      档次: template.档次,
      营业时间: '18:00-04:00',
      当前客流: 60,
      包厢占用: 40,
      在职公主: template.类型 === '商务会所' ? 5 : template.类型 === '蹦迪酒吧' ? 3 : 0,
      在职少爷: 2,
      模特数量: template.类型 === '商务会所' ? 8 : template.类型 === '蹦迪酒吧' ? 4 : 0,
      安保水平: template.NSFW风险等级 === '高' ? '强' : template.NSFW风险等级 === '中' ? '中' : '弱',
      监控覆盖: template.NSFW风险等级 === '高' ? 80 : template.NSFW风险等级 === '中' ? 50 : 20,
      报警系统: true,
      口碑评分: 4,
      宰客程度: template.档次 === '豪华型' ? 20 : template.档次 === '高档型' ? 30 : 10,
      涉黄程度: template.NSFW风险等级 === '高' ? 70 : template.NSFW风险等级 === '中' ? 40 : 10,
      涉毒风险: template.NSFW风险等级 === '高' ? 30 : 5,
      官方关系: template.NSFW风险等级 === '高' ? 60 : 40,
    };
  }

  private _createConsumer(): 消费者核心状态 {
    return {
      ID: 'player_bar_consumer',
      昵称: '主角',
      性别: '男',
      年龄: 25,
      消费能力: '中产',
      钱包厚度: 5000,
      月夜场消费: 2000,
      醉酒程度: '清醒',
      醉酒值: 0,
      兴奋程度: 20,
      理智程度: 100,
      冲动程度: 0,
      社交目的: '释放压力',
      暧昧对象: undefined,
      关系进展: 0,
      防范意识: 60,
      酒后乱性风险: 0,
      被仙人跳风险: 0,
      被下药风险: 0,
      被骗风险: 0,
      夜场次数: 0,
      醉酒次数: 0,
      出格次数: 0,
      后悔次数: 0,
    };
  }

  private _generateServiceStaff(template: 酒吧场景模板): 服务人员核心状态[] {
    const staffCount = template.类型 === '商务会所' ? 3 : template.类型 === '蹦迪酒吧' ? 2 : 0;
    const staff: 服务人员核心状态[] = [];
    for (let i = 0; i < staffCount; i++) {
      staff.push({
        ID: `staff_${template.id}_${i}`,
        化名: template.类型 === '商务会所' ? `佳丽${i + 1}` : `服务员${i + 1}`,
        性别: '女',
        年龄: 20 + Math.floor(Math.random() * 5),
        身高: 165,
        体重: 50,
        外貌评分: 6 + Math.floor(Math.random() * 4),
        类型: template.类型 === '商务会所' ? '佳丽' : '公主',
        所属场所: template.名称,
        夜场类型: template.类型,
        入行时长: 3 + Math.floor(Math.random() * 12),
        级别: '普通',
        唱功: 50 + Math.floor(Math.random() * 40),
        酒量: 50 + Math.floor(Math.random() * 40),
        社交能力: 50 + Math.floor(Math.random() * 40),
        察言观色: 50 + Math.floor(Math.random() * 40),
        应对技巧: 50 + Math.floor(Math.random() * 40),
        羞耻度: 50,
        麻木度: 20,
        自我保护: 60,
        赚钱欲望: 70,
        酒精依赖: 10,
        被骚扰次数: 0,
        被迫出台次数: 0,
        被下药次数: 0,
        受伤次数: 0,
        月收入: 5000 + Math.floor(Math.random() * 10000),
        小费收入: 1000 + Math.floor(Math.random() * 5000),
        出台收入: 0,
        债务: 0,
        计划转型: false,
        存钱目标: 10000,
      });
    }
    return staff;
  }

  private _calculateNaturalDrunkChange(currentDrunk: number): number {
    return Math.max(0, currentDrunk - 2);
  }

  private _mapDrunkLevel(value: number): 醉酒程度 {
    if (value >= 80) return '烂醉';
    if (value >= 60) return '大醉';
    if (value >= 40) return '上头';
    if (value >= 20) return '微醺';
    return '清醒';
  }

  private _tryTriggerCrisisEvent(): GameEvent | null {
    const consumer = this._state.消费者状态;
    if (!consumer) return null;

    const crisisChance = consumer.醉酒值 * 0.005;
    if (Math.random() > crisisChance) return null;

    const crisisTypes = [
      { type: '醉酒受伤', description: '喝太多酒，脚步不稳摔了一跤' },
      { type: '被占便宜', description: '有人趁醉酒对你动手动脚' },
      { type: '冲突', description: '和旁边桌的客人起了争执' },
      { type: '撒酒疯', description: '酒劲上来，开始大声喧哗' },
    ];

    const crisis = crisisTypes[Math.floor(Math.random() * crisisTypes.length)];

    return {
      id: `crisis_${this._state.回合数}`,
      engineType: 'barNSFW',
      type: crisis.type,
      description: crisis.description,
      status: 'pending',
      payload: { crisisType: crisis.type },
      createdAt: Date.now(),
    };
  }

  private _handleOrderDrink(_action: PlayerAction): void {
    if (!this._state.消费者状态) return;
    const increase = 10 + Math.floor(Math.random() * 10);
    this._state.消费者状态.醉酒值 = Math.min(100, this._state.消费者状态.醉酒值 + increase);
    this._state.消费者状态.醉酒程度 = this._mapDrunkLevel(this._state.消费者状态.醉酒值);
    this._state.消费者状态.兴奋程度 = Math.min(100, this._state.消费者状态.兴奋程度 + 5);
  }

  private _handleFlirt(action: PlayerAction): void {
    const targetNpcId = action.payload?.targetNpcId as string | undefined;
    if (!targetNpcId || !this._state.消费者状态) return;
    this._state.消费者状态.兴奋程度 = Math.min(100, this._state.消费者状态.兴奋程度 + 15);
    this._state.消费者状态.冲动程度 = Math.min(100, this._state.消费者状态.冲动程度 + 10);
    this._state.当前事件 = '表白';
  }

  private _handleInviteDance(_action: PlayerAction): void {
    if (!this._state.消费者状态) return;
    this._state.消费者状态.兴奋程度 = Math.min(100, this._state.消费者状态.兴奋程度 + 20);
    this._state.消费者状态.冲动程度 = Math.min(100, this._state.消费者状态.冲动程度 + 15);
    this._state.当前暧昧场景 = '跳舞';
  }

  private _handleInviteSing(_action: PlayerAction): void {
    if (!this._state.消费者状态) return;
    this._state.消费者状态.兴奋程度 = Math.min(100, this._state.消费者状态.兴奋程度 + 10);
    this._state.当前暧昧场景 = '合唱情歌';
  }

  private _handleInviteDrink(_action: PlayerAction): void {
    if (!this._state.消费者状态) return;
    this._state.消费者状态.醉酒值 = Math.min(100, this._state.消费者状态.醉酒值 + 15);
    this._state.消费者状态.醉酒程度 = this._mapDrunkLevel(this._state.消费者状态.醉酒值);
    this._state.消费者状态.兴奋程度 = Math.min(100, this._state.消费者状态.兴奋程度 + 10);
    this._state.当前事件 = '敬酒';
  }

  private _handleDiceGame(_action: PlayerAction): void {
    if (!this._state.消费者状态) return;
    this._state.消费者状态.醉酒值 = Math.min(100, this._state.消费者状态.醉酒值 + 10);
    this._state.消费者状态.醉酒程度 = this._mapDrunkLevel(this._state.消费者状态.醉酒值);
    this._state.消费者状态.兴奋程度 = Math.min(100, this._state.消费者状态.兴奋程度 + 10);
    this._state.当前事件 = '骰子大战';
  }

  private _handleTruthOrDare(_action: PlayerAction): void {
    if (!this._state.消费者状态) return;
    this._state.消费者状态.兴奋程度 = Math.min(100, this._state.消费者状态.兴奋程度 + 25);
    this._state.消费者状态.冲动程度 = Math.min(100, this._state.消费者状态.冲动程度 + 20);
    this._state.当前暧昧场景 = '真心话大冒险';
  }

  private _handleChat(_action: PlayerAction): void {
    if (!this._state.消费者状态) return;
    this._state.消费者状态.兴奋程度 = Math.min(100, this._state.消费者状态.兴奋程度 + 5);
    this._state.当前暧昧场景 = '单独敬酒';
  }
}
