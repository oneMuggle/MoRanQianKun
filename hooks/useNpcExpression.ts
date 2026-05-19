/**
 * useNpcExpression.ts
 *
 * 角色表情映射 Hook — 根据对话情感标签自动匹配立绘表情。
 */

export type ExpressionType = 'normal' | 'happy' | 'angry' | 'sad' | 'surprised';

const EMOTION_KEYWORDS: Record<string, ExpressionType> = {
  '笑': 'happy',
  '微笑': 'happy',
  '开心': 'happy',
  '高兴': 'happy',
  '欣喜': 'happy',
  '嘴角上扬': 'happy',
  '生气': 'angry',
  '愤怒': 'angry',
  '恼火': 'angry',
  '不满': 'angry',
  '气愤': 'angry',
  '脸色难看': 'angry',
  '脸色不太好看': 'angry',
  '悲伤': 'sad',
  '难过': 'sad',
  '伤心': 'sad',
  '哭': 'sad',
  '落泪': 'sad',
  '失望': 'sad',
  '沮丧': 'sad',
  '眼眶泛红': 'sad',
  '眼眶微微泛红': 'sad',
  '欲言又止': 'sad',
  '惊讶': 'surprised',
  '吃惊': 'surprised',
  '震惊': 'surprised',
  '一愣': 'surprised',
  '微微一愣': 'surprised',
  '害羞': 'happy',
  '脸红': 'happy',
  '脸微微泛红': 'happy',
  '脸颊泛红': 'happy',
  '心跳加速': 'happy',
  '温柔': 'happy',
  '害羞地看着你': 'happy',
  '沉默': 'sad',
  '沉默片刻': 'sad',
  '紧张': 'surprised',
  '不知所措': 'surprised',
  '不知所措地沉默': 'sad',
  '点头': 'normal',
  '点点头': 'normal',
  '摇头': 'normal',
  '转身离去': 'sad',
  '转身': 'sad',
  '离去': 'sad',
};

/**
 * 根据对话文本自动推断表情
 */
export function inferExpressionFromText(text: string): ExpressionType {
  if (!text) return 'normal';
  const sortedKeywords = Object.keys(EMOTION_KEYWORDS).sort((a, b) => b.length - a.length);
  for (const keyword of sortedKeywords) {
    if (text.includes(keyword)) return EMOTION_KEYWORDS[keyword];
  }
  return 'normal';
}

/**
 * 根据对话历史为每个说话者推断表情
 */
export function inferExpressionsFromMessages(
  messages: { speaker: string; text: string }[]
): Map<string, ExpressionType> {
  const result = new Map<string, ExpressionType>();
  for (const msg of messages) {
    if (msg.speaker) result.set(msg.speaker, inferExpressionFromText(msg.text));
  }
  return result;
}
