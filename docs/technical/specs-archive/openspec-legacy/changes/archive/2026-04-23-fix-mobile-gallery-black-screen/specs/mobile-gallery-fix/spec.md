## ADDED Requirements

### Requirement: MobileImageManagerModal 正常渲染

移动端用户点击图册功能时，MobileImageManagerModal 组件 SHALL 正常渲染并显示完整界面。

#### Scenario: 移动端打开图册功能
- **WHEN** 移动端用户点击"图册"按钮
- **THEN** 系统加载并显示 MobileImageManagerModal 组件，显示图像工作台界面

#### Scenario: 懒加载组件正常加载
- **WHEN** 懒加载组件完成加载
- **THEN** 显示图像工作台，包含标题栏、Tab切换、内容区域

#### Scenario: 组件切换 Tab
- **WHEN** 用户点击不同 Tab（如手动、图库、场景）
- **THEN** 切换显示对应 Tab 内容

#### Scenario: 关闭图册弹窗
- **WHEN** 用户点击关闭按钮
- **THEN** 关闭弹窗，返回主界面

### Requirement: UI 元素正确显示

UI 元素 SHALL 正确渲染，包括标题、背景、Tab 按钮等。

#### Scenario: 显示标题栏
- **WHEN** 组件渲染
- **THEN** 显示"图像工作台"标题（Image Matrix 副标题）

#### Scenario: 显示背景纹理
- **WHEN** 组件渲染
- **THEN** 显示背景纹理叠加层

#### Scenario: Tab 按钮可用
- **WHEN** 组件渲染完成
- **THEN** 所有 Tab 按钮可见且可点击

### Requirement: 错误处理

组件 SHALL 正确处理可能的错误和边缘情况。

#### Scenario: 无数据时显示空状态
- **WHEN** 没有 NPC 数据时
- **THEN** 显示"暂无可选角色"等空状态提示

#### Scenario: 数据加载中
- **WHEN** 数据正在加载时
- **THEN** 显示加载状态或骨架屏