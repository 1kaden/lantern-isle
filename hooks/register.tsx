import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE } from './scene'

// Lantern Isle: a lamp-lit seaside village at night, drawn in ASCII.
// Dark only. Accent is lantern gold, warning terracotta, success sea-foam,
// pro a dusky rose, danger a deep ember red.
const { theme, problems } = makeColors({
  label: 'Lantern Isle',
  only: 'dark',
  roles: { accent: '#d9a24e', danger: '#cc4a40', success: '#5aa892', warning: '#d0703a', pro: '#b87a98' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0c0b10',
        'surface-1': '#121117',
        'surface-2': '#17161c',
        'surface-3': '#1c1a21',
        'text-primary': '#efe6d8',
        'text-secondary': '#cbbfae',
        'text-muted': '#a39684',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'lantern-isle', glass: { blur: 0, tint: '#0c0b10', opacity: 0.5 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'lantern-isle') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="An ASCII seaside village at blue hour: a rose twilight over misty ridges, drifting sea fog, lamp-lit terraces above a warm beach, waves and foam washing in around sea stacks, fireflies, light rain and coastal grass"
        isInteractive
      />
    )
  })
}
