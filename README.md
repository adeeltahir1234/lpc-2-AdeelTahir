This is a full-stack Next.js application that simulates technical interviews based on your chosen role and topic. It can be extended with AI tools like LangChain and OpenAI for dynamic question generation and smart evaluation.


## Getting Started

### Prerequisites

Make sure the machine has:

- Node.js (v18+ recommended)
- npm or pnpm installed
- Python


## Installation

Clone the repo and install dependencies:

```bash
git clone <repo-url>

# Install dependencies
npm install  # or: pnpm install
```


## Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

You can get your API key from [OpenAI Dashboard](https://platform.openai.com/account/api-keys)


## Running the App Locally

```bash
npm run dev  # or: pnpm dev
```

Then open [http://localhost:3000] in your browser.