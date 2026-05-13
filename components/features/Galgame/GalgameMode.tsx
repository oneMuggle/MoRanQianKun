/**
 * GalgameMode.tsx
 *
 * Galgame 模式容器：组合 SceneBackground + CharacterSprite(s) + GalgameDialogueBox。
 */

import React from 'react';
import { SceneBackground } from './SceneBackground';
import { CharacterSprite } from './CharacterSprite';
import { GalgameDialogueBox, type DialogueOption } from './GalgameDialogueBox';

export interface GalgameCharacter {
  /** 角色 ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 立绘图片 URL */
  imageUrl?: string;
  /** 表情 */
  expression?: 'normal' | 'happy' | 'angry' | 'sad' | 'surprised';
  /** 站位 */
  position: 'left' | 'right' | 'center';
}

export interface GalgameModeProps {
  /** 场景背景 URL */
  backgroundImage?: string;
  /** 场景名称（用于无图降级） */
  sceneName?: string;
  /** 时段 */
  timeOfDay?: '清晨' | '上午' | '下午' | '黄昏' | '夜晚' | '深夜';
  /** 当前说话角色 */
  speaker?: GalgameCharacter;
  /** 场景中可见的角色列表 */
  characters?: GalgameCharacter[];
  /** 对话文本 */
  dialogueText?: string;
  /** 打字机速度 */
  typewriterSpeed?: number;
  /** 可选列表 */
  options?: DialogueOption[];
  /** 选择选项 */
  onOptionSelect?: (optionId: string) => void;
  /** 点击对话框外部 */
  onClick?: () => void;
  /** CSS 类名 */
  className?: string;
}

export const GalgameMode: React.FC<GalgameModeProps> = ({
  backgroundImage,
  sceneName,
  timeOfDay = '上午',
  speaker,
  characters = [],
  dialogueText = '',
  typewriterSpeed = 50,
  options,
  onOptionSelect,
  onClick,
  className = '',
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <SceneBackground
        imageUrl={backgroundImage}
        sceneName={sceneName}
        timeOfDay={timeOfDay}
      />

      {characters.map((char) => (
        <CharacterSprite
          key={char.id}
          name={char.name}
          imageUrl={char.imageUrl}
          expression={char.expression}
          position={char.position}
          isSpeaking={speaker?.id === char.id}
        />
      ))}

      {speaker && dialogueText && (
        <GalgameDialogueBox
          speakerName={speaker.name}
          text={dialogueText}
          typewriterSpeed={typewriterSpeed}
          options={options}
          onOptionSelect={onOptionSelect}
          onClick={onClick}
        />
      )}
    </div>
  );
};
