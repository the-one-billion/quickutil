export interface MCPUseCase {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  timeToSetup: string;
  serversNeeded: string[]; // server slugs
  steps: {
    heading: string;
    body: string;
  }[];
  examplePrompts: string[];
  tips: string[];
  faq: { q: string; a: string }[];
  relatedSlugs: string[];
}

export const mcpUseCases: MCPUseCase[] = [
  {
    slug: "ai-database-queries",
    title: "Query Your Database with AI",
    metaTitle: "Query Your Database with AI Using MCP — No SQL Required | QuickUtil",
    metaDescription:
      "Use Claude or Cursor to query your PostgreSQL or SQLite database in plain English. Set up the MCP database server and ask questions directly about your data.",
    headline: "Ask Your Database Questions in Plain English with MCP",
    intro:
      "With a database MCP server, your AI assistant becomes a SQL expert that already knows your schema. Ask questions in plain English and get instant, accurate answers — without writing a single query.",
    difficulty: "beginner",
    timeToSetup: "10 minutes",
    serversNeeded: ["postgres", "sqlite"],
    steps: [
      {
        heading: "Install the database server",
        body: "For PostgreSQL: `npm install -g @modelcontextprotocol/server-postgres`. For SQLite: `npm install -g @modelcontextprotocol/server-sqlite`. You only need the one matching your database.",
      },
      {
        heading: "Add it to your AI client config",
        body: "Open your Claude Desktop (or Cursor) config file and add the server. For Postgres, you'll provide a connection string in the environment. For SQLite, provide the file path as an argument.",
      },
      {
        heading: "Restart your AI client",
        body: "Quit and reopen Claude Desktop (or restart Cursor). The server should connect automatically. You'll see database tools listed if you click the tools icon.",
      },
      {
        heading: "Start asking questions",
        body: "Ask the AI to describe your schema, find rows, aggregate data, or explain query results. The AI generates and executes the SQL, then explains the result to you.",
      },
    ],
    examplePrompts: [
      "What tables are in my database and what do they contain?",
      "How many users signed up last week?",
      "Which products have the highest return rate?",
      "Show me all orders over $500 from the past month",
      "Is there any data quality issue I should know about in the users table?",
    ],
    tips: [
      "Grant read-only database credentials for safety — the AI can still answer questions without write access.",
      "Ask the AI to explain the SQL it ran. It's a great way to learn.",
      "For complex analytics, tell the AI the business question first, then let it figure out the query.",
    ],
    faq: [
      {
        q: "Can the AI modify my database?",
        a: "By default, most database MCP servers expose both read and write operations. For safety, create a read-only database user and use those credentials in your MCP config.",
      },
      {
        q: "Does my database data get sent to Anthropic?",
        a: "Query results are included in the conversation context sent to the AI API. Treat this the same as any other data you include in a chat with Claude. Don't use it with sensitive PII unless your data agreements allow it.",
      },
    ],
    relatedSlugs: ["search-internal-docs", "ai-access-local-files"],
  },
  {
    slug: "ai-access-local-files",
    title: "Give AI Access to Your Local Files",
    metaTitle: "Give Claude or Cursor Access to Your Local Files with MCP | QuickUtil",
    metaDescription:
      "Use the filesystem MCP server to let your AI assistant read, search, and summarize files from a directory on your computer.",
    headline: "Let Your AI Read and Search Your Local Files with MCP",
    intro:
      "The filesystem MCP server is the most popular starting point for most developers. It gives your AI the ability to list, read, write, and search files in a directory you specify — no more copy-pasting file contents into chat.",
    difficulty: "beginner",
    timeToSetup: "5 minutes",
    serversNeeded: ["filesystem"],
    steps: [
      {
        heading: "Install the server",
        body: "`npm install -g @modelcontextprotocol/server-filesystem`",
      },
      {
        heading: "Configure it with a directory",
        body: "Add the server to your config, passing the directory path you want the AI to access as an argument. Example: `/Users/you/projects`. You can pass multiple directories.",
      },
      {
        heading: "Restart and test",
        body: "After restarting your client, ask the AI to list files, read a specific file, or search for a string across files.",
      },
    ],
    examplePrompts: [
      "What files are in my projects directory?",
      "Read my notes.md file and summarize it",
      "Find all TODO comments in my src directory",
      "What does the config.json in my project root contain?",
      "Search for any references to 'deprecated' across my project files",
    ],
    tips: [
      "Point the server at a specific project directory rather than your entire home folder for better focus and safety.",
      "Combine with the GitHub MCP server for a full git + file workflow.",
      "The AI can write files too — useful for generating boilerplate or config files.",
    ],
    faq: [
      {
        q: "Can I give it access to multiple directories?",
        a: "Yes. Pass multiple paths as separate arguments in the args array.",
      },
      {
        q: "Can the AI create or delete files?",
        a: "The filesystem server exposes write and delete tools. If you want read-only access, use a read-only filesystem mount or check if the server offers a read-only mode.",
      },
    ],
    relatedSlugs: ["automate-github-with-ai", "ai-database-queries"],
  },
  {
    slug: "automate-github-with-ai",
    title: "Automate GitHub Tasks with AI",
    metaTitle: "Automate GitHub with AI and MCP — Issues, PRs, and Code Review | QuickUtil",
    metaDescription:
      "Use the GitHub MCP server to let Claude or Cursor create issues, review PRs, search repos, and manage your GitHub workflow in plain English.",
    headline: "Automate Your GitHub Workflow with AI and MCP",
    intro:
      "The GitHub MCP server connects your AI directly to the GitHub API. Create issues, review pull requests, search code, and manage your repos — all through conversation, without switching to the browser.",
    difficulty: "beginner",
    timeToSetup: "10 minutes",
    serversNeeded: ["github"],
    steps: [
      {
        heading: "Create a GitHub Personal Access Token",
        body: "Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic). Create a token with repo scope (and optionally read:org if you want org access).",
      },
      {
        heading: "Install the server",
        body: "`npm install -g @modelcontextprotocol/server-github`",
      },
      {
        heading: "Add the config with your token",
        body: "Add the server to your AI client config. Set the GITHUB_PERSONAL_ACCESS_TOKEN environment variable to your token.",
      },
      {
        heading: "Start automating",
        body: "Ask the AI to create issues, review open PRs, or search your codebase. The AI uses the GitHub API directly.",
      },
    ],
    examplePrompts: [
      "List the open issues in my-username/my-repo",
      "Create a bug report issue: the login page crashes on mobile Safari",
      "Summarize the changes in PR #42",
      "Search for all uses of deprecated_function across the repo",
      "What are the most recent commits to the main branch?",
    ],
    tips: [
      "Use a token with minimal required scopes to reduce risk.",
      "Combine with the filesystem server to let the AI read local code and create GitHub issues about what it finds.",
      "The AI can draft PR descriptions from your local git diff if you combine git + GitHub servers.",
    ],
    faq: [
      {
        q: "Can the AI push code to GitHub?",
        a: "The GitHub MCP server uses the GitHub API, which doesn't support raw git pushes. It can create files and commits via the API, but for full git workflows you'd also need the git server.",
      },
      {
        q: "Does this work with GitHub Enterprise?",
        a: "The server supports a GITHUB_API_URL environment variable for Enterprise deployments.",
      },
    ],
    relatedSlugs: ["ai-access-local-files", "ai-code-execution"],
  },
  {
    slug: "web-scraping-with-ai",
    title: "Web Scraping and Browser Control with AI",
    metaTitle: "Web Scraping with AI and MCP — Puppeteer + Fetch Servers | QuickUtil",
    metaDescription:
      "Use MCP's Puppeteer and Fetch servers to give Claude or Cursor the ability to browse websites, scrape content, and automate browser tasks.",
    headline: "Let Your AI Browse the Web and Scrape Pages with MCP",
    intro:
      "Two MCP servers cover web access: Fetch (for simple URL fetching and content extraction) and Puppeteer (for full browser control, including JavaScript-heavy pages, screenshots, and form interaction). Together they make your AI a capable web agent.",
    difficulty: "intermediate",
    timeToSetup: "15 minutes",
    serversNeeded: ["fetch", "puppeteer"],
    steps: [
      {
        heading: "Choose your server based on need",
        body: "Use Fetch for simple pages and documentation. Use Puppeteer when the page requires JavaScript to render, needs a login, or you want screenshots.",
      },
      {
        heading: "Install Fetch",
        body: "`npm install -g @modelcontextprotocol/server-fetch`",
      },
      {
        heading: "Install Puppeteer server",
        body: "`npm install -g @modelcontextprotocol/server-puppeteer`. Puppeteer downloads Chromium automatically on first run.",
      },
      {
        heading: "Add both to your config",
        body: "Add both servers to your AI client config. They work independently — use whichever is more appropriate for a given task.",
      },
    ],
    examplePrompts: [
      "Fetch the content of this documentation page and summarize the API",
      "Take a screenshot of example.com and describe what you see",
      "Scrape the pricing table from this competitor's website",
      "Check if this URL returns a 200 status code",
      "Fill in and submit this form on the test site",
    ],
    tips: [
      "Fetch is faster and lighter — prefer it for static content.",
      "For Puppeteer tasks, be specific about what you want captured (text, screenshot, specific element).",
      "Web scraping may violate a site's terms of service — check before automating.",
    ],
    faq: [
      {
        q: "Can the AI log into a site using Puppeteer?",
        a: "Yes, Puppeteer can fill forms and click buttons. You'd tell the AI the credentials (or have them in a config). Be careful with this — only use it on sites you own or have permission to automate.",
      },
      {
        q: "Does Fetch work with paywalled content?",
        a: "No. Fetch makes an unauthenticated HTTP request. You'd need Puppeteer with a logged-in session for paywalled content.",
      },
    ],
    relatedSlugs: ["ai-database-queries", "automate-github-with-ai"],
  },
  {
    slug: "search-internal-docs",
    title: "Search Internal Documentation with AI",
    metaTitle: "Search Internal Docs and Knowledge Bases with AI and MCP | QuickUtil",
    metaDescription:
      "Connect your AI to Notion, Google Drive, or a local knowledge base using MCP. Search, summarize, and answer questions from your team's internal documentation.",
    headline: "Make Your AI a Search Engine for Your Team's Internal Docs",
    intro:
      "Stop switching tabs to find information. With MCP servers for Notion, Google Drive, or local files, your AI can search your team's knowledge base and answer questions directly from your documentation.",
    difficulty: "intermediate",
    timeToSetup: "20 minutes",
    serversNeeded: ["notion", "google-drive", "filesystem"],
    steps: [
      {
        heading: "Choose your knowledge source",
        body: "If your docs live in Notion, use the Notion MCP server. Google Drive → Google Drive server. Local Markdown files → filesystem server. You can use multiple sources simultaneously.",
      },
      {
        heading: "Set up API credentials",
        body: "For Notion: create an integration at notion.so/my-integrations and connect it to the pages you want searchable. For Google Drive: create OAuth2 credentials in Google Cloud Console.",
      },
      {
        heading: "Install and configure the server",
        body: "Install the relevant package and add it to your config with the appropriate API keys or OAuth tokens.",
      },
      {
        heading: "Test with real questions",
        body: "Ask your AI questions you'd normally look up in your docs. It will search the connected source and return answers with source references.",
      },
    ],
    examplePrompts: [
      "How do we handle customer refunds according to our policy docs?",
      "Find all onboarding documents in our Notion workspace",
      "What's the deployment process for the frontend? Search our runbooks",
      "Summarize our Q4 roadmap document",
      "What did we decide about the auth redesign in last week's meeting notes?",
    ],
    tips: [
      "For Notion, only share the specific pages your AI needs — don't grant access to your entire workspace.",
      "Use the Memory MCP server alongside these to let the AI remember key facts across sessions.",
      "Tag or label important docs in Notion/Drive to make them easier for the AI to find.",
    ],
    faq: [
      {
        q: "Can the AI update my Notion pages?",
        a: "Yes — the Notion MCP server has write capabilities. Limit the integration's access scope if you want read-only.",
      },
      {
        q: "How does the AI know which documents are relevant?",
        a: "It uses search tools exposed by the server (Notion search API, Drive search API) plus your prompt context. Being specific in your questions helps.",
      },
    ],
    relatedSlugs: ["ai-database-queries", "ai-memory-persistence"],
  },
  {
    slug: "ai-notion-workspace",
    title: "AI-Powered Notion Workspace",
    metaTitle: "Manage Your Notion Workspace with AI and MCP | QuickUtil",
    metaDescription:
      "Use the Notion MCP server to let Claude create, update, and search your Notion pages and databases — all from your AI client.",
    headline: "Turn Claude into a Notion Power User with MCP",
    intro:
      "The Notion MCP server gives your AI direct access to your Notion workspace. Create pages, update databases, search across your workspace, and let the AI handle the organizational overhead while you focus on the work.",
    difficulty: "beginner",
    timeToSetup: "15 minutes",
    serversNeeded: ["notion"],
    steps: [
      {
        heading: "Create a Notion integration",
        body: "Go to notion.so/my-integrations → New integration. Give it a name, select your workspace, and choose the capabilities you need (read content, update content, insert content).",
      },
      {
        heading: "Connect the integration to your pages",
        body: "Open each Notion page or database you want the AI to access, click ••• → Add connections, and select your integration. This is how Notion controls access.",
      },
      {
        heading: "Install and configure the server",
        body: "`npm install -g @modelcontextprotocol/server-notion`. Add it to your config with NOTION_API_KEY set to your integration token.",
      },
      {
        heading: "Start using your Notion workspace through AI",
        body: "Ask the AI to search pages, create entries, update properties, or summarize content. It works directly through the Notion API.",
      },
    ],
    examplePrompts: [
      "Create a new page in my Projects database for the Q2 marketing campaign",
      "Search my Notion workspace for anything about the API redesign",
      "Update the status of the 'Launch website' task to Done",
      "List all tasks assigned to me that are still in progress",
      "Summarize the meeting notes from our last product sync",
    ],
    tips: [
      "Only connect the integration to pages it needs — don't share your entire workspace unless necessary.",
      "Use Notion databases for structured data; the AI can filter, sort, and query them.",
      "Combine with the Memory server so the AI remembers preferences across sessions.",
    ],
    faq: [
      {
        q: "Can the AI create Notion pages from scratch?",
        a: "Yes. You can ask it to create a page with specific properties, blocks, and content. The quality depends on how specific your prompt is.",
      },
      {
        q: "What if I have many workspaces?",
        a: "One Notion integration is scoped to one workspace. For multiple workspaces, you'd need separate integrations and potentially separate MCP server instances.",
      },
    ],
    relatedSlugs: ["search-internal-docs", "ai-memory-persistence"],
  },
  {
    slug: "ai-memory-persistence",
    title: "Persistent AI Memory Across Sessions",
    metaTitle: "Give Your AI Persistent Memory Across Sessions with MCP | QuickUtil",
    metaDescription:
      "Use the Memory MCP server to give Claude or Cursor persistent memory. Store preferences, project context, and knowledge that persists between chat sessions.",
    headline: "Give Your AI a Memory That Survives Between Sessions",
    intro:
      "By default, AI conversations start fresh each time. The Memory MCP server changes that — it stores a knowledge graph of entities and relationships on your machine, and the AI can read and write to it across sessions. Tell it once; it remembers.",
    difficulty: "beginner",
    timeToSetup: "5 minutes",
    serversNeeded: ["memory"],
    steps: [
      {
        heading: "Install the memory server",
        body: "`npm install -g @modelcontextprotocol/server-memory`. This server stores a JSON knowledge graph in your home directory.",
      },
      {
        heading: "Add to your config",
        body: "Add it to your AI client config. No API keys required — it's entirely local.",
      },
      {
        heading: "Tell the AI what to remember",
        body: "In a new conversation, explicitly ask the AI to remember things: \"Remember that my main project is called Atlas and uses a PostgreSQL database at localhost:5432.\" It will store this as entities and relations.",
      },
      {
        heading: "Watch it recall in future sessions",
        body: "In your next session, the AI will read from the memory graph before answering. You can also ask it to recall what it knows about a topic.",
      },
    ],
    examplePrompts: [
      "Remember that my preferred coding style uses 2-space indentation and TypeScript strict mode",
      "What do you know about my project setup?",
      "Remember that the database password is stored in .env.local, never in code",
      "Forget what you know about the old API endpoint",
      "What have I told you about my team's preferences?",
    ],
    tips: [
      "Seed the memory at the start of a project with key context: tech stack, team conventions, project goals.",
      "The memory graph is stored locally — back it up if you rely on it heavily.",
      "Be explicit when you want something remembered vs. just mentioned in conversation.",
    ],
    faq: [
      {
        q: "Is the memory stored in the cloud?",
        a: "No. The Memory MCP server stores everything in a local JSON file on your machine. It never leaves your computer.",
      },
      {
        q: "How much can it store?",
        a: "The knowledge graph is a JSON file with no hard limit. Practically, very large graphs may slow the AI's context processing since the full graph is loaded each session.",
      },
    ],
    relatedSlugs: ["search-internal-docs", "ai-notion-workspace"],
  },
  {
    slug: "ai-code-execution",
    title: "AI Code Execution and Terminal Access",
    metaTitle: "Give AI Terminal and Code Execution Access with MCP | QuickUtil",
    metaDescription:
      "Use MCP servers to give Claude or Cursor access to run terminal commands, execute code, and inspect your development environment.",
    headline: "Let Your AI Run Commands and Execute Code with MCP",
    intro:
      "With the right MCP servers, your AI can go beyond reading code to running it. The Sequential Thinking and filesystem servers, combined with shell access in Cline or Cursor's Agent mode, enable an AI that can build, test, and debug autonomously.",
    difficulty: "advanced",
    timeToSetup: "20 minutes",
    serversNeeded: ["sequential-thinking", "filesystem", "github"],
    steps: [
      {
        heading: "Choose your execution environment",
        body: "Cline (VS Code extension) and Cursor in Agent mode can run terminal commands directly without an MCP server. For more controlled execution, use a dedicated code execution MCP server.",
      },
      {
        heading: "Install Sequential Thinking for complex tasks",
        body: "`npm install -g @modelcontextprotocol/server-sequential-thinking`. This server helps the AI break complex problems into steps and reason through them methodically.",
      },
      {
        heading: "Combine with filesystem access",
        body: "The filesystem server lets the AI read test output files, config files, and logs. Together with execution, the AI has a full read-write-run loop.",
      },
      {
        heading: "Define clear boundaries",
        body: "Tell the AI which directories it can modify and which commands it can run. Being explicit prevents unwanted side effects.",
      },
    ],
    examplePrompts: [
      "Run the test suite and tell me which tests are failing",
      "Fix the TypeScript error in src/api.ts and verify it compiles",
      "Set up a new Next.js project in my projects directory",
      "Run the database migrations and tell me if they succeed",
      "Debug why npm install is failing in this project",
    ],
    tips: [
      "Use Cline or Cursor's built-in terminal access for the most seamless execution experience.",
      "Always review commands before execution when working with production systems.",
      "The Sequential Thinking server significantly improves multi-step task performance.",
    ],
    faq: [
      {
        q: "Is it safe to give the AI terminal access?",
        a: "In controlled environments (dev machine, specific project directory), it's generally safe. Avoid giving terminal access to servers with production data or systems. Always review what the AI is doing.",
      },
      {
        q: "Can the AI run sudo commands?",
        a: "That depends on your system permissions and the client implementation. Most clients will surface the command for your approval before running it.",
      },
    ],
    relatedSlugs: ["automate-github-with-ai", "ai-access-local-files"],
  },
];

export function getMCPUseCaseBySlug(slug: string): MCPUseCase | undefined {
  return mcpUseCases.find((u) => u.slug === slug);
}
