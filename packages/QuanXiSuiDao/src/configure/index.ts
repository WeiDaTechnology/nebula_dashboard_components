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
    pos: -1,
    configure: {
      title: '数据源2',
      key: 'dataSource2',
      items: [
        {
          /**
           * INFO:
           *  数据源的字段名称是限制死的，只能为 chartData/extraChartData，因为后续需要通过这两个字段进行数据源处理，
           *  最终会给组件返回 dataSourceData/extraDataSourceData 两个处理好数据源数据的属性
           */
          name: 'extraChartData',
          title: '',
          setter: {
            componentName: 'ChartDataSetter',
            props: {
              isRepeatDrag: false,
              maxCount: 3,
              dimension: {
                title: '维度（X轴）',
                options: ['chartDisplayName', 'orderby', 'calculateType', 'format', 'nullValue'],
                max: 2,
              },
              indicator: {
                title: '指标（Y轴）',
                options: ['chartDisplayName', 'orderby', 'calculateType', 'format', 'nullValue'],
                max: 2,
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
  },
]
