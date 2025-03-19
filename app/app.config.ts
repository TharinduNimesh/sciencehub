export default defineAppConfig({
    ui: {
      primary: 'indigo',
      gray: 'zinc',
      input: {
        default: {
          size: "lg",
          // color: "gray",
        },
      },
      textarea: {
        default: {
          size: "lg",
          // color: "gray",
        },
      },
      select: {
        default: {
          size: "lg",
          // color: "gray",
        },
      },
      button: {
        default: {
          size: "lg",
          // color: 'gray',
        },
      },
      formGroup: {
        default: {
          size: "lg",
        },
      },
      checkbox: {
        default: {
          size: "lg",
        },
      },
      toggle: {
        default: {
          size: "lg",
        },
      },
      radio: {
        default: {
          size: "lg",
        },
      },
      card: {
        background: 'bg-white dark:bg-zinc-900',
        divide: 'divide-zinc-200 dark:divide-zinc-800',
        ring: 'ring-1 ring-zinc-200 dark:ring-zinc-800',
      },
      header: {
        wrapper: 'bg-white dark:bg-zinc-900',
        links: 'text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary'
      },
      footer: {
        wrapper: 'bg-white dark:bg-zinc-900'
      },
      badge: {
        base: 'inline-flex items-center',
        rounded: 'rounded-md px-2 py-1',
        font: 'font-medium text-sm',
        size: {
          xs: 'px-1.5 py-0.5 text-xs',
          sm: 'px-2 py-1 text-xs',
          md: 'px-2 py-1 text-sm',
          lg: 'px-2.5 py-1.5 text-sm'
        },
        variant: {
          solid: 'bg-{color}-500 dark:bg-{color}-400 text-white dark:text-gray-900',
          outline: 'text-{color}-500 dark:text-{color}-400 ring-1 ring-inset ring-{color}-500 dark:ring-{color}-400',
          soft: 'bg-{color}-50 dark:bg-{color}-400 dark:bg-opacity-10 text-{color}-500 dark:text-{color}-400',
          subtle: 'bg-{color}-50 dark:bg-{color}-400 dark:bg-opacity-10 text-{color}-500 dark:text-{color}-400'
        }
      }
    }
  });