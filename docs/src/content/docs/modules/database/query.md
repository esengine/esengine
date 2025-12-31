---
title: "查询语法"
description: "查询条件操作符和语法"
---

## 基本查询

### 精确匹配

```typescript
await repo.findMany({
    where: {
        name: 'John',
        status: 'active'
    }
})
```

### 使用操作符

```typescript
await repo.findMany({
    where: {
        score: { $gte: 100 },
        rank: { $in: ['gold', 'platinum'] }
    }
})
```

## 查询操作符

| 操作符 | 描述 | 示例 |
|--------|------|------|
| `$eq` | 等于 | `{ score: { $eq: 100 } }` |
| `$ne` | 不等于 | `{ status: { $ne: 'banned' } }` |
| `$gt` | 大于 | `{ score: { $gt: 50 } }` |
| `$gte` | 大于等于 | `{ level: { $gte: 10 } }` |
| `$lt` | 小于 | `{ age: { $lt: 18 } }` |
| `$lte` | 小于等于 | `{ price: { $lte: 100 } }` |
| `$in` | 在数组中 | `{ rank: { $in: ['gold', 'platinum'] } }` |
| `$nin` | 不在数组中 | `{ status: { $nin: ['banned', 'suspended'] } }` |
| `$like` | 模式匹配 | `{ name: { $like: '%john%' } }` |
| `$regex` | 正则匹配 | `{ email: { $regex: '@gmail.com$' } }` |

## 逻辑操作符

### $or

```typescript
await repo.findMany({
    where: {
        $or: [
            { score: { $gte: 1000 } },
            { rank: 'legendary' }
        ]
    }
})
```

### $and

```typescript
await repo.findMany({
    where: {
        $and: [
            { score: { $gte: 100 } },
            { score: { $lte: 500 } }
        ]
    }
})
```

### 组合使用

```typescript
await repo.findMany({
    where: {
        status: 'active',
        $or: [
            { rank: 'gold' },
            { score: { $gte: 1000 } }
        ]
    }
})
```

## 模式匹配

### $like 语法

- `%` - 匹配任意字符序列
- `_` - 匹配单个字符

```typescript
// 以 'John' 开头
{ name: { $like: 'John%' } }

// 以 'son' 结尾
{ name: { $like: '%son' } }

// 包含 'oh'
{ name: { $like: '%oh%' } }

// 第二个字符是 'o'
{ name: { $like: '_o%' } }
```

### $regex 语法

使用标准正则表达式：

```typescript
// 以 'John' 开头（大小写不敏感）
{ name: { $regex: '^john' } }

// Gmail 邮箱
{ email: { $regex: '@gmail\\.com$' } }

// 包含数字
{ username: { $regex: '\\d+' } }
```

## 排序

```typescript
await repo.findMany({
    sort: {
        score: 'desc',  // 降序
        name: 'asc'     // 升序
    }
})
```

## 分页

### 使用 limit/offset

```typescript
// 第一页
await repo.findMany({
    limit: 20,
    offset: 0
})

// 第二页
await repo.findMany({
    limit: 20,
    offset: 20
})
```

### 使用 findPaginated

```typescript
const result = await repo.findPaginated(
    { page: 2, pageSize: 20 },
    { sort: { createdAt: 'desc' } }
)
```

## 完整示例

```typescript
// 查找活跃的金牌玩家，分数在 100-1000 之间
// 按分数降序排列，取前 10 个
const players = await repo.findMany({
    where: {
        status: 'active',
        rank: 'gold',
        score: { $gte: 100, $lte: 1000 }
    },
    sort: { score: 'desc' },
    limit: 10
})

// 搜索用户名包含 'john' 或邮箱是 gmail 的用户
const users = await repo.findMany({
    where: {
        $or: [
            { username: { $like: '%john%' } },
            { email: { $regex: '@gmail\\.com$' } }
        ]
    }
})
```
