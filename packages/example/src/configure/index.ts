import type { Configure } from '@/types/global'

export const configure: Configure = [
  {
    pos: -1,
    configure: {
      title: '数据源',
      key: 'dataSource1',
      items: [
        {
          /**
           * INFO:
           *  数据源的字段名称是限制死的，只能为 chartData/extraChartData，因为后续需要通过这两个字段进行数据源处理，
           *  最终会给组件返回 dataSourceData/extraDataSourceData 两个处理好数据源数据的属性
           */
          name: 'chartData',
          title: '',
          setter: {
            componentName: 'ChartDataSetter',
            props: {
              isRepeatDrag: false,
              maxCount: 1,
              isShowFormSource: true,
              indicator: {
                title: '数据',
                options: [
                  'chartDisplayName',
                  // TODO 这里要不要不开启格式化 如果开启格式化 会处理小数和百分比 那配置里面的后缀是不是就冲突了
                  // 'format'
                ],
                max: 1,
              },
              defaultValue: {
                constant: {
                  originalData: [
                    {
                      百分比: '50.20',
                    },
                  ],
                  data: [
                    {
                      百分比: '50.20',
                    },
                  ],
                  fieldList: [
                    {
                      fieldName: '百分比',
                      fieldDisplayName: '百分比',
                      fieldType: 'DECIMAL',
                    },
                  ],
                },
              },
            },
          },
        },
      ],
    },
  },
  {
    title: '配置',
    key: 'setting',
    items: [
      {
        layout: 'CollapsePanel',
        title: '基础配置',
        items: [
          {
            name: 'id',
            setter: 'ComponentIdSetter',
            title: '组件ID',
            inline: {
              flex: '1 1 100%',
            },
          },
          {
            name: 'style',
            title: '位置尺寸',
            setter: {
              componentName: 'ChartPositionSetter',
            },
          },
          {
            name: 'rotate',
            title: '旋转角度',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'NumberSetter',
              props: {
                fieldProps: {
                  min: -360,
                  max: 360,
                  placeholder: '请输入旋转尺寸',
                  defaultValue: 0,
                },
              },
            },
          },
          {
            name: 'opacity',
            title: '不透明度',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'SliderSetter',
              props: {
                fieldProps: {
                  min: 0,
                  max: 100,
                  placeholder: '请输入不透明度',
                  defaultValue: 100,
                },
              },
            },
          },
          {
            name: 'style.backgroundColor',
            title: '背景颜色',
            setter: {
              componentName: 'ColorSetter',
              props: {
                defaultValue: '#4399BA',
              },
            },
          },
        ],
      },
      {
        layout: 'CollapsePanel',
        title: '图表配置',
        items: [
          {
            layout: 'CollapsePanel',
            title: '入场动画',
            autoOpen: false,
            switch: true,
            items: [
              {
                name: 'entryAnimiationisShow',
                title: '',
                setter: {
                  componentName: 'SwitchSetter',
                },
              },
              {
                name: 'animation_duration',
                title: '动画时长',
                inline: {
                  flex: '1 0 100%',
                },
                setter: {
                  componentName: 'NumberSetter',
                  props: {
                    fieldProps: {
                      min: 0,
                      max: 10_000,
                    },
                    defaultValue: 1000,
                  },
                },
              },
            ],
          },
          {
            layout: 'CollapsePanel',
            title: '文本',
            autoOpen: false,
            switch: true,
            items: [
              {
                name: 'showTextisShow',
                title: '',
                setter: {
                  componentName: 'SwitchSetter',
                },
              },
              {
                name: 'style.fontFamily',
                title: '字体',
                inline: {
                  flex: '1 0 100%',
                },
                setter: {
                  componentName: 'FontFamilySetter',
                },
              },
              {
                name: 'style.color',
                title: '字体颜色',
                inline: {
                  flex: '1 0 100%',
                },
                setter: {
                  componentName: 'ColorSetter',
                  props: {
                    isShowBtn: false,
                    isAlpha: false,
                    defaultValue: '#ffffff',
                  },
                },
              },
              {
                name: 'style.fontSize',
                title: '字号',
                inline: {
                  flex: '1 1 50%',
                },
                setter: {
                  componentName: 'NumberSetter',
                  props: {
                    fieldProps: {
                      defaultValue: 54,
                    },
                  },
                },
              },
              {
                name: 'style.fontWeight',
                title: '粗细',
                inline: {
                  flex: '1 0 50%',
                },
                setter: {
                  componentName: 'SelectSetter',
                  props: {
                    options: [
                      {
                        label: '正常',
                        value: 'normal',
                      },
                      {
                        label: '粗体',
                        value: 'bold',
                      },
                      {
                        label: '加粗',
                        value: 'bolder',
                      },
                    ],
                    defaultValue: 'bold',
                  },
                },
              },
              {
                name: 'style.fontStyle',
                title: '斜体',
                inline: {
                  flex: '1 0 50%',
                },
                setter: {
                  componentName: 'SelectSetter',
                  props: {
                    options: [
                      {
                        label: '正常',
                        value: 'normal',
                      },
                      {
                        label: '斜体',
                        value: 'italic',
                      },
                      {
                        label: '倾斜',
                        value: 'oblique',
                      },
                    ],
                    defaultValue: 'normal',
                  },
                },
              },
              {
                name: 'style.letterSpacing',
                title: '字距',
                inline: {
                  flex: '1 0 50%',
                },
                setter: {
                  componentName: 'NumberSetter',
                  props: {
                    fieldProps: {
                      defaultValue: 0,
                    },
                  },
                },
              },
              {
                layout: 'CollapsePanel',
                title: '小数',
                autoOpen: false,
                switch: true,
                items: [
                  {
                    name: 'decimalisShow',
                    title: '',
                    setter: {
                      componentName: 'SwitchSetter',
                    },
                  },
                  {
                    name: 'style.fontSizeFraction',
                    title: '字号',
                    inline: {
                      flex: '1 1 100%',
                    },
                    setter: {
                      componentName: 'NumberSetter',
                      props: {
                        fieldProps: {
                          defaultValue: 34,
                        },
                      },
                    },
                  },
                  {
                    name: 'style.fontSizeFractionDecimal',
                    title: '保留位数',
                    inline: {
                      flex: '1 1 100%',
                    },
                    setter: {
                      componentName: 'NumberSetter',
                      props: {
                        fieldProps: {
                          defaultValue: 1,
                        },
                      },
                    },
                  },
                ],
              },
              {
                layout: 'CollapsePanel',
                title: '后缀',
                autoOpen: false,
                switch: true,
                items: [
                  {
                    name: 'postfixisShow',
                    title: '',
                    setter: {
                      componentName: 'SwitchSetter',
                    },
                  },
                  {
                    name: 'suffix',
                    title: '文本',
                    inline: {
                      flex: '1 1 100%',
                    },
                    setter: {
                      componentName: 'StringSetter',
                      props: {
                        defaultValue: '%',
                      },
                    },
                  },
                  {
                    name: 'suffixStyle',
                    title: '字号',
                    inline: {
                      flex: '1 0 100%',
                    },
                    setter: {
                      componentName: 'NumberSetter',
                      props: {
                        defaultValue: 40,
                      },
                    },
                  },
                ],
              },
            ],
          },
          {
            layout: 'CollapsePanel',
            title: '系统配置',
            autoOpen: false,
            items: [
              {
                name: 'direction',
                title: '方向',
                inline: {
                  flex: '1 1 100%',
                },
                setter: {
                  componentName: 'SelectSetter',
                  props: {
                    options: [
                      {
                        label: '顺时针',
                        value: 'clockwise',
                      },
                      {
                        label: '逆时针',
                        value: 'counterclockwise',
                      },
                    ],
                    defaultValue: 'clockwise',
                  },
                },
              },
              {
                name: 'ringStyle',
                title: '端点样式',
                inline: {
                  flex: '1 1 100%',
                },
                setter: {
                  componentName: 'SelectSetter',
                  props: {
                    options: [
                      {
                        label: '圆角',
                        value: 'roundedcorner',
                      },
                      {
                        label: '方形',
                        value: 'Square',
                      },
                    ],
                    defaultValue: 'roundedcorner',
                  },
                },
              },
              {
                name: 'innerRadius',
                title: '半径',
                inline: {
                  flex: '1 1 100%',
                },
                setter: {
                  componentName: 'SliderSetter',
                  props: {
                    fieldProps: {
                      min: 0,
                      max: 100,
                      placeholder: '请输入半径',
                    },
                    defaultValue: 50,
                  },
                },
              },
              {
                name: 'style.ringColor',
                title: '颜色',
                setter: {
                  componentName: 'ColorSetter',
                  props: {
                    defaultValue: '#109bff',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
