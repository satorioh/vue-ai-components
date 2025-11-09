<template>
  <div class="h-[498px] rounded-xl border">
    <Conversation class="relative h-full">
      <ConversationContent class="space-y-2">
        <Message
          v-for="(m, idx) in visibleMessages"
          :key="m.key"
          :from="idx % 2 === 0 ? 'user' : 'assistant'"
        >
          <MessageContent>{{ m.value }}</MessageContent>
          <MessageAvatar :src="m.avatar" :name="m.name" />
        </Message>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>

    <PromptInput @submit="onSubmit">
      <PromptInputTextarea v-model="text" />

      <PromptInputToolbar>
        <PromptInputTools>
          <PromptInputButton>
            <Plus class="size-4" />
          </PromptInputButton>
          <PromptInputButton>
            <Mic class="size-4" />
          </PromptInputButton>
          <PromptInputButton>
            <Globe class="size-4" />
            <span>Search</span>
          </PromptInputButton>

          <PromptInputModelSelect v-model="model">
            <PromptInputModelSelectTrigger>
              <PromptInputModelSelectValue />
            </PromptInputModelSelectTrigger>
            <PromptInputModelSelectContent>
              <PromptInputModelSelectItem v-for="m in models" :key="m.id" :value="m.id">
                {{ m.name }}
              </PromptInputModelSelectItem>
            </PromptInputModelSelectContent>
          </PromptInputModelSelect>
        </PromptInputTools>

        <PromptInputSubmit :disabled="!text" :status="status" />
      </PromptInputToolbar>
    </PromptInput>
  </div>
</template>

<script setup lang="ts">
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message, MessageAvatar, MessageContent } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { Globe, Mic, Plus } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { nanoid } from 'nanoid'

defineOptions({
  name: 'TranslatorDemo',
})

interface MessageItem {
  key: string
  value: string
  name: string
  avatar: string
}

const messages: MessageItem[] = [
  {
    key: nanoid(),
    value: 'Hello, how are you?',
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: "I'm good, thank you! How can I assist you today?",
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
  {
    key: nanoid(),
    value: "I'm looking for information about your services.",
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: 'Sure! We offer a variety of AI solutions. What are you interested in?',
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
  {
    key: nanoid(),
    value: "I'm interested in natural language processing tools.",
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: 'Great choice! We have several NLP APIs. Would you like a demo?',
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
  {
    key: nanoid(),
    value: 'Yes, a demo would be helpful.',
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: 'Alright, I can show you a sentiment analysis example. Ready?',
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
  {
    key: nanoid(),
    value: 'Yes, please proceed.',
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: "Here is a sample: 'I love this product!' → Positive sentiment.",
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
  {
    key: nanoid(),
    value: 'Impressive! Can it handle multiple languages?',
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: 'Absolutely, our models support over 20 languages.',
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
  {
    key: nanoid(),
    value: 'How do I get started with the API?',
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: 'You can sign up on our website and get an API key instantly.',
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
  {
    key: nanoid(),
    value: 'Is there a free trial available?',
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: 'Yes, we offer a 14-day free trial with full access.',
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
  {
    key: nanoid(),
    value: 'What kind of support do you provide?',
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: 'We provide 24/7 chat and email support for all users.',
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
  {
    key: nanoid(),
    value: 'Thank you for the information!',
    name: 'Alex Johnson',
    avatar: 'https://github.com/haydenbleasel.png',
  },
  {
    key: nanoid(),
    value: "You're welcome! Let me know if you have any more questions.",
    name: 'AI Assistant',
    avatar: 'https://github.com/openai.png',
  },
]

const visibleMessages = ref<MessageItem[]>([])

let timer: number | null = null

type Status = 'submitted' | 'streaming' | 'ready' | 'error'

const models = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'claude-2', name: 'Claude 2' },
  { id: 'claude-instant', name: 'Claude Instant' },
  { id: 'palm-2', name: 'PaLM 2' },
  { id: 'llama-2-70b', name: 'Llama 2 70B' },
  { id: 'llama-2-13b', name: 'Llama 2 13B' },
  { id: 'cohere-command', name: 'Command' },
  { id: 'mistral-7b', name: 'Mistral 7B' },
]

const text = ref('')
const model = ref(models[0]!.id)
const status = ref<Status>('ready')

function onSubmit(event: Event) {
  event.preventDefault()
  if (!text.value) return

  status.value = 'submitted'

  setTimeout(() => {
    status.value = 'streaming'
  }, 200)

  setTimeout(() => {
    status.value = 'ready'
  }, 2000)
}

onMounted(() => {
  let index = 0
  timer = window.setInterval(() => {
    const next = messages[index]
    if (!next) {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
      return
    }
    visibleMessages.value = [...visibleMessages.value, next]
    index += 1
  }, 500)
})

onUnmounted(() => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped lang="scss"></style>
