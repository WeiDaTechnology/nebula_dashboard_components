import type { Configure } from '@/types/global'

export const configure: Configure = {
  title: '配置',
  key: 'setting',
  items: [
    {
      layout: 'CollapsePanel',
      title: '基础配置',
      items: [
        {
          name: 'style.color',
          title: '文字颜色',
          inline: {
            flex: '1 1 100%',
          },
          setter: 'ColorSetter',
        },
        {
          name: 'exampleSetter',
          title: '自定义设置器',
          inline: {
            flex: '1 1 50%',
          },
          setter: 'ExampleSetter',
        },
      ],
    },
  ],
}
