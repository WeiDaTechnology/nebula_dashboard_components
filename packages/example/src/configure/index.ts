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
              maxCount: 100,
              isShowFormSource: true,
              indicator: {
                title: '数据',
                options: ['chartDisplayName', 'format'],
                max: 100,
              },
              defaultValue: {
                constant: {
                  data: [
                    { name: '采矿', type: '用电量', value: '12,500' },
                    { name: '采矿', type: '用水量', value: '280,000' },
                    { name: '采矿', type: '燃料', value: '25' },
                    { name: '选矿', type: '用电量', value: '21,300' },
                    { name: '选矿', type: '用水量', value: '485,000' },
                    { name: '选矿', type: '燃料', value: '42' },
                    { name: '焙烧', type: '用电量', value: '29,800' },
                    { name: '焙烧', type: '用水量', value: '620,000' },
                    { name: '焙烧', type: '燃料', value: '58' },
                    { name: '冶炼', type: '用电量', value: '45,200' },
                    { name: '冶炼', type: '用水量', value: '820,000' },
                    { name: '冶炼', type: '燃料', value: '75' },
                  ],
                  originalData: [
                    { name: '采矿', type: '用电量', value: '12,500' },
                    { name: '采矿', type: '用水量', value: '280,000' },
                    { name: '采矿', type: '燃料', value: '25' },
                    { name: '选矿', type: '用电量', value: '21,300' },
                    { name: '选矿', type: '用水量', value: '485,000' },
                    { name: '选矿', type: '燃料', value: '42' },
                    { name: '焙烧', type: '用电量', value: '29,800' },
                    { name: '焙烧', type: '用水量', value: '620,000' },
                    { name: '焙烧', type: '燃料', value: '58' },
                    { name: '冶炼', type: '用电量', value: '45,200' },
                    { name: '冶炼', type: '用水量', value: '820,000' },
                    { name: '冶炼', type: '燃料', value: '75' },
                  ],
                  fieldList: [
                    {
                      fieldName: 'name',
                      fieldDisplayName: 'name',
                      fieldType: 'LONGTEXT',
                    },
                    {
                      fieldName: 'type',
                      fieldDisplayName: 'type',
                      fieldType: 'LONGTEXT',
                    },
                    {
                      fieldName: 'value',
                      fieldDisplayName: 'value',
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
