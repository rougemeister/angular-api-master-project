# 📰 Angular Blog App (API-Integrated)

A modern and responsive Angular blog application that integrates with an external API (JSONPlaceholder) to display, create, update, and delete posts. It includes search, category filtering, pagination, localStorage caching, offline data persistence, and form validation.

> 🔗 [Live Demo](https://celadon-palmier-d5bede.netlify.app)  
> 📁 [Repository](https://github.com/rougemeister/angular-api-master-project)

---

## ✨ Features

- 📦 Fetch & cache posts from JSONPlaceholder
- ✍️ Create, update, and delete posts with localStorage persistence
- 🔍 Real-time search & category filtering
- 🧾 Pagination with dynamic page management
- ⚡ Offline-first experience using localStorage
- 💬 Add comments to posts (stored locally)
- 📱 Fully responsive layout with modern UI
- 🚫 Profanity filter directive
- ✅ Form validation with visual feedback
- 🔐 Secure with Angular built-in best practices

---



---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/rougemeister/angular-api-master-project.git
cd angular-api-master-project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
npm start
```

Navigate to `http://localhost:4200`.

---

## 🧾 Scripts

| Command             | Description                          |
|---------------------|--------------------------------------|
| `npm start`         | Run development server               |
| `npm run start:dev` | Run with development config          |
| `npm run start:staging` | Run with staging config         |
| `npm run start:prod`| Run with production config           |
| `npm run build`     | Build the app                        |
| `npm run build:dev` | Build with development config        |
| `npm run build:staging` | Build with staging config       |
| `npm run build:prod`| Build with production config         |
| `npm test`          | Run unit tests                       |
| `npm run watch`     | Rebuild on changes (dev)             |
| `npm run watch:staging` | Rebuild on changes (staging)     |

---

## 🌍 Environments

Angular uses environment files to manage configurations per environment.

### File Structure

```bash
src/environments/
├── environment.ts             # Default (development)
├── environment.dev.ts         # Development override
├── environment.prod.ts        # Production config
├── environment.staging.ts     # Staging config
```

### Usage

```ts
import { environment } from '../../environments/environment';
console.log(environment.API_URL);
```

`angular.json` uses file replacements for production, development, and staging modes.

---

## 📡 API Source

- Posts: [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
- Images: [Picsum Photos](https://picsum.photos)

---

## 🧩 Project Structure

```bash
src/
├── app/
│   ├── core/                # Services, constants, models
│   ├── header/              # Header with search and filters
│   ├── homepage/            # Home view with posts and pagination
│   ├── posts/               # Post card component
│   ├── detail-post/         # Single post view with comments
│   ├── create-post/         # Form to create posts
│   ├── edit-post/           # Edit existing posts
│   ├── pagination/          # Pagination component
│   └── shared/              # Pipes, directives (e.g., profanity filter)
```

---

## 🧠 Technical Highlights

- ✅ Angular Standalone Components (v17+)
- ✅ Angular CLI 20
- ✅ HttpClient + RxJS
- ✅ localStorage caching & persistence
- ✅ Custom directives and error handling

---

## ✅ To Do

- [ ] Add user authentication
- [ ] Persist comments to a real backend
- [ ] Dark/light theme toggle
- [ ] Add unit & integration tests

---

## 🧑‍💻 Author

**Prince Emmanuel Biney**  
📎 [GitHub](https://github.com/rougemeister)

---

## 💡 Contribution

Pull requests and suggestions are welcome! Please open an issue or PR to contribute.

---

## 📄 License

No license specified. You are free to fork and modify for learning or contribution purposes.

---

## ⚠️ Note

> JSONPlaceholder is a fake API. All changes like creating, updating, and deleting posts are only saved in `localStorage` — they are not persisted to the server.