# MVP 发布清单

## 发布前检查

### 功能完整性
- [x] 用户注册/登录
- [x] 创建教程（AI 生成）
- [x] 教程浏览与步骤完成
- [x] 步骤详情查看
- [x] 历史记录
- [x] 勋章系统
- [x] 完成流程

### 技术检查
- [x] 单元测试通过
- [x] CI 配置完成
- [x] 错误监控集成（Sentry）
- [x] 数据库 schema 部署
- [x] RLS 策略配置

### 部署检查
- [ ] Vercel 部署成功
- [ ] Supabase 环境配置
- [ ] 环境变量设置
- [ ] 生产环境测试

## 发布步骤

1. **部署到 Vercel**
   ```bash
   # 如果使用 Vercel CLI
   vercel --prod
   ```
   或在 Vercel 控制台连接 GitHub 仓库，自动部署

2. **配置生产环境变量**
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_SENTRY_DSN（可选）

3. **验证部署**
   - 访问生产 URL
   - 测试核心功能流程
   - 检查错误监控

## 用户反馈收集

### 反馈渠道
- GitHub Issues
- 应用内反馈表单（未来）
- 用户邮箱

### 关键指标监控
- 用户注册数
- 教程创建数
- 完成率
- 错误率（通过 Sentry）

### 已知问题
- AI 调用目前为 mock，需要接入真实 AI 服务
- 部分 UI 可能需要优化

## 后续迭代计划

1. 接入真实 AI 服务（OpenAI/其他）
2. 优化 AI prompt 以提高教程质量
3. 添加更多勋章类型
4. 改进移动端体验
5. 添加社交分享功能
6. 支持自定义步骤编辑

