import { Lock1 } from 'iconsax-reactjs'

export function E2EEBanner() {
  return (
    <div className="mx-auto my-6 max-w-sm w-full px-4 py-4 rounded-xl border border-teal-subtle bg-teal-subtle/30 text-center flex flex-col items-center gap-2">
      <Lock1 size={20} color="var(--color-teal)" variant="Bold" />
      <p className="text-sm font-semibold text-teal">This conversation is end-to-end encrypted</p>
      <p className="text-xs text-text-secondary leading-relaxed">
        Messages can only be read on devices where the private keys are stored.
      </p>
    </div>
  )
}
