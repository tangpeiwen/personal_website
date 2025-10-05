# Supabase 设置指南

本项目使用 Supabase 作为图片存储和数据库后端。请按照以下步骤完成设置。

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 创建一个新项目
3. 等待项目初始化完成

## 2. 配置环境变量

1. 在项目根目录创建 `.env.local` 文件
2. 从 Supabase 项目设置 → API 页面获取以下信息：
   - Project URL
   - anon public key

3. 将以下内容添加到 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 创建 Storage Bucket

1. 在 Supabase 控制台，进入 **Storage** 页面
2. 点击 **New bucket**
3. 填写以下信息：
   - Name: `gallery-images`
   - Public bucket: ✅ 勾选（使图片可以公开访问）
4. 点击 **Create bucket**

## 4. 创建数据库表

1. 在 Supabase 控制台，进入 **SQL Editor** 页面
2. 点击 **New query**
3. 复制并执行以下 SQL：

```sql
-- 创建 gallery_metadata 表
create table gallery_metadata (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  title text not null,
  description text,
  file_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用 Row Level Security (RLS)
alter table gallery_metadata enable row level security;

-- 创建策略：允许所有人读取
create policy "Allow public read access"
  on gallery_metadata for select
  using (true);

-- 创建策略：允许所有人插入（生产环境建议添加认证）
create policy "Allow public insert access"
  on gallery_metadata for insert
  with check (true);

-- 创建策略：允许所有人更新（生产环境建议添加认证）
create policy "Allow public update access"
  on gallery_metadata for update
  using (true);

-- 创建策略：允许所有人删除（生产环境建议添加认证）
create policy "Allow public delete access"
  on gallery_metadata for delete
  using (true);

-- 创建索引以提高查询性能
create index gallery_metadata_created_at_idx on gallery_metadata(created_at desc);
```

## 5. Storage 安全策略（可选）

如果需要更精细的访问控制，可以在 Storage → Policies 中设置：

1. 进入 Storage → Policies → gallery-images
2. 添加以下策略：

```sql
-- 允许所有人上传
create policy "Allow public uploads"
  on storage.objects for insert
  with check (bucket_id = 'gallery-images');

-- 允许所有人删除
create policy "Allow public deletes"
  on storage.objects for delete
  using (bucket_id = 'gallery-images');
```

## 6. 测试连接

1. 启动开发服务器：`npm run dev`
2. 访问 http://localhost:3000
3. 滚动到 Gallery 部分
4. 尝试上传一张图片

## 生产环境建议

⚠️ **安全提示**：当前配置允许任何人上传、编辑和删除图片。在生产环境中，建议：

1. 启用 Supabase Authentication
2. 修改 RLS 策略，只允许认证用户进行写操作
3. 添加文件大小和类型限制
4. 实现管理员角色权限

## 故障排查

### 图片无法上传
- 检查 `.env.local` 文件是否正确配置
- 确认 Storage bucket 名称为 `gallery-images`
- 检查浏览器控制台的错误信息

### 图片无法显示
- 确认 bucket 已设置为公开访问
- 检查 Storage policies 是否正确配置

### 数据库错误
- 确认 `gallery_metadata` 表已创建
- 检查 RLS 策略是否正确启用

