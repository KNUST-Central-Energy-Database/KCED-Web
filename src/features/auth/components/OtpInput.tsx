import { useRef } from 'react'
import { cn } from '@/lib/utils'

export const OTP_LENGTH = 6

/** Segmented digit code input with auto-advance, backspace, arrows, and paste. */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  length = OTP_LENGTH,
}: {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  length?: number
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([])

  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  const commit = (digits: string[]) => {
    const next = digits.join('')
    onChange(next)
    if (next.length === length && digits.every((d) => d !== '')) onComplete?.(next)
  }

  const digitsFrom = (v: string) => Array.from({ length }, (_, i) => v[i] ?? '')

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const digits = digitsFrom(value)
    digits[i] = digit
    commit(digits)
    if (digit && i < length - 1) focusAt(i + 1)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) focusAt(i - 1)
    if (e.key === 'ArrowLeft' && i > 0) focusAt(i - 1)
    if (e.key === 'ArrowRight' && i < length - 1) focusAt(i + 1)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    commit(digitsFrom(pasted))
    focusAt(Math.min(pasted.length, length - 1))
  }

  return (
    <div className='flex gap-2 justify-between'>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          inputMode='numeric'
          autoComplete='one-time-code'
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            'h-12 w-full min-w-0 rounded-md border border-input bg-transparent text-center text-lg font-medium',
            'outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:opacity-60',
          )}
        />
      ))}
    </div>
  )
}
