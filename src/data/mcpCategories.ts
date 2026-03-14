import type { MCPCategory } from "./mcpServers";

export interface MCPCategoryDef {
  id: MCPCategory;
  label: string;
  description: string;
  longDescription: string;
  icon: string;   // emoji
  color: string;  // Tailwind bg class for the icon container
}

export const mcpCategoryDefs: MCPCategoryDef[] = [
  {
    id: "databases",
    label: "Databases",
    description: "Connect your AI to PostgreSQL, SQLite, Supabase, and more",
    longDescription:
      "Database MCP servers give your AI assistant read (and sometimes write) access to your data. Instead of copy-pasting query results into the chat, your AI can query your database directly, generate SQL, and answer questions about your data in real time. All connections are local — your credentials never leave your machine.",
    icon: "🗄️",
    color: "bg-blue-500/10",
  },
  {
    id: "developer-tools",
    label: "Developer Tools",
    description: "GitHub, Git, filesystem, memory, and code-focused servers",
    longDescription:
      "Developer tool servers give your AI direct access to your development workflow — reading files, interacting with GitHub, inspecting git history, and maintaining persistent memory across sessions. These are the servers most developers install first.",
    icon: "⚙️",
    color: "bg-violet-500/10",
  },
  {
    id: "web",
    label: "Web",
    description: "Browser control, web scraping, and real-time search",
    longDescription:
      "Web servers let your AI browse, scrape, and search the internet. From fetching a documentation page to controlling a full Chrome browser, these servers remove the boundary between your AI and live web content.",
    icon: "🌐",
    color: "bg-cyan-500/10",
  },
  {
    id: "productivity",
    label: "Productivity",
    description: "Notion, Google Drive, Calendar, and document management",
    longDescription:
      "Productivity servers connect your AI to the apps where your knowledge lives — Notion, Google Drive, and document management tools. Search, read, and update your documents without leaving your AI client.",
    icon: "📋",
    color: "bg-emerald-500/10",
  },
  {
    id: "communication",
    label: "Communication",
    description: "Slack, email, and team messaging integrations",
    longDescription:
      "Communication servers let your AI read and write messages across the platforms your team uses. Summarize channel history, draft replies, or post updates — without switching context from your editor or chat client.",
    icon: "💬",
    color: "bg-orange-500/10",
  },
  {
    id: "cloud",
    label: "Cloud Infrastructure",
    description: "Cloudflare, AWS, Vercel, and deployment tools",
    longDescription:
      "Cloud infrastructure servers give your AI access to your deployment and infrastructure platforms. Deploy Workers, manage storage, inspect logs, and configure resources — all through conversation.",
    icon: "☁️",
    color: "bg-sky-500/10",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    description: "Documentation search, internal wikis, and knowledge bases",
    longDescription:
      "Knowledge servers let your AI search and retrieve information from your internal documentation, wikis, and knowledge management systems. Stop switching tabs — ask your AI and get answers sourced from your own docs.",
    icon: "📚",
    color: "bg-amber-500/10",
  },
  {
    id: "ai-models",
    label: "AI Models",
    description: "OpenAI, Replicate, and other AI model integrations",
    longDescription:
      "AI model servers let one AI assistant call other AI models. Use Claude to orchestrate GPT-4, run image generation, or access specialized models — all from a single conversation.",
    icon: "🤖",
    color: "bg-rose-500/10",
  },
  {
    id: "utilities",
    label: "Utilities",
    description: "Time, location, math, and general-purpose helpers",
    longDescription:
      "Utility servers add small but essential capabilities to your AI — accurate time and timezone handling, geocoding and places search, unit conversion, and other tools that make AI more accurate in specific domains.",
    icon: "🔧",
    color: "bg-slate-500/10",
  },
];

export function getMCPCategoryDef(id: MCPCategory): MCPCategoryDef | undefined {
  return mcpCategoryDefs.find((c) => c.id === id);
}
