/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: 'rgb(15, 23, 42)',
        },
        {
          name: 'sidebar-gradient',
          value: 'linear-gradient(rgb(30, 41, 59) 0%, rgb(15, 23, 42) 100%)',
        },
      ],
    },
  },
};

export default preview; 