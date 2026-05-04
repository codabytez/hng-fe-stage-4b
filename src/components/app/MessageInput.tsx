import { useRef, useState } from 'react'
import { Send2, Paperclip, Lock1 } from 'iconsax-reactjs'
import { cn } from '@/utils/cn'

interface MessageInputProps {
  recipientName: string
  onSend: (text: string) => void
  disabled?: boolean
  sending?: boolean
}

export function MessageInput({ recipientName, onSend, disabled, sending }: MessageInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled || sending) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  const canSend = value.trim().length > 0 && !disabled && !sending

  return (
    <div className="px-4 py-3 border-t border-border bg-surface">
      <div className="flex items-end gap-3 px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border focus-within:border-teal transition-colors">
        <Lock1 size={16} color="var(--color-text-muted)" className="flex-shrink-0 mb-0.5" />

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${recipientName}…`}
          disabled={disabled || sending}
          className={cn(
            'flex-1 resize-none bg-transparent text-sm text-text-primary placeholder:text-text-muted',
            'focus:outline-none disabled:opacity-50',
            'min-h-[20px] max-h-[140px] leading-5 py-0.5'
          )}
        />

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            disabled
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted opacity-40 cursor-not-allowed"
            aria-label="Attach file"
          >
            <Paperclip size={16} color="currentColor" />
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'w-7 h-7 flex items-center justify-center rounded-lg transition-colors',
              canSend
                ? 'bg-teal text-bg hover:bg-teal-dim cursor-pointer'
                : 'text-text-muted opacity-40 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            {sending ? (
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send2 size={14} color="currentColor" variant="Bold" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
