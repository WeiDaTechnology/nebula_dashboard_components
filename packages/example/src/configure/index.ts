export const configure = {
      title: '配置',
      key: 'setting',
      items: [
        {
          layout: 'CollapsePanel',
          title: '基础配置',
          items: [
              {
              name: 'lineSpace',
              title: '行间距',
              inline: {
                flex: '1 1 50%',
              },
              setter: {
                componentName: 'Setter1',
              },
            },
            {
              name: 'columnSpace',
              title: '列间距',
              inline: {
                flex: '1 0 50%',
              },
              setter: {
                componentName: 'NumberSetter',
              },
            },
          ]
        }
      ]
    }