# 认证 API 接口文档

## 1. 用户登录 - `/auth/login` (POST)

### 接口描述
用于用户登录并获取访问令牌（access token）。

### 请求方法
- **POST**

### 请求路径
- `/auth/login`

### 请求频率限制
- 每个IP地址每15分钟最多允许5次登录尝试。
- 超出限制将返回错误："Too many login attempts, please try again later."

### 请求体参数
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | String | 是 | 用户ID，必须是无符号整数字符串 |
| username | String | 是 | 用户名，必须是中文名称字符串 |
| password | String | 否 | 用户密码，如果该用户设置了密码要求，则此项必填 |

### 响应
#### 成功响应 (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 错误响应
- **401 Unauthorized**: 凭据无效
  ```json
  {
    "error": "Invalid credentials"
  }
  ```
  
- **422 Unprocessable Entity**: 输入参数验证失败
  ```json
  {
    "message": "Invalid user ID or username",
    "code": "ValidationError",
    "field": "id/username"
  }
  ```

---

## 2. 单个用户注册 - `/auth/register` (POST)

### 接口描述
用于管理员手动创建用户或通过签名创建用户。

### 请求方法
- **POST**

### 请求路径
- `/auth/register`

### 请求频率限制
- 每个IP地址每15分钟最多允许10次注册请求。
- 超出限制将返回错误：`Too many registration attempts, please try again later.`

### 请求头
- `Authorization: Bearer <token>` (当不使用签名验证时需要提供管理员令牌)

### 请求体参数
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | String | 是 | 用户ID，必须是无符号整数字符串 |
| username | String | 是 | 用户名，必须是中文名称字符串 |
| password | String | 条件 | 当`passwordRequired`为1或`isAdmin`为1时必填 |
| passwordRequired | Number | 否 | 是否需要密码（0或1，默认为0） |
| isAdmin | Number | 否 | 是否为管理员（0或1，默认为0），仅在签名注册时有效 |
| signature | String | 否 | RSA签名，用于签名验证方式注册 |
| createdAt | Number | 否 | 创建时间戳，用于签名验证方式注册 |

### 响应
#### 成功响应 (200 OK)
```json
{
  "success": true,
  "id": "123456",
  "username": "张三"
}
```

#### 失败响应 (200 OK)
```json
{
  "success": false,
  "id": "123456",
  "username": "张三",
  "error": {
    "message": "错误消息",
    "code": "错误代码",
    "field": "错误字段"
  }
}
```

#### 错误响应
- **401 Unauthorized**: 未授权
  - 没有提供有效的管理员令牌
  - 签名无效
  
- **422 Unprocessable Entity**: 输入参数验证失败
  - 密码长度不在8-64字符之间
  - 用户ID或用户名格式无效

---

## 3. 批量用户注册 - `/auth/register/batch` (POST)

### 接口描述
用于批量创建多个用户。

### 请求方法
- **POST**

### 请求路径
- `/auth/register/batch`

### 请求频率限制
- 每个IP地址每15分钟最多允许3次批量注册请求。
- 超出限制将返回错误："Too many registration attempts, please try again later."

### 请求头
- `Authorization: Bearer <token>` (当部分用户不使用签名验证时需要提供管理员令牌)

### 请求体参数
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userList | Array | 是 | 用户列表，最多30个用户 |

#### `userList` 数组元素结构
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | String | 是 | 用户ID，必须是无符号整数字符串 |
| username | String | 是 | 用户名，必须是中文名称字符串 |
| password | String | 条件 | 当`passwordRequired`为`1`或`isAdmin`为`1`时必填 |
| passwordRequired | Number | 否 | 是否需要密码（`0`或`1`，默认为`0`） |
| isAdmin | Number | 否 | 是否为管理员（`0`或`1`，默认为`0`），仅在签名注册时有效 |
| signature | String | 否 | RSA签名，用于签名验证方式注册 |
| createdAt | Number | 否 | 创建时间戳，用于签名验证方式注册 |

### 响应
#### 成功响应 (200 OK)
```json
{
  "result": [
    {
      "success": true,
      "id": "123456",
      "username": "张三"
    },
    {
      "success": false,
      "id": "123457",
      "username": "李四",
      "error": {
        "message": "User already exists",
        "code": "ConflictError",
        "field": "id"
      }
    }
  ]
}
```

#### 错误响应
- **422 Unprocessable Entity**: 
  - userList 不是数组
  - userList 长度超过30个用户
  - 其他验证错误

- **401 Unauthorized**: 
  - 提供的令牌不是管理员令牌
  - 签名无效