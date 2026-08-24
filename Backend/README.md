# 🎓 Udemy Clone — Express + PostgreSQL + Prisma Backend

A production-ready REST API for an online learning platform with full role-based access control.

## 🏗️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (Access + Refresh Token rotation)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting, bcryptjs

---

## 📁 Project Structure

```
udemy-clone/
├── prisma/
│   ├── schema.prisma          # Full DB schema
│   └── seed.js                # Sample data seeder
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client
│   │   └── jwt.js             # Token utilities
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── course.controller.js
│   │   ├── curriculum.controller.js
│   │   ├── review.controller.js
│   │   ├── enrollment.controller.js
│   │   ├── user.controller.js
│   │   ├── admin.controller.js
│   │   └── category.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js     # JWT + Role guards
│   │   ├── validate.middleware.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── course.routes.js
│   │   ├── user.routes.js
│   │   ├── admin.routes.js
│   │   ├── enrollment.routes.js
│   │   ├── review.routes.js
│   │   └── category.routes.js
│   ├── utils/
│   │   └── response.js
│   ├── validators/
│   │   └── index.js
│   ├── app.js
│   └── index.js
├── .env.example
└── package.json
```

---

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Database setup
```bash
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations (creates all tables)
npm run db:seed         # Seed sample data
```

### 4. Start server
```bash
npm run dev    # Development (nodemon)
npm start      # Production
```

---

## 🔐 Roles

| Role         | Permissions |
|--------------|-------------|
| `STUDENT`    | Browse courses, enroll, review enrolled courses |
| `INSTRUCTOR` | All student perms + create/manage own courses & curriculum |
| `SUPERADMIN` | Full access — manage users, approve/reject courses, delete anything |

---

## 🌐 API Reference — Base URL: `/api/v1`

### 🔑 Auth — `/auth`

| Method | Endpoint         | Access  | Description              |
|--------|------------------|---------|--------------------------|
| POST   | `/register`      | Public  | Register (STUDENT/INSTRUCTOR) |
| POST   | `/login`         | Public  | Login, returns tokens    |
| POST   | `/refresh`       | Public  | Refresh access token     |
| POST   | `/logout`        | Public  | Revoke refresh token     |
| GET    | `/me`            | Auth    | Get own profile          |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass",
  "role": "STUDENT"
}
```

**Login response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "role": "STUDENT" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### 📚 Courses — `/courses`

| Method | Endpoint                                    | Access                      | Description                  |
|--------|---------------------------------------------|-----------------------------|------------------------------|
| GET    | `/`                                         | Public                      | List all published courses   |
| GET    | `/:id`                                      | Public                      | Get full course details      |
| POST   | `/`                                         | INSTRUCTOR, SUPERADMIN      | Create course                |
| PUT    | `/:id`                                      | INSTRUCTOR (own), SUPERADMIN | Update course               |
| DELETE | `/:id`                                      | INSTRUCTOR (own), SUPERADMIN | Delete course               |
| PATCH  | `/:id/publish`                              | INSTRUCTOR (own), SUPERADMIN | Toggle publish              |
| GET    | `/instructor/my-courses`                    | INSTRUCTOR, SUPERADMIN      | Get own courses              |
| POST   | `/:courseId/sections`                       | INSTRUCTOR, SUPERADMIN      | Add section                  |
| PUT    | `/:courseId/sections/:sectionId`            | INSTRUCTOR, SUPERADMIN      | Update section               |
| DELETE | `/:courseId/sections/:sectionId`            | INSTRUCTOR, SUPERADMIN      | Delete section               |
| POST   | `/:courseId/sections/:sectionId/lessons`    | INSTRUCTOR, SUPERADMIN      | Add lesson                   |
| PUT    | `/:courseId/sections/:sectionId/lessons/:id`| INSTRUCTOR, SUPERADMIN      | Update lesson                |
| DELETE | `/:courseId/sections/:sectionId/lessons/:id`| INSTRUCTOR, SUPERADMIN      | Delete lesson                |

**GET /courses query params:**
```
?page=1&limit=10
&search=tally
&category=tally           (category slug)
&level=Beginner
&language=English
&minPrice=0&maxPrice=999
&sortBy=rating&sortOrder=desc
&badge=Hot
&free=true
```

**POST /courses body:**
```json
{
  "title": "Tally Prime",
  "subtitle": "Learn Tally Prime from basics...",
  "description": "Master Tally Prime with practical...",
  "image": "https://...",
  "previewVideo": "https://...",
  "price": 0,
  "originalPrice": 999,
  "language": "English",
  "level": "Beginner",
  "badge": "Hot",
  "lastUpdated": "May 2026",
  "hasCertificate": true,
  "hasLifetimeAccess": true,
  "hasMobileAccess": true,
  "categoryId": "uuid",
  "subcategoryId": "uuid",
  "whatYouWillLearn": ["Learn GST", "Learn Inventory"],
  "requirements": ["Basic computer knowledge"],
  "tags": ["Tally", "GST", "Accounting"]
}
```

---

### 🎬 Curriculum (nested under /courses)

**POST `/courses/:courseId/sections`**
```json
{ "title": "Introduction", "totalDuration": "1h 20m", "order": 0 }
```

**POST `/courses/:courseId/sections/:sectionId/lessons`**
```json
{
  "title": "Welcome to Tally Prime",
  "duration": "5:20",
  "isPreview": true,
  "type": "video",
  "videoUrl": "https://...",
  "order": 0
}
```

---

### ⭐ Reviews — `/reviews`

| Method | Endpoint                    | Access         | Description               |
|--------|-----------------------------|----------------|---------------------------|
| GET    | `/course/:courseId`         | Public         | Get course reviews        |
| POST   | `/course/:courseId`         | STUDENT (enrolled) | Submit review         |
| DELETE | `/:reviewId`                | Author, SUPERADMIN | Delete review         |
| POST   | `/:reviewId/helpful`        | Auth           | Toggle helpful vote       |

---

### 🎓 Enrollments — `/enrollments`

| Method | Endpoint                  | Access | Description              |
|--------|---------------------------|--------|--------------------------|
| POST   | `/:courseId`              | Auth   | Enroll in a course       |
| GET    | `/my`                     | Auth   | My enrolled courses      |
| GET    | `/:courseId/check`        | Auth   | Check enrollment status  |
| PATCH  | `/:courseId/progress`     | Auth   | Update course progress   |

---

### 👤 Users — `/users`

| Method | Endpoint         | Access | Description          |
|--------|------------------|--------|----------------------|
| GET    | `/:id`           | Public | Public profile       |
| PUT    | `/me/profile`    | Auth   | Update own profile   |
| PUT    | `/me/password`   | Auth   | Change password      |

---

### 🏷️ Categories — `/categories`

| Method | Endpoint       | Access      | Description         |
|--------|----------------|-------------|---------------------|
| GET    | `/`            | Public      | All categories      |
| POST   | `/`            | SUPERADMIN  | Create category     |
| POST   | `/subcategory` | SUPERADMIN  | Create subcategory  |
| DELETE | `/:id`         | SUPERADMIN  | Delete category     |

---

### 🛡️ Admin — `/admin` *(SUPERADMIN only)*

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/dashboard`                | Platform stats           |
| GET    | `/users`                    | All users (filterable)   |
| GET    | `/users/:id`                | User detail              |
| PATCH  | `/users/:id/role`           | Update user role         |
| PATCH  | `/users/:id/status`         | Activate/deactivate user |
| GET    | `/courses/pending`          | Courses awaiting approval|
| PATCH  | `/courses/:id/approve`      | Approve a course         |
| PATCH  | `/courses/:id/reject`       | Reject a course          |
| DELETE | `/courses/:id`              | Force delete any course  |

---

## 🧪 Test Credentials (after seeding)

| Role       | Email                        | Password      |
|------------|------------------------------|---------------|
| SUPERADMIN | admin@udemy-clone.com        | password123   |
| INSTRUCTOR | instructor@udemy-clone.com   | password123   |
| STUDENT    | student@udemy-clone.com      | password123   |

---

## 🔄 Auth Flow

```
1. POST /auth/register  →  { accessToken, refreshToken }
2. Use accessToken in:  Authorization: Bearer <accessToken>
3. When expired:        POST /auth/refresh { refreshToken }
4. On logout:           POST /auth/logout  { refreshToken }
```

---

## 📊 Course Schema (DB)

The course entity exactly mirrors the reference schema:

| Field              | Type     | Notes                              |
|--------------------|----------|------------------------------------|
| title, subtitle    | String   | Course name & tagline              |
| description        | String   | Full course description            |
| image              | String   | Thumbnail URL                      |
| previewVideo       | String   | Free preview video URL             |
| rating             | Float    | Avg from reviews (auto-computed)   |
| reviewCount        | Int      | Auto-computed on review add/delete |
| studentCount       | Int      | Auto-incremented on enrollment     |
| price/originalPrice| Float    | Current & crossed-out price        |
| level              | Enum     | Beginner/Intermediate/Advanced     |
| badge              | Enum     | Hot/Bestseller/New/TopRated        |
| whatYouWillLearn   | Relation | Array of learning outcomes         |
| requirements       | Relation | Array of prerequisites             |
| tags               | Relation | M2M via CourseTag pivot            |
| curriculum         | Relation | Sections → Lessons tree            |
| reviews            | Relation | With author, rating, helpful count |
| instructor         | Relation | User with INSTRUCTOR role          |
