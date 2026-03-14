export interface MCPLearnTopic {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  sections: {
    heading: string;
    body: string;
  }[];
  faq: { q: string; a: string }[];
  relatedSlugs: string[];
  readingTimeMin: number;
}

export const mcpLearnTopics: MCPLearnTopic[] = [
  {
    slug: "what-is-mcp",
    title: "What is MCP?",
    metaTitle: "What is MCP (Model Context Protocol)? | QuickUtil MCP Hub",
    metaDescription:
      "MCP (Model Context Protocol) is an open standard that lets AI assistants like Claude connect to external tools and data sources. Learn what it is and why it matters.",
    headline: "What is MCP? The Open Standard Connecting AI to the Real World",
    intro:
      "MCP — the Model Context Protocol — is an open standard published by Anthropic in late 2024. It defines a universal way for AI assistants to connect to external tools, databases, APIs, and services. Think of it as a USB standard, but for AI: any MCP-compatible tool works with any MCP-compatible AI client, without custom glue code.",
    sections: [
      {
        heading: "The problem MCP solves",
        body: "Before MCP, connecting an AI assistant to your database meant writing a custom plugin for each AI product. Connect it to GitHub and you'd write another. Each integration was bespoke, fragile, and non-transferable. MCP replaces that chaos with a single protocol — one server speaks to all compatible AI clients.",
      },
      {
        heading: "How it works at a high level",
        body: "An MCP server is a small process that exposes capabilities — called tools — to an AI client. When you ask your AI to query a database, the client calls the database MCP server's tool, gets the result back as structured data, and incorporates that into its response. The server runs locally on your machine by default, so your credentials never leave your environment.",
      },
      {
        heading: "MCP vs. function calling",
        body: "OpenAI popularized 'function calling' — a way to define JSON schemas that an AI can invoke. MCP builds on that idea but adds a discovery layer: servers declare their tools dynamically, support resources (read-only data endpoints), and use a standardized transport (stdio or HTTP SSE). An MCP server is self-describing; a function-calling integration is not.",
      },
      {
        heading: "Who created MCP?",
        body: "Anthropic published the MCP specification and reference SDKs (TypeScript and Python) in November 2024. The specification itself is open — any company can implement a client or server. Within months, GitHub, Cloudflare, Notion, and dozens of open-source authors published their own MCP servers.",
      },
      {
        heading: "Who supports MCP today?",
        body: "As of early 2025, MCP clients include Claude Desktop (macOS/Windows), Cursor, Windsurf, Cline, Continue, and Zed. The ecosystem is growing fast — check the MCP Servers section of this hub for a curated list of available servers.",
      },
    ],
    faq: [
      {
        q: "Is MCP only for Claude?",
        a: "No. MCP is an open standard. While Anthropic created it, any AI client can implement it. Cursor, Windsurf, Cline, and Continue all support MCP alongside (or instead of) Claude.",
      },
      {
        q: "Do I need to code to use MCP?",
        a: "For most popular servers, no. You edit a JSON config file to add a server — no programming required. Building your own custom server does require coding (TypeScript or Python).",
      },
      {
        q: "Is MCP safe?",
        a: "MCP servers run locally by default. Your credentials stay on your machine. You should still review what permissions a server requests, just as you would with any software.",
      },
      {
        q: "Is MCP free?",
        a: "The protocol and most community servers are free and open-source. Some hosted MCP-as-a-service offerings may charge, but self-hosted servers cost nothing beyond any API fees the underlying service charges.",
      },
    ],
    relatedSlugs: ["how-mcp-works", "mcp-clients", "getting-started"],
    readingTimeMin: 5,
  },
  {
    slug: "how-mcp-works",
    title: "How MCP Works",
    metaTitle: "How MCP Works — Architecture, Transport & Tools Explained | QuickUtil",
    metaDescription:
      "A technical but approachable guide to how the Model Context Protocol works: clients, servers, tools, resources, transports, and the request lifecycle.",
    headline: "How MCP Works: Clients, Servers, Tools, and the Request Lifecycle",
    intro:
      "MCP has three moving parts: a client (your AI app), a server (the integration), and the protocol connecting them. Understanding how they interact helps you choose servers wisely and troubleshoot problems when they arise.",
    sections: [
      {
        heading: "Clients and servers",
        body: "An MCP client is an AI application — Claude Desktop, Cursor, Windsurf, etc. A client can connect to multiple MCP servers simultaneously. Each server is a separate process that exposes a set of capabilities. When the client starts, it initializes connections to all configured servers and receives a list of their capabilities.",
      },
      {
        heading: "Tools",
        body: "A tool is a function the AI can call. Each tool has a name, a description (which the AI reads to decide when to use it), and a JSON schema describing its input parameters. When the AI decides a tool is useful, it sends a tool-call request; the server executes it and returns a result. Examples: execute_query, read_file, search_web.",
      },
      {
        heading: "Resources",
        body: "Resources are read-only data endpoints — think of them like files or API responses the AI can read without executing code. A resource has a URI scheme (e.g., file:// or postgres://) and returns structured content. Resources are less commonly used than tools today, but they're part of the spec.",
      },
      {
        heading: "Transports",
        body: "MCP supports two transports: stdio (the server reads/writes JSON-RPC messages on stdin/stdout — common for local servers) and HTTP SSE (server-sent events over HTTP — used for remote/hosted servers). Most servers you'll install locally use stdio.",
      },
      {
        heading: "The request lifecycle",
        body: "1. You ask your AI a question. 2. The AI determines a tool call is needed. 3. The client sends a JSON-RPC request to the server process. 4. The server executes the tool (queries the DB, reads the file, etc.). 5. The server returns the result. 6. The AI reads the result and continues composing its response. This all happens in milliseconds.",
      },
      {
        heading: "Security model",
        body: "By default, MCP servers run as local processes you start. They inherit only the permissions you configure (API keys, DB credentials). The AI client cannot call a server's tool without the server being listed in your config file — so you're always in control of what the AI can access.",
      },
    ],
    faq: [
      {
        q: "Can one AI message trigger multiple tool calls?",
        a: "Yes. An AI can chain tool calls within a single response — for example, querying a database and then fetching a related file. The number of round-trips depends on the client implementation.",
      },
      {
        q: "What language are MCP servers written in?",
        a: "Most servers are written in TypeScript (Node.js) or Python. The MCP SDK exists for both. Community servers also exist in Go, Rust, and other languages.",
      },
      {
        q: "How does the AI know which tool to use?",
        a: "Each tool's description is included in the AI's context. The AI uses those descriptions to decide which tool — if any — is appropriate for a given question. Good tool descriptions lead to better tool selection.",
      },
    ],
    relatedSlugs: ["what-is-mcp", "mcp-server-anatomy", "mcp-tools-resources"],
    readingTimeMin: 6,
  },
  {
    slug: "why-mcp-exists",
    title: "Why MCP Exists",
    metaTitle: "Why MCP Exists — The Problem With AI Integrations Before MCP | QuickUtil",
    metaDescription:
      "Learn why Anthropic created MCP, the M×N integration problem it solves, and why an open standard matters for the long-term AI ecosystem.",
    headline: "Why MCP Exists: Solving the M×N Integration Problem for AI",
    intro:
      "Before MCP, every AI product needed a custom integration for every tool. M AI products × N tools = M×N bespoke connections to build and maintain. MCP collapses that to M + N.",
    sections: [
      {
        heading: "The M×N problem",
        body: "Imagine 10 AI assistants and 50 data sources (databases, APIs, file systems, SaaS tools). Without a standard, each AI vendor writes 50 integrations; each tool vendor writes 10. That's 500 connection points, all custom. When one side changes its API, the other side breaks. MCP changes the math: each AI implements one MCP client; each tool publishes one MCP server. 10 + 50 = 60 connection points total.",
      },
      {
        heading: "Why Anthropic published an open standard",
        body: "Anthropic could have built a proprietary plugin system — like OpenAI did with ChatGPT plugins. Instead, they published an open specification and reference SDKs under a permissive license. The reasoning: a proprietary standard locks users in but produces a smaller ecosystem. An open standard creates a larger ecosystem that benefits everyone, including Anthropic's own products.",
      },
      {
        heading: "Why now?",
        body: "The rise of coding-focused AI clients (Cursor, Windsurf, Cline) created a market for exactly this: developers who want their AI to access real systems, not just generate text about them. MCP arrived at the moment the demand was largest.",
      },
      {
        heading: "What it means for you",
        body: "Any MCP server you set up today works with any MCP-compatible client you use tomorrow. Your investment in configuration is portable. If you switch from Claude Desktop to Cursor, your servers move with you.",
      },
    ],
    faq: [
      {
        q: "Is MCP similar to OpenAI's plugin system?",
        a: "Both allow AI to call external tools, but OpenAI plugins were proprietary, server-side, and required cloud hosting. MCP is open, runs locally by default, and works across multiple AI products.",
      },
      {
        q: "Will other AI companies adopt MCP?",
        a: "Adoption is already broader than Anthropic products. Cursor, Windsurf, and Continue support MCP. Whether major labs like OpenAI and Google adopt MCP is an open question as of 2025.",
      },
    ],
    relatedSlugs: ["what-is-mcp", "how-mcp-works", "mcp-vs-plugins"],
    readingTimeMin: 4,
  },
  {
    slug: "mcp-vs-plugins",
    title: "MCP vs. Plugins & Function Calling",
    metaTitle: "MCP vs. ChatGPT Plugins vs. Function Calling — What's the Difference? | QuickUtil",
    metaDescription:
      "Compare MCP to OpenAI's ChatGPT plugins and function calling. Understand what makes MCP different, and when each approach makes sense.",
    headline: "MCP vs. ChatGPT Plugins vs. Function Calling: A Clear Comparison",
    intro:
      "Three approaches exist for giving AI access to external tools: OpenAI function calling, ChatGPT plugins (now largely deprecated), and MCP. Here's how they differ.",
    sections: [
      {
        heading: "Function calling",
        body: "Function calling (supported by OpenAI, Anthropic, Google, and others) lets you define tool schemas in your API request. The AI returns a structured call when it wants to use a tool; your code executes it and feeds the result back. This is low-level and powerful, but it lives entirely in your application code — not in a reusable server.",
      },
      {
        heading: "ChatGPT plugins",
        body: "OpenAI's plugin system (2023–2024) let third-party developers publish cloud-hosted tools accessible inside ChatGPT. Plugins required an OpenAPI manifest, cloud hosting, and approval by OpenAI. They were shut down in 2024 when OpenAI pivoted to GPT Store and custom GPTs. The key limitation: plugins only worked inside ChatGPT.",
      },
      {
        heading: "MCP servers",
        body: "MCP runs locally on your machine (no cloud hosting needed), works across multiple AI clients, uses a standard discovery mechanism, and supports both tools and resources. The tradeoff: you need to install and configure the server yourself, which requires more setup than a cloud plugin.",
      },
      {
        heading: "When to use each",
        body: "Use function calling when building an API-first AI app where you control the full stack. Use MCP when you want reusable integrations that work across AI clients without re-implementing them per app. ChatGPT plugins are no longer a meaningful option.",
      },
    ],
    faq: [
      {
        q: "Can I use function calling and MCP together?",
        a: "Yes. MCP clients internally use something similar to function calling to invoke server tools. You can also build apps that use the Anthropic API's tool use feature directly, independent of MCP.",
      },
      {
        q: "Is MCP replacing function calling?",
        a: "No. MCP is a higher-level abstraction for composing tools across a session. Function calling is still the primitive inside most AI APIs. They serve different layers of the stack.",
      },
    ],
    relatedSlugs: ["what-is-mcp", "why-mcp-exists", "mcp-server-anatomy"],
    readingTimeMin: 5,
  },
  {
    slug: "mcp-clients",
    title: "MCP Clients Guide",
    metaTitle: "MCP Clients Compared: Claude Desktop, Cursor, Windsurf, Cline & More | QuickUtil",
    metaDescription:
      "Compare the major MCP clients: Claude Desktop, Cursor, Windsurf, Cline, Continue, and Zed. Where to put config files, what's supported, and which to pick.",
    headline: "MCP Clients Compared: Claude Desktop, Cursor, Windsurf, and More",
    intro:
      "An MCP client is the AI application that connects to your MCP servers. Each client has its own config file location and feature set. Here's what you need to know about each.",
    sections: [
      {
        heading: "Claude Desktop",
        body: "The official desktop app from Anthropic (macOS and Windows). Config file: ~/Library/Application Support/Claude/claude_desktop_config.json on macOS. Claude Desktop was the first mainstream MCP client and has the most comprehensive server compatibility. Best for: general-purpose AI assistance with full MCP support.",
      },
      {
        heading: "Cursor",
        body: "An AI-first code editor built on VS Code. Config file: ~/.cursor/mcp.json (global) or .cursor/mcp.json (per-project). Cursor focuses on coding workflows — file operations, GitHub, memory, and database MCP servers are particularly useful here. Best for: developers who want AI integrated into their code editor.",
      },
      {
        heading: "Windsurf",
        body: "Another AI code editor, built by Codeium. Config file: ~/.codeium/windsurf/mcp_config.json. Windsurf has similar capabilities to Cursor and also supports project-scoped MCP config. Best for: developers already using Codeium/Windsurf for AI code completion.",
      },
      {
        heading: "Cline",
        body: "A VS Code extension (formerly Claude Dev) that adds an AI agent directly into VS Code. Config file: VS Code settings.json under the cline.mcpServers key. Cline is highly agentic — it can read files, run commands, and use MCP servers to extend its reach. Best for: developers who want to stay inside VS Code.",
      },
      {
        heading: "Continue",
        body: "An open-source AI coding assistant extension for VS Code and JetBrains. Config file: ~/.continue/config.json. Continue supports MCP via its tool system and is highly configurable. Best for: developers who want an open-source, self-hosted alternative.",
      },
      {
        heading: "Zed",
        body: "A high-performance code editor with built-in AI (Zed AI). MCP support was added in 2025. Config file: ~/.config/zed/settings.json. Best for: developers using Zed who want to extend its AI capabilities.",
      },
    ],
    faq: [
      {
        q: "Can I use the same MCP server in multiple clients?",
        a: "Yes. Add the same server config to each client's config file. The server process will be started independently by each client.",
      },
      {
        q: "Do all MCP clients support all servers?",
        a: "Most stdio-based servers work in all clients. Some clients have partial support for newer MCP features like sampling or resources. Check the server's documentation for any client-specific notes.",
      },
      {
        q: "Which client should I start with?",
        a: "If you use Claude for general tasks, start with Claude Desktop. If you code primarily in VS Code or a similar editor, try Cursor or Cline. If you already use an AI editor, add MCP to what you have.",
      },
    ],
    relatedSlugs: ["getting-started", "what-is-mcp", "how-mcp-works"],
    readingTimeMin: 6,
  },
  {
    slug: "mcp-server-anatomy",
    title: "Anatomy of an MCP Server",
    metaTitle: "Anatomy of an MCP Server — How MCP Servers Are Built | QuickUtil",
    metaDescription:
      "Learn what an MCP server looks like inside: tools, resources, prompts, and the TypeScript/Python SDK patterns used to build them.",
    headline: "Anatomy of an MCP Server: What's Inside and How It's Built",
    intro:
      "You don't need to build an MCP server to use one, but understanding the structure helps you evaluate servers, read their source code, and eventually build your own.",
    sections: [
      {
        heading: "The entry point",
        body: "An MCP server is typically a Node.js script (TypeScript compiled to JavaScript) or a Python script. When your AI client starts it, the server process launches and communicates over stdio. The first thing it does is declare its capabilities in response to the client's initialization request.",
      },
      {
        heading: "Tool definitions",
        body: "Each tool is defined with a name, description, and inputSchema (JSON Schema). The description is what the AI reads to decide when to use the tool — so well-written descriptions lead to better AI behavior. When the AI calls the tool, the server receives the arguments, runs the logic, and returns a result object.",
      },
      {
        heading: "A minimal TypeScript MCP server",
        body: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "1.0.0" });

server.tool("greet", { name: z.string() }, async ({ name }) => ({
  content: [{ type: "text", text: \`Hello, \${name}!\` }],
}));

const transport = new StdioServerTransport();
await server.connect(transport);`,
      },
      {
        heading: "Resources",
        body: "Resources are optional. They're declared with a URI template and a handler that returns content when the AI requests that URI. Resources are read-only — they don't execute actions, they return data.",
      },
      {
        heading: "Error handling",
        body: "If a tool throws, the error is returned as a structured error response. Good servers validate inputs (using Zod in TypeScript or Pydantic in Python) and return clear error messages so the AI can handle failures gracefully.",
      },
      {
        heading: "Packaging and distribution",
        body: "Most servers are published to npm (for Node.js) or PyPI (for Python). Installation is just `npm install -g package-name` or `pip install package-name`. The install config in your AI client's JSON file points to the installed binary.",
      },
    ],
    faq: [
      {
        q: "Do I need to know TypeScript to build an MCP server?",
        a: "TypeScript is the most common language, but the Python SDK is equally capable. Choose whichever language you're more comfortable with.",
      },
      {
        q: "How long does it take to build a simple MCP server?",
        a: "A basic server with one or two tools can be built in under an hour if you know the language. The MCP SDK handles all the protocol boilerplate.",
      },
    ],
    relatedSlugs: ["how-mcp-works", "mcp-tools-resources", "getting-started"],
    readingTimeMin: 7,
  },
  {
    slug: "mcp-tools-resources",
    title: "MCP Tools vs. Resources",
    metaTitle: "MCP Tools vs. Resources — What's the Difference? | QuickUtil",
    metaDescription:
      "Understand the difference between MCP tools (actions the AI can take) and MCP resources (data the AI can read), and when to use each.",
    headline: "MCP Tools vs. Resources: Actions and Data in the MCP Protocol",
    intro:
      "MCP servers can expose two kinds of capabilities: tools and resources. Tools are actions — the AI calls them to do something. Resources are data — the AI reads them to know something. Most servers today focus on tools, but resources are powerful for read-heavy use cases.",
    sections: [
      {
        heading: "Tools: what the AI can do",
        body: "A tool is like a function call. The AI sends arguments; the server executes logic and returns a result. Tools can have side effects — they can write to a database, send a message, or modify a file. Examples: execute_query, create_issue, send_slack_message, navigate_browser.",
      },
      {
        heading: "Resources: what the AI can read",
        body: "A resource is a read-only data endpoint addressed by a URI. The AI requests a resource by URI; the server returns its content (text, JSON, binary). Resources have no side effects. Examples: file://path/to/file, postgres://mydb/public/users (table schema), mem://key (a memory entry).",
      },
      {
        heading: "Prompts",
        body: "MCP also defines a third capability: prompts. A prompt is a pre-defined message template the AI client can offer to the user as a starting point. Prompts are less commonly implemented than tools, but some servers use them to expose common query patterns.",
      },
      {
        heading: "When to use tools vs. resources",
        body: "If you want the AI to take an action (write, execute, send), use tools. If you want the AI to read static or semi-static data to inform its response (configuration, schemas, documentation), resources can work well. Most real-world servers combine both.",
      },
    ],
    faq: [
      {
        q: "Can resources be dynamic?",
        a: "Yes. Resources are fetched on demand, so a resource handler can query a live database or API. The 'read-only' constraint is semantic — resources shouldn't cause side effects, but their data can change.",
      },
      {
        q: "Do all MCP clients support resources?",
        a: "Not all clients fully implement resource discovery and subscription. Tools have broader client support today. Check your client's documentation for resource support status.",
      },
    ],
    relatedSlugs: ["mcp-server-anatomy", "how-mcp-works", "what-is-mcp"],
    readingTimeMin: 4,
  },
  {
    slug: "getting-started",
    title: "Getting Started with MCP",
    metaTitle: "Getting Started with MCP — Install Your First MCP Server | QuickUtil",
    metaDescription:
      "Step-by-step guide to installing your first MCP server in Claude Desktop or Cursor. From zero to working tool calls in under 10 minutes.",
    headline: "Getting Started with MCP: Install Your First Server in 10 Minutes",
    intro:
      "This guide walks you through installing the filesystem MCP server — one of the most useful servers for developers — in Claude Desktop on macOS. The same pattern applies to any server and any client.",
    sections: [
      {
        heading: "Prerequisites",
        body: "You need: (1) Node.js 18+ installed (run `node --version` to check), (2) Claude Desktop installed and signed in, (3) a text editor to modify a JSON config file. That's it.",
      },
      {
        heading: "Step 1: Install the server package",
        body: "Open your terminal and run:\n\n`npm install -g @modelcontextprotocol/server-filesystem`\n\nThis installs the filesystem MCP server globally so Claude Desktop can find it.",
      },
      {
        heading: "Step 2: Find your config file",
        body: "On macOS, Claude Desktop's config file is at:\n\n`~/Library/Application Support/Claude/claude_desktop_config.json`\n\nOpen it in your text editor. If it doesn't exist yet, create it.",
      },
      {
        heading: "Step 3: Add the server config",
        body: `Paste this into your config file (replace /Users/you/projects with the path you want the AI to access):\n\n{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/projects"]\n    }\n  }\n}`,
      },
      {
        heading: "Step 4: Restart Claude Desktop",
        body: "Quit Claude Desktop completely (Cmd+Q) and reopen it. If the server connected successfully, you'll see a tools icon (hammer) in the message input area showing the available tools.",
      },
      {
        heading: "Step 5: Test it",
        body: "Ask Claude: \"What files are in my projects directory?\" Claude will call the filesystem server's list_directory tool and show you the result. From here, you can ask it to read files, search for content, and more.",
      },
      {
        heading: "Adding more servers",
        body: "To add more servers, just add more entries under the \"mcpServers\" key in your config. Each server is independent. Browse the MCP Servers section of this hub to find servers for your workflow.",
      },
    ],
    faq: [
      {
        q: "What if the server doesn't appear after restarting?",
        a: "Check your config file for JSON syntax errors (missing commas, unclosed braces). You can validate JSON at jsonlint.com. Also verify the npm package is installed: run `npx @modelcontextprotocol/server-filesystem --version`.",
      },
      {
        q: "Can I use npx instead of installing globally?",
        a: "Yes. Using `npx -y package-name` in the args means the server is fetched on demand. Global install (`npm install -g`) is slightly faster at startup.",
      },
      {
        q: "Is there a risk of the AI modifying my files?",
        a: "The filesystem server exposes both read and write tools. You can limit it to a specific directory (as shown above) to reduce risk. Always point it at a directory you're comfortable giving the AI access to.",
      },
    ],
    relatedSlugs: ["mcp-clients", "what-is-mcp", "mcp-server-anatomy"],
    readingTimeMin: 8,
  },
];

export function getMCPLearnTopicBySlug(slug: string): MCPLearnTopic | undefined {
  return mcpLearnTopics.find((t) => t.slug === slug);
}
