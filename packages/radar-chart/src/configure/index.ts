import type { Configure } from '@/types/global'

export const configure: Configure = [
  {
    pos: -1,
    configure: {
      title: '数据',
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
              dimension: {
                title: '维度',
                options: ['chartDisplayName', 'orderby', 'calculateType', 'format', 'nullValue'],
                max: 2,
              },
              indicator: {
                title: '系列',
                options: ['chartDisplayName', 'orderby', 'calculateType', 'format', 'nullValue'],
                max: 100,
              },
              defaultValue: {
                constant: {
                  data: [
                    { name: '系列1', type: '维度一', value: '80' },
                    { name: '系列1', type: '维度二', value: '85' },
                    { name: '系列1', type: '维度三', value: '40' },
                    { name: '系列1', type: '维度四', value: '90' },
                    { name: '系列1', type: '维度五', value: '50' },
                    { name: '系列1', type: '维度六', value: '70' },
                    { name: '系列2', type: '维度一', value: '50' },
                    { name: '系列2', type: '维度二', value: '60' },
                    { name: '系列2', type: '维度三', value: '85' },
                    { name: '系列2', type: '维度四', value: '40' },
                    { name: '系列2', type: '维度五', value: '90' },
                    { name: '系列2', type: '维度六', value: '80' },
                  ],
                  originalData: [
                    { name: '系列1', type: '维度一', value: '80' },
                    { name: '系列1', type: '维度二', value: '85' },
                    { name: '系列1', type: '维度三', value: '40' },
                    { name: '系列1', type: '维度四', value: '90' },
                    { name: '系列1', type: '维度五', value: '50' },
                    { name: '系列1', type: '维度六', value: '70' },
                    { name: '系列2', type: '维度一', value: '50' },
                    { name: '系列2', type: '维度二', value: '60' },
                    { name: '系列2', type: '维度三', value: '85' },
                    { name: '系列2', type: '维度四', value: '40' },
                    { name: '系列2', type: '维度五', value: '90' },
                    { name: '系列2', type: '维度六', value: '80' },
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
        title: '系列配置',
        items: [
          {
            name: 'customSeriesStyles',
            title: '',
            setter: {
              componentName: 'ChartSeriesTab',
            },
            defaultValue: [
              {
                __seriesType: '__default',
                name: '默认系列',
              },
            ],
            items: [
              {
                name: 'customSeriesStyles[i].name',
                title: '系列名称',
                setter: 'StringSetter',
              },
              {
                layout: 'InlineBox',
                title: '样式配置',
                inline: true,
                items: [
                  {
                    name: 'customSeriesStyles[i].color',
                    title: '颜色',
                    setter: 'ColorSetter',
                  },
                  {
                    name: 'customSeriesStyles[i].lineWidth',
                    title: '线宽',
                    setter: {
                      componentName: 'NumberSetter',
                      props: {
                        min: 1,
                        max: 10,
                      },
                    },
                  },
                  {
                    name: 'customSeriesStyles[i].lineStyle',
                    title: '线型',
                    setter: {
                      componentName: 'SelectSetter',
                      props: {
                        options: [
                          { label: '实线', value: 'solid' },
                          { label: '虚线', value: 'dashed' },
                          { label: '点线', value: 'dotted' },
                        ],
                      },
                    },
                  },
                  {
                    name: 'customSeriesStyles[i].areaColor',
                    title: '填充颜色',
                    setter: 'ColorSetter',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        layout: 'CollapsePanel',
        title: '雷达图样式',
        items: [
          {
            name: 'radarConfig.shape',
            title: '图形形状',
            setter: {
              componentName: 'SelectSetter',
              props: {
                options: [
                  { label: '多边形', value: 'polygon' },
                  { label: '圆形', value: 'circle' },
                ],
              },
            },
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.radius',
            title: '半径',
            setter: 'StringSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.startAngle',
            title: '起始角度',
            setter: {
              componentName: 'NumberSetter',
              props: {
                min: 0,
                max: 360,
              },
            },
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.splitNumber',
            title: '分割线数量',
            setter: {
              componentName: 'NumberSetter',
              props: {
                min: 1,
                max: 10,
              },
            },
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.backgroundColor',
            title: '背景颜色',
            setter: 'ColorSetter',
            inline: {
              flex: '1 1 100%',
              justifyContent: 'between',
            },
          },
          {
            name: 'radarConfig.splitLineColor',
            title: '分割线颜色',
            setter: 'ColorSetter',
            inline: {
              flex: '1 1 100%',
            },
          },
          {
            name: 'radarConfig.axisLineColor',
            title: '轴线颜色',
            setter: 'ColorSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.nameColor',
            title: '指示器名称颜色',
            setter: 'ColorSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.axisLine',
            title: '显示轴线',
            setter: 'SwitchSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.splitLine',
            title: '显示分割线',
            setter: 'SwitchSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.indicatorName',
            title: '显示指示器名称',
            setter: 'SwitchSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.axisLabel',
            title: '显示刻度',
            setter: 'SwitchSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'radarConfig.axisLabelColor',
            title: '刻度颜色',
            setter: 'ColorSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
        ],
      },
      {
        layout: 'CollapsePanel',
        title: '图例配置',
        items: [
          {
            name: 'legendConfig.show',
            title: '显示图例',
            setter: 'SwitchSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
          {
            name: 'legendConfig.position',
            title: '图例位置',
            setter: {
              componentName: 'SelectSetter',
              props: {
                options: [
                  { label: '顶部', value: 'top' },
                  { label: '底部', value: 'bottom' },
                  { label: '左侧', value: 'left' },
                  { label: '右侧', value: 'right' },
                ],
              },
            },
            inline: {
              flex: '1 1 50%',
            },
          },
        ],
      },
      {
        layout: 'CollapsePanel',
        title: '数据预览',
        items: [
          {
            name: 'tooltipConfig.show',
            title: '悬停显示提示框',
            setter: 'SwitchSetter',
            inline: {
              flex: '1 1 50%',
            },
          },
        ],
      },
    ],
  },
]
