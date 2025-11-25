开发启动
前端代码在 packages/mobile-h5
后端代码在 packages/service

先全局安装依赖，在根路径下
pnpm i


前端启动
cd packages/mobile-h5
pnpm run dev

后端启动
cd packages/service
第一次需要先初始化数据库
pnpm run prisma:generate

然后本地启动可以用
pnpm run start:debug

