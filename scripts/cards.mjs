// Project cards. Descriptions must fit in three lines; the build fails if one doesn't.
// icon: a key from `icons` in lib.mjs. tag: LIVE and NOW get a pulsing dot.
export const cards = [
  // open source
  {
    slug: "nexalm", name: "NexaLM", icon: "chip", sub: "nexalm.vercel.app", tag: "LIVE DEMO",
    desc: "Self-hosted multi-model LLM and image platform that runs on free Kaggle and Colab GPUs, with streaming chat and live metrics.",
    chips: ["React", "TypeScript", "Fastify", "PostgreSQL", "Python"],
  },
  {
    slug: "tryon", name: "Try-On", icon: "hanger", sub: "tryonlab.vercel.app", tag: "LIVE DEMO",
    desc: "AI virtual try-on. A Chrome extension side panel talks to a Cloudflare Worker API where the try-on model provider can be swapped.",
    chips: ["TypeScript", "Chrome MV3", "Cloudflare Workers", "D1"],
  },
  {
    slug: "linkedin-job-agent", name: "LinkedIn Job Agent", icon: "briefcase", sub: "MIT license", tag: "OPEN SOURCE",
    desc: "Scores job posts against your CV, drafts cover letters, then fact-checks every claim against the CV with plain code. You do the applying.",
    chips: ["Python", "FastAPI", "PostgreSQL", "Docker"],
  },
  {
    slug: "n8n-client-hunt", name: "n8n Client Hunt", icon: "nodes", sub: "MIT license", tag: "OPEN SOURCE",
    desc: "Finds small businesses that trade but have no website, proves the gap with open map data, scores them and drafts a careful first message.",
    chips: ["n8n", "PostgreSQL", "Python", "Docker"],
  },
  {
    slug: "face-liveness-detection", name: "Face Liveness", icon: "facescan", sub: "MIT license", tag: "OPEN SOURCE",
    desc: "Checks that the face on camera is a live person. It asks for random blinks, turns and nods and verifies each one from face landmarks.",
    chips: ["Python", "MediaPipe", "OpenCV", "scikit-learn"],
  },
  {
    slug: "ferry", name: "Ferry", icon: "ferry", sub: "ahkamboh/ferry", tag: "CONTRIBUTOR",
    desc: "Copy or move a chat between Claude Code accounts with its context intact, all on your own machine. I built the Windows port.",
    chips: ["Rust", "Windows", "Claude Code"],
  },
  // work
  {
    slug: "xaibridge", name: "Xaibridge", icon: "server", sub: "Full-Stack & Cloud Engineer", tag: "NOW",
    desc: "Cut database reads 98%, moved ~450k emails a month to Amazon SES (projected 80%+ cheaper) and took the tests from zero to ~3,000.",
    chips: ["Next.js", "TypeScript", "MySQL", "Redis", "AWS SES"],
  },
  {
    slug: "sandstorms", name: "Sandstorms AI", icon: "wave", sub: "sandstorms.ai", tag: "LIVE",
    desc: "Voice agents that answer and place real phone calls. Streaming speech-to-text, LLM and text-to-speech with barge-in and sub-second first audio.",
    chips: ["Deepgram", "Llama on Groq", "Twilio", "Asterisk"],
  },
  {
    slug: "govava", name: "Govava", icon: "search", sub: "govava.com", tag: "LIVE",
    desc: "RAG product search on AWS Bedrock over tens of millions of scraped product records. I owned the scraping, the cleaning and the AWS stack.",
    chips: ["AWS Bedrock", "Lambda", "Elasticsearch", "DynamoDB"],
  },
  {
    slug: "invento", name: "Invento", icon: "boxes", sub: "inventobase.com", tag: "LIVE",
    desc: "Multi-tenant inventory SaaS that replaces spreadsheet stock tracking, with isolated tenant data, six roles and self-service onboarding.",
    chips: ["Django", "PostgreSQL", "Supabase", "Vercel"],
  },
];
