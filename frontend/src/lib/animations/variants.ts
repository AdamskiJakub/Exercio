import { Variants } from 'framer-motion';

/**
 * Fade in from bottom animation
 * Usage: <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={index} />
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.1,
      ease: 'easeOut',
    },
  }),
};

/**
 * Hover lift animation (subtle)
 * Usage: <motion.div whileHover="hover" variants={hoverLift} />
 */
export const hoverLift: Variants = {
  hover: {
    y: -5,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

/**
 * Card animation for grids (combines fade in + hover border glow)
 * Usage: <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={index} />
 */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.1,
      ease: 'easeOut',
    },
  }),
};

/**
 * Title animation with scale
 * Usage: <motion.h1 variants={titleVariants} initial="hidden" animate="visible" />
 */
export const titleVariants: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Stagger children animation
 * Usage on parent: <motion.div variants={staggerContainer} initial="hidden" animate="visible">
 * Usage on children: <motion.div variants={fadeInUp} />
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
