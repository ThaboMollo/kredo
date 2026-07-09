# Step 2 — Blog & Content Engine

This step implements the financial-literacy blog ("Money 101"), configuring local file-based MDX compilation, dynamic indexing, tag taxonomy routing, and SEO enhancements for articles.

---

## 🎯 Objectives
* Add MDX compilation capabilities to the Next.js App Router.
* Build the blog index and detail page templates.
* Configure dynamic sitemaps containing all MDX article records.
* Inject `Article` JSON-LD schemas into blog posts.
* Build internal-linking blocks in article templates to drive readers to conversion pages.

---

## 🔨 Tasks & Sub-Tasks

### 1. MDX Setup & Processing
- [ ] Install MDX dependencies: `npm install @next/mdx @types/mdx` and markdown formatting utilities.
- [ ] Configure `next.config.js` to process `.mdx` file extensions.
- [ ] Define the frontmatter schema: Title, Description, Publication Date, Author, Category, Cover Image.
- [ ] Write a helper utility `src/utils/mdx.ts` to scan the local file directory `/content/blog/`, read files, extract frontmatter metadata, and return sorted records.

### 2. Blog Routing & Layouts
- [ ] **Blog Index (`src/app/blog/page.tsx`):**
  * Displays a list of all blog posts sorted by date.
  * Adds filter buttons for categories (e.g. Budgeting, Credit, Student Life).
- [ ] **Category Pages (`src/app/blog/category/[category]/page.tsx`):**
  * Displays posts matching a specific category.
- [ ] **Article Page (`src/app/blog/[slug]/page.tsx`):**
  * Loads the target MDX file based on slug, compiles it, and renders it.
  * Integrates dynamic metadata generation using `generateMetadata()` based on frontmatter.
  * Adds standard share buttons and article read-time estimators.

### 3. Internal Conversion Loops
- [ ] Create an inline CTA component `ArticleCTA.tsx` that can be imported or embedded within MDX articles, linking the reader to pricing or onboarding pages.
- [ ] Implement a "Recommended Reading" module at the bottom of the article template.

### 4. Dynamic XML Sitemap & Article Schemas
- [ ] Update `src/app/sitemap.ts` to call the MDX parser utility and include all active blog post paths.
- [ ] Construct and inject an `Article` JSON-LD schema in the head of `blog/[slug]/page.tsx` using frontmatter parameters.

---

## 🏛️ Code Structure Draft (`sitemap.ts`)

```typescript
import { MetadataRoute } from 'next';
import { getAllPosts } from '@/utils/mdx';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  
  const blogUrls = posts.map((post) => ({
    url: `https://kalahari.co.za/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  const staticUrls = [
    { url: 'https://kalahari.co.za/', lastModified: new Date() },
    { url: 'https://kalahari.co.za/how-it-works', lastModified: new Date() },
    { url: 'https://kalahari.co.za/pricing', lastModified: new Date() },
  ];

  return [...staticUrls, ...blogUrls];
}
```

---

## 🔍 Verification Plan

### Automated Tests
* **MDX Frontmatter Validation Test:** Write a script/test that runs during build to verify that every `.mdx` file in `/content/blog/` contains the required frontmatter properties.
* **Sitemap Generation Test:** Request `/sitemap.xml` in testing, and assert that the XML contains the correct URLs for all mock MDX articles.
* **Metadata Output Test:** Request a mock blog page route, and assert that OpenGraph tags match the post title and description.

### Manual Verification
* Author a test MDX file, save it to the content directory, verify it renders correctly at `http://localhost:3000/blog/test-article`, and verify that the layout displays properly on mobile viewports.
