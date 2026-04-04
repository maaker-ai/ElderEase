# What to Test - Build 14

## 本轮主要改动
- 修复内购失败问题（RevenueCat ASC API Key 未配置导致收据验证失败）
- 设置页设计还原（Pro 卡片、DISPLAY 区块、About 区纯文字化）
- 通知功能修复：提前提醒和铃声选择现在实际生效
- 设置页多选项改为 ActionSheet 弹框交互
- 修复 icon 资产文件格式（JPEG 误命名为 .png，已转换为真正 PNG）

## 重点测试
1. **内购流程**：点击"升级无限版" → 应正常弹出 Apple 支付面板
2. **设置页**：检查提醒声音和提前提醒的 ActionSheet 弹框
3. **通知**：添加药物后设置提前提醒，确认通知时间正确
4. **Pro 状态**：购买后设置页应显示 DISPLAY 区块（字体大小 + 高对比度）

## 已知风险
- 首次配置 RevenueCat ASC 凭据，需验证沙盒购买是否正常
- peer dependency 警告（expo-linking、react-native-svg、react-native-worklets），功能测试时注意有无崩溃
