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
  // {
  //   pos: -1,
  //   configure: {
  //     title: '数据源2',
  //     key: 'dataSource2',
  //     items: [
  //       {
  //         /**
  //          * INFO:
  //          *  数据源的字段名称是限制死的，只能为 chartData/extraChartData，因为后续需要通过这两个字段进行数据源处理，
  //          *  最终会给组件返回 dataSourceData/extraDataSourceData 两个处理好数据源数据的属性
  //          */
  //         name: 'extraChartData',
  //         title: '',
  //         setter: {
  //           componentName: 'ChartDataSetter',
  //           props: {
  //             isRepeatDrag: false,
  //             maxCount: 3,
  //             dimension: {
  //               title: '维度（X轴）',
  //               options: ['chartDisplayName', 'orderby', 'calculateType', 'format', 'nullValue'],
  //               max: 2,
  //             },
  //             indicator: {
  //               title: '指标（Y轴）',
  //               options: ['chartDisplayName', 'orderby', 'calculateType', 'format', 'nullValue'],
  //               max: 2,
  //             },
  //             defaultValue: {
  //               constant: {
  //                 data: [
  //                   { name: '采矿', type: '用电量', value: '12,500' },
  //                   { name: '采矿', type: '用水量', value: '280,000' },
  //                   { name: '采矿', type: '燃料', value: '25' },
  //                   { name: '选矿', type: '用电量', value: '21,300' },
  //                   { name: '选矿', type: '用水量', value: '485,000' },
  //                   { name: '选矿', type: '燃料', value: '42' },
  //                   { name: '焙烧', type: '用电量', value: '29,800' },
  //                   { name: '焙烧', type: '用水量', value: '620,000' },
  //                   { name: '焙烧', type: '燃料', value: '58' },
  //                   { name: '冶炼', type: '用电量', value: '45,200' },
  //                   { name: '冶炼', type: '用水量', value: '820,000' },
  //                   { name: '冶炼', type: '燃料', value: '75' },
  //                 ],
  //                 originalData: [
  //                   { name: '采矿', type: '用电量', value: '12,500' },
  //                   { name: '采矿', type: '用水量', value: '280,000' },
  //                   { name: '采矿', type: '燃料', value: '25' },
  //                   { name: '选矿', type: '用电量', value: '21,300' },
  //                   { name: '选矿', type: '用水量', value: '485,000' },
  //                   { name: '选矿', type: '燃料', value: '42' },
  //                   { name: '焙烧', type: '用电量', value: '29,800' },
  //                   { name: '焙烧', type: '用水量', value: '620,000' },
  //                   { name: '焙烧', type: '燃料', value: '58' },
  //                   { name: '冶炼', type: '用电量', value: '45,200' },
  //                   { name: '冶炼', type: '用水量', value: '820,000' },
  //                   { name: '冶炼', type: '燃料', value: '75' },
  //                 ],
  //                 fieldList: [
  //                   {
  //                     fieldName: 'name',
  //                     fieldDisplayName: 'name',
  //                     fieldType: 'LONGTEXT',
  //                   },
  //                   {
  //                     fieldName: 'type',
  //                     fieldDisplayName: 'type',
  //                     fieldType: 'LONGTEXT',
  //                   },
  //                   {
  //                     fieldName: 'value',
  //                     fieldDisplayName: 'value',
  //                     fieldType: 'DECIMAL',
  //                   },
  //                 ],
  //               },
  //             },
  //           },
  //         },
  //       },
  //     ],
  //   },
  // },
  {
    title: '进度条配置',
    key: 'video',
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
        ],
      },
      {
        layout: 'CollapsePanel',
        title: '动画控制',
        items: [
          {
            name: 'is_open_animation',
            title: '开启动画',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'SwitchSetter',
              props: {
                defaultValue: true,
              },
            },
          },
          {
            name: 'animation_duration',
            title: '动画时长',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'StringSetter',
              props: {
                fieldProps: {
                  min: 0,
                  max: 8000,
                  placeholder: '请输入进度值',
                  defaultValue: 1000,
                },
              },
            },
            condition: (target: any) => {
              // console.log('target',_)
              const is_open_animation = target.getPropValue('is_open_animation')
              return is_open_animation
              // return target.get.__proto__('is_open_animation')
            },
          },
          // {
          //   name: 'is_open_animation2',
          //   title: '开启动画2',
          //   inline: {
          //     flex: '1 1 100%',
          //   },
          //   setter: {
          //     componentName: 'SwitchSetter',
          //     props: {
          //       defaultValue: false,
          //     },
          //   },
          //   condition: (_: any, target: any) => {
          //     console.log('target', target)
          //     return true
          //   },
          // },
          {
            name: 'is_reverse',
            title: '反向',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'SwitchSetter',
              props: {
                defaultValue: false,
              },
            },
          },
        ],
      },
      {
        layout: 'CollapsePanel',
        title: '文本样式',
        items: [
          {
            name: 'Height',
            title: '高度',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'NumberSetter',
              props: {
                fieldProps: {
                  min: 0,
                  max: 100,
                  placeholder: '请输入高度(单位:px)',
                  defaultValue: 20,
                },
              },
            },
          },
          {
            name: 'Radius',
            title: '圆角',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'NumberSetter',
              props: {
                fieldProps: {
                  min: 0,
                  max: 50,
                  placeholder: '请输入圆角(单位:px)',
                  defaultValue: 10,
                },
              },
            },
          },
          {
            name: 'scale_font_size',
            title: '刻度字体大小',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'NumberSetter',
              props: {
                fieldProps: {
                  min: 0,
                  max: 50,
                  placeholder: '请输入刻度字体大小(单位:px)',
                  defaultValue: 10,
                },
              },
            },
          },
          {
            name: 'scale_font_color',
            title: '刻度字体颜色',
            setter: {
              componentName: 'ColorSetter',
            },
          },
          {
            name: 'progress_font_size',
            title: '进度字体大小',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'NumberSetter',
              props: {
                fieldProps: {
                  min: 0,
                  max: 50,
                  placeholder: '请输入进度字体大小(单位:px)',
                  defaultValue: 10,
                },
              },
            },
          },
          {
            name: 'progress_font_color',
            title: '进度字体颜色',
            setter: {
              componentName: 'ColorSetter',
            },
          },
          {
            name: 'color1',
            title: '进度条渐变色1',
            setter: {
              componentName: 'ColorSetter',
            },
          },
          {
            name: 'color2',
            title: '进度条渐变色2',
            setter: {
              componentName: 'ColorSetter',
            },
          },
          {
            name: 'head_icon',
            title: '头部图标',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'CommonUploadSetter',
              props: {
                acceptFormatSuffix: ['flac', 'webm', 'weba', 'wav', 'ogg', 'mp3', 'png', 'jpg', 'jpeg'],
                formatMap: {
                  flac: 'flac',
                  webm: 'webm',
                  weba: 'weba',
                  wav: 'wav',
                  ogg: 'ogg',
                  mp3: 'mp3',
                  png: 'png',
                  jpg: 'jpg',
                  jpeg: 'jpeg',
                },
              },
            },
          },
        ],
      },
      {
        layout: 'CollapsePanel',
        title: '图标',
        items: [
          {
            name: 'head_icon',
            title: '头部图标',
            inline: {
              flex: '1 1 100%',
            },
            setter: {
              componentName: 'CommonUploadSetter',
              props: {
                acceptFormatSuffix: ['flac', 'webm', 'weba', 'wav', 'ogg', 'mp3', 'png', 'jpg', 'jpeg'],
                formatMap: {
                  flac: 'flac',
                  webm: 'webm',
                  weba: 'weba',
                  wav: 'wav',
                  ogg: 'ogg',
                  mp3: 'mp3',
                  png: 'png',
                  jpg: 'jpg',
                  jpeg: 'jpeg',
                },
              },
            },
          },
        ],
      },
    ],
  },
]
