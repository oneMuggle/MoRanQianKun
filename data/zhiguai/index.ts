/**
 * 志怪系统数据入口
 *
 * 导出志怪生物、事件、妖象功法等数据模块。
 */

export {
    志怪生物列表,
    获取志怪生物按类型,
    获取志怪生物按威胁等级,
    随机志怪生物,
    随机志怪生物组,
    type 志怪生物,
    type 志怪生物等级,
    type 阴阳属性,
    type 威胁等级
} from './creatures';

export {
    志怪事件列表,
    获取志怪事件按触发类型,
    随机志怪事件,
    随机志怪事件组,
    获取志怪事件按关联生物,
    type 志怪事件,
    type 事件触发类型,
    type 事件结局类型
} from './events';

export {
    妖象功法列表,
    getYaoxiangById,
    getYaoxiangBySect,
    getYaoxiangByGrade,
    type 妖象功法,
    type 妖象功法门派,
    type 妖象功法品级,
    type 妖象功法风险类型
} from '../cultivation/yaoxiang';
