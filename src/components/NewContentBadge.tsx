import { motion, AnimatePresence } from 'motion/react'
import { Badge } from './ui/badge'

interface NewContentBadgeProps {
  count: number
  variant?: 'default' | 'small'
}

export function NewContentBadge({ count, variant = 'default' }: NewContentBadgeProps) {
  if (count === 0) return null

  const displayCount = count > 99 ? '99+' : count.toString()

  if (variant === 'small') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="inline-block"
        >
          <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] px-1.5 py-0 h-4 min-w-[16px] flex items-center justify-center animate-pulse">
            {displayCount}
          </Badge>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="inline-block"
      >
        <Badge className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white shadow-lg animate-pulse">
          {displayCount}
        </Badge>
      </motion.div>
    </AnimatePresence>
  )
}
