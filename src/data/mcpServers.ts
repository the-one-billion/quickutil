// ─── Types ────────────────────────────────────────────────────────────────────

export type MCPClient =
  | "claude-desktop"
  | "cursor"
  | "windsurf"
  | "cline"
  | "continue"
  | "zed";

export type MCPCategory =
  | "databases"
  | "developer-tools"
  | "productivity"
  | "communication"
  | "knowledge"
  | "web"
  | "cloud"
  | "ai-models"
  | "utilities";

export interface MCPTool {
  name: string;
  description: string;
}

export interface MCPEnvVar {
  name: string;
  description: string;
  required: boolean;
  example: string;
}

export interface MCPInstallConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface MCPServer {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: MCPCategory;
  tags: string[];
  githubUrl: string;
  license: string;
  isOfficial: boolean;           // maintained by Anthropic or the service itself
  supportedClients: MCPClient[];
  tools: MCPTool[];
  envVars: MCPEnvVar[];
  installConfig: MCPInstallConfig;
  examplePrompts: string[];
  githubStars: number;
  lastUpdated: string;           // ISO date
  relatedSlugs: string[];
  useCaseSlugs: string[];
  pros: string[];
  cons: string[];
  whoIsItFor: string[];
  whenToUse: string;
  alternatives: string[];
}

// ─── Server data ──────────────────────────────────────────────────────────────

export const mcpServers: MCPServer[] = [

  // ── DATABASES ───────────────────────────────────────────────────────────────

  {
    slug: "postgres",
    name: "PostgreSQL MCP Server",
    tagline: "Query your PostgreSQL database with natural language",
    description:
      "The official PostgreSQL MCP server from Anthropic lets your AI assistant read and query any PostgreSQL database. Ask questions in plain English — the AI translates them into SQL and returns results instantly. The server runs locally, so your data and connection credentials never leave your machine. Supports schema inspection, table listing, and arbitrary read queries. Write queries are not supported by default, keeping your data safe.",
    category: "databases",
    tags: ["postgresql", "sql", "database", "official", "read-only", "local"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline", "continue"],
    tools: [
      { name: "query", description: "Execute a read-only SQL query against the database" },
      { name: "list_tables", description: "List all tables in the connected database" },
      { name: "describe_table", description: "Get the full schema for a specific table" },
    ],
    envVars: [
      { name: "POSTGRES_URL", description: "PostgreSQL connection string", required: true, example: "postgresql://user:password@localhost:5432/mydb" },
    ],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres"],
      env: { POSTGRES_URL: "postgresql://user:password@localhost:5432/mydb" },
    },
    examplePrompts: [
      "What tables are in my database?",
      "Show me the 10 most recent orders",
      "How many users signed up this week?",
      "What is the schema for the products table?",
      "Find all orders over $500 placed in the last 30 days",
    ],
    githubStars: 8200,
    lastUpdated: "2026-03-01",
    relatedSlugs: ["sqlite", "supabase", "mongodb"],
    useCaseSlugs: ["ai-database-queries"],
    pros: [
      "Official Anthropic-maintained server",
      "Read-only by default — safe for production",
      "All data stays on your machine",
      "Works with all major MCP clients",
    ],
    cons: [
      "PostgreSQL only — not MySQL or MongoDB",
      "No write support by default",
      "Requires a running PostgreSQL instance",
    ],
    whoIsItFor: [
      "Developers who want conversational access to their app database",
      "Data analysts wanting AI-assisted SQL generation",
      "Teams demoing data capabilities without writing queries",
    ],
    whenToUse:
      "Use this server when you have a PostgreSQL database and want to explore your data, generate reports, or answer questions without writing SQL yourself.",
    alternatives: ["sqlite", "supabase"],
  },

  {
    slug: "sqlite",
    name: "SQLite MCP Server",
    tagline: "Query and analyze SQLite databases with your AI assistant",
    description:
      "The official SQLite MCP server gives your AI assistant full access to any SQLite database file. Unlike PostgreSQL, SQLite requires no running server — just point the MCP server at a `.db` file and you are ready. Supports both read and write operations, making it ideal for local development, prototyping, and data analysis workflows. The server also exposes business intelligence tools that let the AI generate summary statistics and insights.",
    category: "databases",
    tags: ["sqlite", "sql", "database", "official", "local", "no-server"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline", "continue"],
    tools: [
      { name: "read_query", description: "Execute a SELECT query on the SQLite database" },
      { name: "write_query", description: "Execute INSERT, UPDATE, or DELETE queries" },
      { name: "create_table", description: "Create a new table in the database" },
      { name: "list_tables", description: "List all tables in the database" },
      { name: "describe_table", description: "Get the schema for a specific table" },
      { name: "append_insight", description: "Add a business insight to the memo" },
    ],
    envVars: [],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sqlite", "/path/to/your/database.db"],
    },
    examplePrompts: [
      "What tables are in my database?",
      "Summarize the sales data by month",
      "Create a table for tracking expenses",
      "Insert 3 sample records into the products table",
      "What are the top 5 customers by total spend?",
    ],
    githubStars: 8200,
    lastUpdated: "2026-02-28",
    relatedSlugs: ["postgres", "supabase"],
    useCaseSlugs: ["ai-database-queries"],
    pros: [
      "No database server required — just a .db file",
      "Supports both read and write operations",
      "Great for local development and prototyping",
      "Zero external dependencies",
    ],
    cons: [
      "SQLite only — not suitable for production multi-user databases",
      "Not appropriate for large databases (>1GB)",
    ],
    whoIsItFor: [
      "Developers doing local prototyping",
      "Data analysts working with exported database files",
      "Anyone who wants to query a local SQLite file with AI",
    ],
    whenToUse:
      "Use SQLite MCP when you don't have a running database server or are working with a local `.db` file. It's the easiest database server to get started with.",
    alternatives: ["postgres", "supabase"],
  },

  {
    slug: "supabase",
    name: "Supabase MCP Server",
    tagline: "Full Supabase access — database, auth, storage, and edge functions",
    description:
      "The official Supabase MCP server exposes your entire Supabase project to your AI assistant. Beyond basic database queries, it provides access to Supabase Auth (user management), Storage (file buckets), Edge Functions, and project configuration. It connects through the Supabase Management API using a personal access token, making it safe for use across multiple projects. Ideal for developers building on the Supabase platform who want AI assistance across their full stack.",
    category: "databases",
    tags: ["supabase", "postgresql", "database", "auth", "storage", "official"],
    githubUrl: "https://github.com/supabase-community/supabase-mcp",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline"],
    tools: [
      { name: "execute_sql", description: "Run SQL queries against your Supabase database" },
      { name: "list_tables", description: "List all tables across schemas" },
      { name: "list_projects", description: "List all Supabase projects in your account" },
      { name: "get_project", description: "Get details for a specific project" },
      { name: "list_edge_functions", description: "List all deployed Edge Functions" },
      { name: "get_logs", description: "Retrieve logs from your Supabase project" },
    ],
    envVars: [
      { name: "SUPABASE_ACCESS_TOKEN", description: "Supabase personal access token", required: true, example: "sbp_xxxxxxxxxxxxxxxxxxxx" },
    ],
    installConfig: {
      command: "npx",
      args: ["-y", "@supabase/mcp-server-supabase", "--access-token", "${SUPABASE_ACCESS_TOKEN}"],
      env: { SUPABASE_ACCESS_TOKEN: "sbp_your_token_here" },
    },
    examplePrompts: [
      "List all my Supabase projects",
      "What tables are in my production database?",
      "Show me the recent auth logs",
      "List all Edge Functions in my project",
      "What's the row count for each table?",
    ],
    githubStars: 1400,
    lastUpdated: "2026-03-05",
    relatedSlugs: ["postgres", "sqlite"],
    useCaseSlugs: ["ai-database-queries"],
    pros: [
      "Official Supabase server — full platform access",
      "Access to Auth, Storage, and Edge Functions — not just the database",
      "Works across multiple projects",
    ],
    cons: [
      "Requires a Supabase account and project",
      "More complex setup than a direct database connection",
    ],
    whoIsItFor: [
      "Developers building applications on Supabase",
      "Teams using Supabase as their backend",
    ],
    whenToUse:
      "Use when your project is hosted on Supabase and you want AI access to the full platform — not just the database.",
    alternatives: ["postgres", "sqlite"],
  },

  // ── DEVELOPER TOOLS ─────────────────────────────────────────────────────────

  {
    slug: "filesystem",
    name: "Filesystem MCP Server",
    tagline: "Give your AI read and write access to your local files",
    description:
      "The official Filesystem MCP server from Anthropic provides secure, configurable access to your local file system. You specify which directories the AI is allowed to access — it cannot read anything outside those paths. Supports reading, writing, searching, and moving files. Essential for developers who want AI assistance with local codebases, project files, or documents without copying and pasting content into the chat.",
    category: "developer-tools",
    tags: ["filesystem", "files", "local", "official", "read-write"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline", "continue", "zed"],
    tools: [
      { name: "read_file", description: "Read the contents of a file" },
      { name: "read_multiple_files", description: "Read multiple files at once" },
      { name: "write_file", description: "Write or overwrite a file" },
      { name: "create_directory", description: "Create a new directory" },
      { name: "list_directory", description: "List files and subdirectories" },
      { name: "move_file", description: "Move or rename a file or directory" },
      { name: "search_files", description: "Search for files matching a pattern" },
      { name: "get_file_info", description: "Get metadata for a file or directory" },
    ],
    envVars: [],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/yourname/Documents", "/Users/yourname/Projects"],
    },
    examplePrompts: [
      "List all files in my projects folder",
      "Read the README.md in my current project",
      "Find all .env files in my Documents folder",
      "Create a new file called notes.md with today's meeting agenda",
      "Search for all TypeScript files that import React",
    ],
    githubStars: 8200,
    lastUpdated: "2026-03-01",
    relatedSlugs: ["github", "memory", "git"],
    useCaseSlugs: ["ai-access-local-files"],
    pros: [
      "Official Anthropic-maintained server",
      "Configurable access — specify exactly which directories are accessible",
      "Supports both read and write operations",
      "Works with all major MCP clients",
    ],
    cons: [
      "Write access can be risky — double-check which directories you expose",
      "No search across file contents (only filenames)",
    ],
    whoIsItFor: [
      "Developers who want AI to read and understand their local codebase",
      "Writers and researchers working with local document collections",
      "Anyone who wants to avoid copy-pasting files into chat",
    ],
    whenToUse:
      "Use when you want your AI to directly read files from your machine rather than copy-pasting content into the chat. Specify only the directories you need — not your entire home folder.",
    alternatives: ["github", "memory"],
  },

  {
    slug: "github",
    name: "GitHub MCP Server",
    tagline: "Manage repos, issues, PRs, and code directly from your AI chat",
    description:
      "The official GitHub MCP server gives your AI assistant full access to the GitHub API. Create issues, open pull requests, review code, search repositories, manage branches, and read file contents — all without leaving your AI client. Authenticated via a personal access token with scopes you control. Ideal for automating repetitive GitHub workflows, reviewing codebases, and keeping track of open issues.",
    category: "developer-tools",
    tags: ["github", "git", "code", "issues", "pull-requests", "official"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline", "continue"],
    tools: [
      { name: "create_issue", description: "Open a new GitHub issue" },
      { name: "create_pull_request", description: "Create a pull request" },
      { name: "get_file_contents", description: "Read a file from any repository" },
      { name: "push_files", description: "Push one or more files to a repository" },
      { name: "create_repository", description: "Create a new GitHub repository" },
      { name: "search_repositories", description: "Search for repositories on GitHub" },
      { name: "list_issues", description: "List issues with optional filters" },
      { name: "create_branch", description: "Create a new branch in a repository" },
      { name: "fork_repository", description: "Fork a repository to your account" },
    ],
    envVars: [
      { name: "GITHUB_PERSONAL_ACCESS_TOKEN", description: "GitHub personal access token with repo and issues scopes", required: true, example: "ghp_xxxxxxxxxxxxxxxxxxxx" },
    ],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: "ghp_your_token_here" },
    },
    examplePrompts: [
      "List all open issues in my repository",
      "Create an issue titled 'Fix login bug' in my project",
      "What files are in the src directory of my repo?",
      "Open a pull request from feature/login to main",
      "Search for repositories about MCP servers",
    ],
    githubStars: 8200,
    lastUpdated: "2026-03-01",
    relatedSlugs: ["git", "filesystem", "gitlab"],
    useCaseSlugs: ["automate-github-with-ai"],
    pros: [
      "Official Anthropic server with full GitHub API access",
      "Create, read, and manage issues, PRs, and code",
      "Fine-grained token scopes — give only the permissions you need",
    ],
    cons: [
      "GitHub only — not GitLab or Bitbucket",
      "Requires a personal access token",
    ],
    whoIsItFor: [
      "Developers automating repetitive GitHub tasks",
      "Open source maintainers managing large issue backlogs",
      "Teams who want AI-assisted code review workflows",
    ],
    whenToUse:
      "Use when you spend significant time on GitHub tasks that don't require the full GitHub UI — creating issues, reviewing code, searching repos, or managing branches.",
    alternatives: ["git", "gitlab"],
  },

  {
    slug: "git",
    name: "Git MCP Server",
    tagline: "Run git commands and inspect local repositories from your AI",
    description:
      "The official Git MCP server lets your AI assistant interact with local git repositories directly. Read commit history, check diffs, inspect branches, view file status, and understand code changes over time — all without leaving your AI client. Unlike the GitHub server which works with remote repositories, this server works with git repositories on your local machine. Particularly useful for understanding what changed and why.",
    category: "developer-tools",
    tags: ["git", "version-control", "local", "official", "diff", "commits"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline", "continue"],
    tools: [
      { name: "git_status", description: "Show the working tree status" },
      { name: "git_diff", description: "Show changes between commits or working tree" },
      { name: "git_log", description: "Show the commit history" },
      { name: "git_show", description: "Show details of a specific commit" },
      { name: "git_branch", description: "List, create, or delete branches" },
      { name: "git_add", description: "Stage files for commit" },
      { name: "git_commit", description: "Create a commit with a message" },
      { name: "git_checkout", description: "Switch branches or restore files" },
    ],
    envVars: [],
    installConfig: {
      command: "uvx",
      args: ["mcp-server-git", "--repository", "/path/to/your/repo"],
    },
    examplePrompts: [
      "What files have I changed since the last commit?",
      "Show me the last 10 commits in this repo",
      "What did commit abc123 change?",
      "List all branches in this repository",
      "Show me the diff for the current working tree",
    ],
    githubStars: 8200,
    lastUpdated: "2026-02-20",
    relatedSlugs: ["github", "filesystem"],
    useCaseSlugs: ["automate-github-with-ai", "ai-access-local-files"],
    pros: [
      "Works with any local git repository",
      "No API token required",
      "Great for understanding code history and changes",
    ],
    cons: [
      "Requires git to be installed on your machine",
      "Local only — cannot interact with remote repositories directly",
    ],
    whoIsItFor: [
      "Developers who want AI to understand their code history",
      "Anyone reviewing changes before committing",
    ],
    whenToUse:
      "Use when you want AI to help you understand what changed in your codebase, write commit messages, or review diffs before pushing.",
    alternatives: ["github", "filesystem"],
  },

  {
    slug: "memory",
    name: "Memory MCP Server",
    tagline: "Give your AI persistent memory that survives across conversations",
    description:
      "The official Memory MCP server implements a knowledge graph that your AI assistant can read and write across conversations. By default, Claude's memory resets after every conversation. With the Memory server, you can instruct it to remember facts, preferences, projects, and context that persist indefinitely. The knowledge is stored as a local JSON file on your machine — nothing goes to a cloud service. Essential for developers who want a consistent AI assistant that knows their preferences.",
    category: "developer-tools",
    tags: ["memory", "persistence", "knowledge-graph", "official", "local"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline", "continue"],
    tools: [
      { name: "create_entities", description: "Add new entities (people, projects, concepts) to memory" },
      { name: "create_relations", description: "Create relationships between entities" },
      { name: "add_observations", description: "Add facts or observations about an entity" },
      { name: "delete_entities", description: "Remove entities from the knowledge graph" },
      { name: "delete_observations", description: "Remove specific observations" },
      { name: "delete_relations", description: "Remove relationships between entities" },
      { name: "read_graph", description: "Read the entire knowledge graph" },
      { name: "search_nodes", description: "Search for specific nodes in the graph" },
    ],
    envVars: [],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-memory"],
    },
    examplePrompts: [
      "Remember that I prefer TypeScript over JavaScript",
      "What do you know about my current project?",
      "Remember that I'm working on a Next.js app called QuickUtil",
      "Forget everything you know about my old job",
      "What are my coding preferences you've stored?",
    ],
    githubStars: 8200,
    lastUpdated: "2026-03-01",
    relatedSlugs: ["filesystem", "sequential-thinking"],
    useCaseSlugs: ["ai-memory-persistence"],
    pros: [
      "Persistent memory across all conversations",
      "All data stored locally — never sent to a server",
      "Structured knowledge graph — not just raw text",
    ],
    cons: [
      "Memory must be explicitly instructed — AI won't remember automatically",
      "Knowledge graph can become large and unwieldy over time",
    ],
    whoIsItFor: [
      "Power users who want a consistent AI assistant that knows their preferences",
      "Developers who want AI to remember project context across sessions",
    ],
    whenToUse:
      "Use when you're frustrated by having to re-explain your preferences and context at the start of every conversation. Set it up and instruct the AI to remember important facts about you and your work.",
    alternatives: ["filesystem"],
  },

  {
    slug: "sequential-thinking",
    name: "Sequential Thinking MCP Server",
    tagline: "Enable structured, multi-step reasoning for complex AI problems",
    description:
      "The Sequential Thinking MCP server provides a framework for breaking complex problems into structured, sequential thoughts. Rather than answering complex questions in one shot, the AI can use this server to think step by step, revise its reasoning, and branch into alternative approaches. Particularly useful for planning, debugging, architecture decisions, and any problem where careful deliberation outperforms immediate answers. All thinking happens locally — no data leaves your machine.",
    category: "developer-tools",
    tags: ["reasoning", "planning", "thinking", "official", "local"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline"],
    tools: [
      { name: "sequentialthinking", description: "Think through a problem step by step, with the ability to revise and branch thoughts" },
    ],
    envVars: [],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    },
    examplePrompts: [
      "Think through the architecture for a real-time chat application",
      "Plan how to migrate my database from PostgreSQL to MongoDB",
      "Debug this performance issue step by step",
      "Design a system for handling 1 million concurrent users",
    ],
    githubStars: 8200,
    lastUpdated: "2026-02-15",
    relatedSlugs: ["memory", "filesystem"],
    useCaseSlugs: [],
    pros: [
      "Improves reasoning quality on complex problems",
      "Allows the AI to revise its thinking mid-process",
      "No API or configuration required",
    ],
    cons: [
      "Adds latency to responses — the AI takes more steps",
      "Not necessary for simple questions",
    ],
    whoIsItFor: [
      "Developers tackling complex architecture or design problems",
      "Anyone who wants more deliberate, structured AI reasoning",
    ],
    whenToUse:
      "Use for complex planning, debugging, or design problems where you want the AI to reason carefully rather than give an immediate answer.",
    alternatives: ["memory"],
  },

  // ── WEB ──────────────────────────────────────────────────────────────────────

  {
    slug: "puppeteer",
    name: "Puppeteer MCP Server",
    tagline: "Let your AI control a real browser — screenshot, click, and scrape",
    description:
      "The official Puppeteer MCP server gives your AI assistant full control of a Chrome browser via Puppeteer. Navigate to URLs, take screenshots, click elements, fill forms, and extract structured data from any web page. Runs locally on your machine — no headless browser service required. Ideal for web scraping, UI testing, and automating web-based workflows that would otherwise require manual interaction.",
    category: "web",
    tags: ["puppeteer", "browser", "scraping", "automation", "official", "chrome"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline"],
    tools: [
      { name: "puppeteer_navigate", description: "Navigate to a URL in the browser" },
      { name: "puppeteer_screenshot", description: "Take a screenshot of the current page" },
      { name: "puppeteer_click", description: "Click an element on the page" },
      { name: "puppeteer_fill", description: "Fill a form field with text" },
      { name: "puppeteer_evaluate", description: "Execute JavaScript in the browser" },
      { name: "puppeteer_select", description: "Select an option from a dropdown" },
      { name: "puppeteer_hover", description: "Hover over an element" },
    ],
    envVars: [],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    },
    examplePrompts: [
      "Take a screenshot of example.com",
      "Navigate to my app and click the login button",
      "Scrape the product names and prices from this e-commerce page",
      "Fill in the contact form on my website with test data",
      "Get the text content of all h2 headings on this page",
    ],
    githubStars: 8200,
    lastUpdated: "2026-03-01",
    relatedSlugs: ["fetch", "brave-search"],
    useCaseSlugs: ["web-scraping-with-ai", "ai-browser-control"],
    pros: [
      "Full browser control — not just fetching HTML",
      "Can interact with JavaScript-heavy sites",
      "Takes screenshots for visual verification",
      "Official Anthropic server",
    ],
    cons: [
      "Requires Node.js and Chrome/Chromium installed",
      "Slower than a simple HTTP fetch for static pages",
      "Not suitable for headless server environments",
    ],
    whoIsItFor: [
      "Developers automating browser-based workflows",
      "QA engineers who want AI-assisted UI testing",
      "Data engineers scraping JavaScript-rendered content",
    ],
    whenToUse:
      "Use Puppeteer when you need to scrape or interact with pages that require JavaScript execution, login, or user interaction. For static HTML pages, the Fetch server is faster and simpler.",
    alternatives: ["fetch"],
  },

  {
    slug: "fetch",
    name: "Fetch MCP Server",
    tagline: "Fetch any web page or API endpoint and pass the content to your AI",
    description:
      "The official Fetch MCP server lets your AI assistant retrieve content from any URL. It fetches web pages, converts HTML to clean markdown, and handles JSON APIs — all through a simple interface. Supports custom headers for authenticated requests. Lighter and faster than the Puppeteer server for pages that don't require JavaScript rendering. Perfect for reading documentation, fetching API responses, and giving the AI access to live web content.",
    category: "web",
    tags: ["fetch", "http", "web", "official", "markdown", "api"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline", "continue", "zed"],
    tools: [
      { name: "fetch", description: "Fetch a URL and return the content as text or markdown" },
    ],
    envVars: [],
    installConfig: {
      command: "uvx",
      args: ["mcp-server-fetch"],
    },
    examplePrompts: [
      "Fetch the React documentation for useEffect and summarize it",
      "Get the current weather JSON from this API endpoint",
      "Read the README from this GitHub repository URL",
      "Fetch this product page and extract the price",
      "What does the Hacker News front page say today?",
    ],
    githubStars: 8200,
    lastUpdated: "2026-03-01",
    relatedSlugs: ["puppeteer", "brave-search"],
    useCaseSlugs: ["web-scraping-with-ai"],
    pros: [
      "Simple — one tool, fetch any URL",
      "Converts HTML to clean markdown automatically",
      "No browser required — fast and lightweight",
      "Official Anthropic server",
    ],
    cons: [
      "Cannot execute JavaScript — static HTML only",
      "Cannot interact with pages (click, fill forms)",
      "Blocked by sites that require authentication cookies",
    ],
    whoIsItFor: [
      "Developers who want the AI to read documentation or API responses",
      "Researchers who want to quickly summarize web pages",
    ],
    whenToUse:
      "Use Fetch for any URL that returns readable content — documentation, blog posts, APIs, and static pages. Use Puppeteer instead when the page requires JavaScript to render content.",
    alternatives: ["puppeteer", "brave-search"],
  },

  {
    slug: "brave-search",
    name: "Brave Search MCP Server",
    tagline: "Give your AI real-time web search capabilities via Brave Search",
    description:
      "The official Brave Search MCP server adds real-time web search to your AI assistant using the Brave Search API. Ask your AI to research topics, find recent news, or look up information that postdates its training cutoff. Results include titles, URLs, and summaries. Requires a free Brave Search API key (generous free tier available). Unlike asking the AI to visit URLs directly, this server searches the web and returns multiple relevant results for the AI to synthesize.",
    category: "web",
    tags: ["search", "brave", "web-search", "official", "real-time"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline", "continue"],
    tools: [
      { name: "brave_web_search", description: "Search the web and return ranked results with titles, URLs, and summaries" },
      { name: "brave_local_search", description: "Search for local businesses and places" },
    ],
    envVars: [
      { name: "BRAVE_API_KEY", description: "Brave Search API key (free tier available)", required: true, example: "BSA..." },
    ],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: { BRAVE_API_KEY: "your_brave_api_key_here" },
    },
    examplePrompts: [
      "Search for the latest news about Model Context Protocol",
      "Find recent benchmarks comparing GPT-4 and Claude",
      "What are the best restaurants near downtown San Francisco?",
      "Search for tutorials on building MCP servers in Python",
      "Find the official documentation for Next.js 15",
    ],
    githubStars: 8200,
    lastUpdated: "2026-03-01",
    relatedSlugs: ["fetch", "puppeteer"],
    useCaseSlugs: ["search-internal-docs"],
    pros: [
      "Real-time web search — not limited to training data",
      "Free API tier available",
      "Returns multiple results for AI to synthesize",
      "Official Anthropic server",
    ],
    cons: [
      "Requires a Brave API key",
      "Search results quality depends on Brave's index",
      "Not suitable for searching private or internal content",
    ],
    whoIsItFor: [
      "Anyone who wants their AI to access current information",
      "Developers researching libraries, tools, or recent news",
    ],
    whenToUse:
      "Use when you need current information beyond the AI's training cutoff, or when you want the AI to research multiple sources before answering.",
    alternatives: ["fetch"],
  },

  // ── PRODUCTIVITY ─────────────────────────────────────────────────────────────

  {
    slug: "notion",
    name: "Notion MCP Server",
    tagline: "Read and write your Notion workspace from your AI assistant",
    description:
      "The official Notion MCP server connects your AI assistant to your Notion workspace. Search pages, read content, create new pages, update existing ones, and manage databases — all through natural conversation. Authenticated via a Notion integration token with access only to the pages you choose to share. Ideal for knowledge workers who use Notion as their primary knowledge base and want AI to assist with research, writing, and organization.",
    category: "productivity",
    tags: ["notion", "productivity", "knowledge-base", "official", "notes"],
    githubUrl: "https://github.com/makenotion/notion-mcp-server",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline"],
    tools: [
      { name: "notion_search", description: "Search for pages and databases in Notion" },
      { name: "notion_get_page", description: "Retrieve the full content of a Notion page" },
      { name: "notion_create_page", description: "Create a new page in a database or as a subpage" },
      { name: "notion_update_page", description: "Update properties of an existing page" },
      { name: "notion_append_blocks", description: "Add content blocks to an existing page" },
      { name: "notion_query_database", description: "Query a Notion database with filters and sorts" },
    ],
    envVars: [
      { name: "NOTION_API_TOKEN", description: "Notion internal integration token", required: true, example: "secret_xxxxxxxxxxxxxxxxxxxx" },
    ],
    installConfig: {
      command: "npx",
      args: ["-y", "@notionhq/notion-mcp-server"],
      env: { NOTION_API_TOKEN: "secret_your_token_here" },
    },
    examplePrompts: [
      "Search my Notion for notes about project planning",
      "Create a new page in my Meeting Notes database",
      "What's in my 'Q2 Goals' page?",
      "Add a summary of today's meeting to my notes",
      "List all pages in my Engineering database",
    ],
    githubStars: 2100,
    lastUpdated: "2026-02-25",
    relatedSlugs: ["memory", "filesystem", "google-drive"],
    useCaseSlugs: ["ai-notion-workspace", "search-internal-docs"],
    pros: [
      "Official Notion server — maintained by Notion's team",
      "Full read and write access to your workspace",
      "Granular access control — share only specific pages",
    ],
    cons: [
      "Requires creating a Notion integration and sharing pages manually",
      "Rate-limited by Notion API",
    ],
    whoIsItFor: [
      "Knowledge workers who use Notion as their primary tool",
      "Teams who want AI to help search and update their shared knowledge base",
    ],
    whenToUse:
      "Use when Notion is your knowledge base and you want AI to help you find information, write documents, or update databases without switching context.",
    alternatives: ["memory", "google-drive"],
  },

  {
    slug: "google-drive",
    name: "Google Drive MCP Server",
    tagline: "Search and read files from your Google Drive with AI",
    description:
      "The official Google Drive MCP server allows your AI assistant to search, read, and export files from your Google Drive. Access Google Docs, Sheets, Slides, and uploaded files through natural language. Authenticate once with OAuth2 and the server remembers your credentials. Particularly useful for research workflows where relevant documents are scattered across Drive folders.",
    category: "productivity",
    tags: ["google-drive", "google-docs", "google-sheets", "official", "productivity"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline"],
    tools: [
      { name: "gdrive_search", description: "Search for files across Google Drive" },
      { name: "gdrive_read_file", description: "Read the content of a Google Doc, Sheet, or file" },
    ],
    envVars: [],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-gdrive"],
    },
    examplePrompts: [
      "Search my Drive for the Q4 marketing report",
      "Read the content of my project proposal doc",
      "Find all spreadsheets about budget planning",
      "What's in the meeting notes from last week?",
    ],
    githubStars: 8200,
    lastUpdated: "2026-02-28",
    relatedSlugs: ["notion", "filesystem", "memory"],
    useCaseSlugs: ["search-internal-docs"],
    pros: [
      "Access to all Google Workspace file types",
      "OAuth2 authentication — no long-lived tokens",
      "Official Anthropic server",
    ],
    cons: [
      "Read-only — cannot create or edit files",
      "OAuth2 setup is more involved than a simple API key",
    ],
    whoIsItFor: [
      "Users whose documents live in Google Drive",
      "Researchers and writers who want AI to access their document library",
    ],
    whenToUse:
      "Use when your team's documents are in Google Drive and you want AI to search and synthesize them without downloading and uploading files manually.",
    alternatives: ["notion", "filesystem"],
  },

  // ── COMMUNICATION ─────────────────────────────────────────────────────────────

  {
    slug: "slack",
    name: "Slack MCP Server",
    tagline: "Read Slack channels and send messages from your AI assistant",
    description:
      "The official Slack MCP server connects your AI to your Slack workspace. Read messages from channels, list users, get channel history, and post replies — all from your AI client. Uses a Slack bot token with configurable permissions. Ideal for developers who want to summarize channel discussions, draft replies, or integrate AI into their team communication workflows without leaving their editor.",
    category: "communication",
    tags: ["slack", "communication", "messaging", "official", "team"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline"],
    tools: [
      { name: "slack_list_channels", description: "List all channels in the workspace" },
      { name: "slack_get_channel_history", description: "Get recent messages from a channel" },
      { name: "slack_post_message", description: "Post a message to a channel" },
      { name: "slack_reply_to_thread", description: "Reply to a thread in a channel" },
      { name: "slack_get_thread_replies", description: "Get all replies in a thread" },
      { name: "slack_get_users", description: "List all users in the workspace" },
      { name: "slack_get_user_profile", description: "Get details for a specific user" },
    ],
    envVars: [
      { name: "SLACK_BOT_TOKEN", description: "Slack bot OAuth token (starts with xoxb-)", required: true, example: "xoxb-xxxxxxxxxxxx" },
      { name: "SLACK_TEAM_ID", description: "Your Slack workspace team ID", required: true, example: "T01XXXXXXX" },
    ],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-slack"],
      env: { SLACK_BOT_TOKEN: "xoxb-your-token", SLACK_TEAM_ID: "T01XXXXXXX" },
    },
    examplePrompts: [
      "Summarize the last 20 messages in #engineering",
      "Post a status update to #general",
      "Who has been active in #product this week?",
      "Summarize the discussion thread started by Alice yesterday",
      "List all channels I'm a member of",
    ],
    githubStars: 8200,
    lastUpdated: "2026-03-01",
    relatedSlugs: ["memory", "notion"],
    useCaseSlugs: ["ai-slack-integration"],
    pros: [
      "Official Anthropic server with Slack API access",
      "Read and write — can post messages and replies",
      "Fine-grained bot permissions",
    ],
    cons: [
      "Requires creating a Slack app and bot token",
      "Can only access channels the bot is invited to",
    ],
    whoIsItFor: [
      "Developers who want AI to help manage or summarize Slack conversations",
      "Teams building AI-assisted communication workflows",
    ],
    whenToUse:
      "Use when you want to search, summarize, or respond to Slack messages without switching context from your AI client.",
    alternatives: ["notion", "memory"],
  },

  // ── CLOUD ────────────────────────────────────────────────────────────────────

  {
    slug: "cloudflare",
    name: "Cloudflare MCP Server",
    tagline: "Deploy Workers, manage KV, and configure Cloudflare from your AI",
    description:
      "The official Cloudflare MCP server gives your AI assistant access to your Cloudflare account. Deploy and update Workers, manage KV namespaces and their data, configure DNS records, and interact with R2 storage buckets — all through natural language. Authenticated with a Cloudflare API token scoped to the specific resources you need. Maintained by Cloudflare's engineering team.",
    category: "cloud",
    tags: ["cloudflare", "workers", "cdn", "kv", "r2", "official", "cloud"],
    githubUrl: "https://github.com/cloudflare/mcp-server-cloudflare",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline"],
    tools: [
      { name: "worker_list", description: "List all Cloudflare Workers in the account" },
      { name: "worker_get", description: "Get the code for a specific Worker" },
      { name: "worker_put", description: "Deploy or update a Worker script" },
      { name: "kv_namespaces_list", description: "List KV namespaces" },
      { name: "kv_key_get", description: "Read a value from a KV namespace" },
      { name: "kv_key_put", description: "Write a value to a KV namespace" },
      { name: "r2_buckets_list", description: "List R2 storage buckets" },
    ],
    envVars: [
      { name: "CLOUDFLARE_ACCOUNT_ID", description: "Your Cloudflare account ID", required: true, example: "a1b2c3d4e5f6..." },
      { name: "CLOUDFLARE_API_TOKEN", description: "Cloudflare API token with appropriate permissions", required: true, example: "your_api_token_here" },
    ],
    installConfig: {
      command: "npx",
      args: ["-y", "@cloudflare/mcp-server-cloudflare"],
      env: { CLOUDFLARE_ACCOUNT_ID: "your_account_id", CLOUDFLARE_API_TOKEN: "your_api_token" },
    },
    examplePrompts: [
      "List all my Cloudflare Workers",
      "Deploy this JavaScript code as a new Worker",
      "What's the current value of 'user_count' in my KV store?",
      "List all R2 buckets in my account",
      "Update the KV entry for 'config' with this JSON",
    ],
    githubStars: 1800,
    lastUpdated: "2026-03-03",
    relatedSlugs: ["filesystem", "github"],
    useCaseSlugs: [],
    pros: [
      "Official Cloudflare server — maintained by Cloudflare",
      "Covers Workers, KV, R2, and more",
      "Fine-grained API token scoping",
    ],
    cons: [
      "Cloudflare-specific — not general cloud infrastructure",
      "Some operations are irreversible — be careful with production",
    ],
    whoIsItFor: [
      "Developers building on Cloudflare's edge platform",
      "Teams managing Cloudflare Workers in production",
    ],
    whenToUse:
      "Use when you want AI to help you deploy, debug, and manage Cloudflare resources without using the dashboard.",
    alternatives: ["github", "filesystem"],
  },

  // ── KNOWLEDGE ────────────────────────────────────────────────────────────────

  {
    slug: "google-maps",
    name: "Google Maps MCP Server",
    tagline: "Search places, get directions, and geocode addresses with your AI",
    description:
      "The official Google Maps MCP server adds location intelligence to your AI assistant using the Google Maps Platform APIs. Search for places, get directions between locations, convert addresses to coordinates (geocoding), and find nearby points of interest. Requires a Google Maps API key with the Places API and Directions API enabled. Useful for apps or workflows that involve location data.",
    category: "utilities",
    tags: ["google-maps", "location", "places", "geocoding", "official"],
    githubUrl: "https://github.com/modelcontextprotocol/servers",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline"],
    tools: [
      { name: "maps_geocode", description: "Convert an address to geographic coordinates" },
      { name: "maps_reverse_geocode", description: "Convert coordinates to an address" },
      { name: "maps_search_places", description: "Search for places near a location" },
      { name: "maps_get_directions", description: "Get turn-by-turn directions between two points" },
      { name: "maps_get_distance_matrix", description: "Calculate travel time and distance between multiple origins and destinations" },
    ],
    envVars: [
      { name: "GOOGLE_MAPS_API_KEY", description: "Google Maps Platform API key", required: true, example: "AIzaSy..." },
    ],
    installConfig: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-google-maps"],
      env: { GOOGLE_MAPS_API_KEY: "your_google_maps_api_key" },
    },
    examplePrompts: [
      "What are the best coffee shops near Times Square?",
      "Get directions from San Francisco to Los Angeles",
      "Geocode this address: 1 Infinite Loop, Cupertino, CA",
      "How long does it take to drive from London to Edinburgh?",
    ],
    githubStars: 8200,
    lastUpdated: "2026-02-20",
    relatedSlugs: ["fetch", "brave-search"],
    useCaseSlugs: [],
    pros: [
      "Official Anthropic server with Google Maps Platform",
      "Covers geocoding, places, and directions",
    ],
    cons: [
      "Requires a Google Maps API key (can incur costs beyond free tier)",
      "Not useful for applications without location data",
    ],
    whoIsItFor: [
      "Developers building location-aware applications",
      "Anyone who needs to process address or location data with AI",
    ],
    whenToUse:
      "Use when your workflow involves addresses, locations, or place information that you want the AI to process intelligently.",
    alternatives: ["brave-search"],
  },

  {
    slug: "sentry",
    name: "Sentry MCP Server",
    tagline: "Investigate errors, analyze issues, and debug with AI using Sentry data",
    description:
      "The official Sentry MCP server connects your AI assistant to your Sentry error monitoring account. Retrieve issues, read stack traces, understand error frequency, and get AI-assisted debugging suggestions — all from your AI client. Authenticated via a Sentry auth token. Particularly powerful when combined with your codebase context, letting the AI see both the error and the relevant code at the same time.",
    category: "developer-tools",
    tags: ["sentry", "error-monitoring", "debugging", "official", "errors"],
    githubUrl: "https://github.com/getsentry/sentry-mcp",
    license: "MIT",
    isOfficial: true,
    supportedClients: ["claude-desktop", "cursor", "windsurf", "cline"],
    tools: [
      { name: "get_sentry_issue", description: "Get details for a specific Sentry issue including stack trace" },
      { name: "list_sentry_issues", description: "List recent issues filtered by project, status, or query" },
      { name: "get_sentry_event", description: "Get a specific error event with full context" },
      { name: "list_sentry_projects", description: "List all Sentry projects in your organization" },
    ],
    envVars: [
      { name: "SENTRY_AUTH_TOKEN", description: "Sentry authentication token", required: true, example: "sntrys_eyJia..." },
      { name: "SENTRY_ORG_SLUG", description: "Your Sentry organization slug", required: true, example: "my-org" },
    ],
    installConfig: {
      command: "npx",
      args: ["-y", "@sentry/mcp-server"],
      env: { SENTRY_AUTH_TOKEN: "your_auth_token", SENTRY_ORG_SLUG: "your-org-slug" },
    },
    examplePrompts: [
      "Show me the top 5 unresolved errors in my project",
      "What caused Sentry issue PROJ-1234?",
      "Are there any new errors in production this week?",
      "Get the full stack trace for the most recent error",
      "List all issues tagged as 'performance'",
    ],
    githubStars: 950,
    lastUpdated: "2026-03-02",
    relatedSlugs: ["github", "git", "filesystem"],
    useCaseSlugs: [],
    pros: [
      "Official Sentry server — maintained by Sentry's team",
      "Read full stack traces and error context",
      "Powerful when combined with codebase access",
    ],
    cons: [
      "Requires a Sentry account and project",
      "Read-only — cannot resolve or assign issues",
    ],
    whoIsItFor: [
      "Backend developers who use Sentry for error monitoring",
      "On-call engineers who want AI assistance during incident response",
    ],
    whenToUse:
      "Use when you're debugging production errors and want the AI to understand the full stack trace context alongside your code.",
    alternatives: ["github", "git"],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMCPServerBySlug(slug: string): MCPServer | undefined {
  return mcpServers.find((s) => s.slug === slug);
}

export function getMCPServersByCategory(category: MCPCategory): MCPServer[] {
  return mcpServers.filter((s) => s.category === category);
}

export function getMCPCategories(): MCPCategory[] {
  return [...new Set(mcpServers.map((s) => s.category))];
}

export function getRelatedMCPServers(server: MCPServer, limit = 4): MCPServer[] {
  return server.relatedSlugs
    .map((slug) => getMCPServerBySlug(slug))
    .filter((s): s is MCPServer => s !== undefined)
    .slice(0, limit);
}

export const MCP_CLIENT_META: Record<MCPClient, { label: string; configPath: { mac: string; windows: string; linux: string } }> = {
  "claude-desktop": {
    label: "Claude Desktop",
    configPath: {
      mac:     "~/Library/Application Support/Claude/claude_desktop_config.json",
      windows: "%APPDATA%\\Claude\\claude_desktop_config.json",
      linux:   "~/.config/Claude/claude_desktop_config.json",
    },
  },
  cursor: {
    label: "Cursor",
    configPath: {
      mac:     "~/.cursor/mcp.json",
      windows: "%USERPROFILE%\\.cursor\\mcp.json",
      linux:   "~/.cursor/mcp.json",
    },
  },
  windsurf: {
    label: "Windsurf",
    configPath: {
      mac:     "~/.codeium/windsurf/mcp_config.json",
      windows: "%USERPROFILE%\\.codeium\\windsurf\\mcp_config.json",
      linux:   "~/.codeium/windsurf/mcp_config.json",
    },
  },
  cline: {
    label: "Cline",
    configPath: {
      mac:     "~/.cline/mcp_settings.json",
      windows: "%USERPROFILE%\\.cline\\mcp_settings.json",
      linux:   "~/.cline/mcp_settings.json",
    },
  },
  continue: {
    label: "Continue",
    configPath: {
      mac:     "~/.continue/config.json",
      windows: "%USERPROFILE%\\.continue\\config.json",
      linux:   "~/.continue/config.json",
    },
  },
  zed: {
    label: "Zed",
    configPath: {
      mac:     "~/.config/zed/settings.json",
      windows: "%APPDATA%\\Zed\\settings.json",
      linux:   "~/.config/zed/settings.json",
    },
  },
};
