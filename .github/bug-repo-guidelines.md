## Bug Reproduction Guidelines

A bug reproduction is runnable code that demonstrates exactly how a bug occurs. Think of it as a recipe that helps us recreate and fix the problem you're experiencing.

### Why text descriptions aren't enough

While detailed descriptions are helpful, they can't replace actual code because:

- Technical problems are difficult to describe precisely without missing crucial details
- The real cause might be something you didn't think to mention
- Only runnable code gives us the complete context we need to debug effectively

### Make it runnable, not just visual

Screenshots and videos show us *that* a bug exists, but not *why* it happens. We need runnable code to understand the root cause and fix it properly.

**Note:** Videos or GIFs can be helpful supplements for explaining complex interactions that are hard to describe in words.

### Keep it minimal

Please don't link to your entire project and ask us to find the bug. Here's why:

- **Time constraints:** Hunting bugs in large, unfamiliar codebases is extremely time-consuming
- **Unclear source:** The issue might be in your application code rather than PixiJS itself
- **Focus:** We need to isolate the exact problem to fix it efficiently

**What "minimal" means:** Include only the essential code needed to trigger the bug. Strip away everything unrelated to the specific issue you're reporting.

### Creating your reproduction

Choose the platform that best fits your needs:

- **[PixiPlayground](https://www.pixiplayground.com/)** - Perfect for most bug reproductions
- **[StackBlitz](https://stackblitz.com/edit/pixijs-v8)** - Use when you need a full build setup
