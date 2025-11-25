# 🚀 项目启动指南

欢迎加入项目！按照以下步骤快速启动开发环境。

## 📋 前置要求

- Node.js >= 22.x
- pnpm >= 10.x

## 🔧 环境配置

### 1. 安装依赖

```bash
# 在项目根目录执行
pnpm install
```

### 2. 配置环境变量

**重要：** 项目需要配置环境变量才能运行。

```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，填入实际配置
# Windows 使用 notepad .env
# Mac/Linux 使用 nano .env 或 vim .env
```

### 3. 必填配置项

打开 `.env` 文件，至少需要配置以下项：

#### 🔐 JWT 配置
```bash
JWT_SECRET=请修改为你的密钥（建议使用随机字符串）
```

生成随机密钥：
```bash
# 使用 Node.js 生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 📱 阿里云短信服务配置

如果你需要测试短信功能，请配置以下内容：

```bash
ALIYUN_ACCESS_KEY_ID=从阿里云获取
ALIYUN_ACCESS_KEY_SECRET=从阿里云获取
ALIYUN_SMS_SIGN_NAME=你的短信签名
ALIYUN_SMS_TEMPLATE_CODE=你的短信模板CODE
```

**获取步骤：**

1. **AccessKey：** 访问 [RAM访问控制](https://ram.console.aliyun.com/) 创建
2. **短信签名：** 访问 [短信服务控制台](https://dysms.console.aliyun.com/) 申请
3. **短信模板：** 在短信服务控制台申请，审核通过后获得 CODE

详细配置说明请查看 [SMS_CONFIG.md](./SMS_CONFIG.md)

**💡 如果暂时不需要测试短信功能：**
- 可以找团队其他成员要一份测试配置
- 或者暂时使用占位符（会导致短信功能无法使用）

### 4. 数据库配置

```bash
# 根据项目实际使用的数据库配置
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

然后执行数据库迁移：

```bash
# 生成 Prisma Client
pnpm run prisma:generate

# 执行数据库迁移
pnpm run prisma:migrate

# 或使用 db push（开发环境）
pnpm run prisma:push
```

## 🏃 启动项目

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

启动成功后，服务将运行在默认端口（通常是 3000 或 3001）。

### Q4: .env 文件可以提交到 Git 吗？

**A:** **绝对不可以！** `.env` 包含敏感信息（密钥、密码等），已在 `.gitignore` 中排除。
- ✅ 可以提交：`env.example`（配置模板）
- ❌ 不能提交：`.env`（实际配置）

---

**祝开发愉快！** 🎉

