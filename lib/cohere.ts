export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export interface Workspace {
  id: string
  name: string
  createdAt: Date
  messages: Message[]
}

// Set your Cohere API key here
const COHERE_API_KEY = 'your_cohere_api_key_here'

const SYSTEM_PROMPT = `You are MediCare AI, a compassionate and knowledgeable medical assistant. Your role is to:

1. Provide accurate, evidence-based health information
2. Help users understand their symptoms, medications, and health conditions
3. Check for drug interactions and allergies
4. Offer dietary and lifestyle guidance
5. Always remind users that you're an AI assistant and not a replacement for professional medical advice

Guidelines:
- Be empathetic and supportive
- Use clear, simple language
- Ask clarifying questions when needed
- Always recommend consulting healthcare professionals for serious concerns
- Respect patient privacy and confidentiality
- Provide sources when possible

Remember: You are HIPAA-compliant and prioritize user safety above all else.`

export async function sendMessageToCohere(
  messages: Message[]
): Promise<string> {
  try {
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messages[messages.length - 1].content,
        chat_history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
          message: msg.content
        })),
        preamble: SYSTEM_PROMPT,
        model: 'command-r-plus',
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error('Error calling Cohere API:', error)
    throw error
  }
}

// Local storage helpers
export const workspaceStorage = {
  getAll: (): Workspace[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('medicare_workspaces')
    return stored ? JSON.parse(stored) : []
  },

  save: (workspaces: Workspace[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('medicare_workspaces', JSON.stringify(workspaces))
  },

  create: (name: string): Workspace => {
    const workspace: Workspace = {
      id: Date.now().toString(),
      name,
      createdAt: new Date(),
      messages: []
    }
    const workspaces = workspaceStorage.getAll()
    workspaces.unshift(workspace)
    workspaceStorage.save(workspaces)
    return workspace
  },

  update: (id: string, updates: Partial<Workspace>) => {
    const workspaces = workspaceStorage.getAll()
    const index = workspaces.findIndex(w => w.id === id)
    if (index !== -1) {
      workspaces[index] = { ...workspaces[index], ...updates }
      workspaceStorage.save(workspaces)
    }
  },

  delete: (id: string) => {
    const workspaces = workspaceStorage.getAll().filter(w => w.id !== id)
    workspaceStorage.save(workspaces)
  },

  addMessage: (workspaceId: string, message: Message) => {
    const workspaces = workspaceStorage.getAll()
    const workspace = workspaces.find(w => w.id === workspaceId)
    if (workspace) {
      workspace.messages.push(message)
      workspaceStorage.save(workspaces)
    }
  }
}
