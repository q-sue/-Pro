<template>
    <div class="audit-fee-container">
      <div class="search-card">
        <h2 class="title">行业审计费用查询系统</h2>
        <div class="search-box">
          <el-autocomplete
            v-model="searchText"
            :fetch-suggestions="querySearch"
            placeholder="请输入行业代码或行业名称"
            :trigger-on-focus="false"
            @select="handleSelect"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #default="{ item }">
              <div class="suggestion-item">
                <span class="code">{{ item.code }}</span>
                <span class="name">{{ item.name }}</span>
              </div>
            </template>
          </el-autocomplete>
          <el-button type="primary" @click="handleSearch" class="search-btn">
            查询
          </el-button>
        </div>
        
        <div v-if="resultVisible" class="result-card">
          <div class="result-header">
            <h3>查询结果</h3>
            <el-tag :type="resultTagType" effect="light" round>
              {{ resultTagText }}
            </el-tag>
          </div>
          <div class="result-content">
            <div class="result-item">
              <span class="label">行业代码:</span>
              <span class="value">{{ currentResult.code }}</span>
            </div>
            <div class="result-item">
              <span class="label">行业名称:</span>
              <span class="value">{{ currentResult.name }}</span>
            </div>
            <div class="result-item highlight">
              <span class="label">审计费用(元):</span>
              <span class="value">{{ formatNumber(currentResult.fee) }}</span>
            </div>
            <div class="result-item">
        
              
            </div>
          </div>
        </div>
        
        <div v-else class="empty-tip">
          <el-empty description="请输入行业代码或名称查询审计费用" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Search } from '@element-plus/icons-vue'
  const emit = defineEmits(['query-complete'])
  
  // 行业数据
  const industryData = [
    { code: 'C13', name: '农副食品加工业', logAvg: 14.07361338, fee: 1294471.91 },
    { code: 'C14', name: '农副食品加工业', logAvg: 13.80461999, fee: 989168.5204 },
    { code: 'C15', name: '酒、饮料和精制茶制造业', logAvg: 13.90056869, fee: 1088780.357 },
    { code: 'C17', name: '纺织业', logAvg: 13.66636264, fee: 861441.6834 },
    { code: 'C18', name: '纺织服装、服饰业', logAvg: 14.06034192, fee: 1277405.882 },
    { code: 'C19', name: '皮革、毛皮、羽毛及其制品和制鞋业', logAvg: 14.01148787, fee: 1216499.31 },
    { code: 'C20', name: '木材加工和木、竹、藤、棕、草制品业', logAvg: 13.73049016, fee: 918493.5528 },
    { code: 'C21', name: '家具制造业', logAvg: 13.98644279, fee: 1186410.341 },
    { code: 'C22', name: '造纸和纸制品业', logAvg: 13.93068136, fee: 1122065.071 },
    { code: 'C23', name: '印刷和记录媒介复制业', logAvg: 13.73327556, fee: 921055.4873 },
    { code: 'C24', name: '文教、工美、体育和娱乐用品制造业', logAvg: 13.89305385, fee: 1080629.014 },
    { code: 'C25', name: '石油、煤炭及其他燃料加工业', logAvg: 13.64053734, fee: 839479.5046 },
    { code: 'C26', name: '化学原料和化学制品制造业', logAvg: 13.82268432, fee: 1007199.555 },
    { code: 'C27', name: '医药制造业', logAvg: 13.85958495, fee: 1045060.097 },
    { code: 'C28', name: '化学纤维制造业', logAvg: 13.93046761, fee: 1121825.251 },
    { code: 'C29', name: '橡胶和塑料制品业', logAvg: 13.72784302, fee: 916065.3838 },
    { code: 'C30', name: '非金属矿物制品业', logAvg: 13.86290647, fee: 1048537.053 },
    { code: 'C31', name: '黑色金属冶炼和压延加工业', logAvg: 14.16723975, fee: 1421523.512 },
    { code: 'C32', name: '有色金属冶炼和压延加工业', logAvg: 14.03753621, fee: 1248603.407 },
    { code: 'C33', name: '金属制品业', logAvg: 13.78043076, fee: 965528.3613 },
    { code: 'C34', name: '通用设备制造业', logAvg: 13.75282922, fee: 939242.7247 },
    { code: 'C35', name: '专用设备制造业', logAvg: 13.72329739, fee: 911910.7392 },
    { code: 'C36', name: '汽车制造业', logAvg: 13.92393256, fee: 1114517.97 },
    { code: 'C37', name: '铁路、船舶、航空航天和其他运输设备制造业', logAvg: 13.8039889, fee: 988544.4579 },
    { code: 'C38', name: '电气机械和器材制造业', logAvg: 13.81396084, fee: 998451.4787 },
    { code: 'C39', name: '计算机、通信和其他电子设备制造业', logAvg: 13.77183248, fee: 957262.0676 },
    { code: 'C40', name: '仪器仪表制造业', logAvg: 13.44763396, fee: 692202.5947 },
    { code: 'C41', name: '其他制造业', logAvg: 13.7522771, fee: 938724.2971 },
    { code: 'C42', name: '废弃资源综合利用业', logAvg: 14.10085373, fee: 1330218.443 },
    { code: 'D44', name: '电力、热力生产和供应业', logAvg: 14.18620946, fee: 1448746.788 },
    { code: 'D45', name: '燃气生产和供应业', logAvg: 14.02282344, fee: 1230367.476 },
    { code: 'D46', name: '水的生产和供应业', logAvg: 13.83761171, fee: 1022347.194 },
    { code: 'E47', name: '房屋建筑业', logAvg: 14.03476667, fee: 1245150.139 },
    { code: 'E48', name: '土木工程建筑业', logAvg: 14.57119962, fee: 2129078.091 },
    { code: 'E49', name: '建筑安装业', logAvg: 14.53334999, fee: 2049999.261 },
    { code: 'E50', name: '建筑装饰、装修和其他建筑业', logAvg: 14.11883943, fee: 1354359.802 },
    { code: 'F51', name: '批发业', logAvg: 14.13973764, fee: 1382961.314 },
    { code: 'F52', name: '零售业', logAvg: 14.12013806, fee: 1356119.758 },
    { code: 'G53', name: '铁路运输业', logAvg: 14.12085366, fee: 1357090.547 },
    { code: 'G54', name: '道路运输业', logAvg: 13.79441062, fee: 979121.1072 },
    { code: 'G55', name: '水上运输业', logAvg: 14.51778249, fee: 2018333.021 },
    { code: 'G56', name: '航空运输业', logAvg: 14.67660499, fee: 2365748.419 },
    { code: 'G58', name: '多式联运和运输代理业', logAgg: 13.89472365, fee: 1082434.96 },
    { code: 'G59', name: '装卸搬运和仓储业', logAvg: 14.02182929, fee: 1229144.906 },
    { code: 'G60', name: '邮政业', logAvg: 15.26463127, fee: 4259367.663 },
    { code: 'I63', name: '电信、广播电视和卫星传输服务', logAvg: 14.42288331, fee: 1835602.468 },
    { code: 'I64', name: '互联网和相关服务', logAvg: 13.98543413, fee: 1185214.261 },
    { code: 'I65', name: '软件和信息技术服务业', logAvg: 13.81135214, fee: 995850.2143 },
    { code: 'L71', name: '租赁业', logAvg: 14.09889412, fee: 1327614.286 },
    { code: 'L72', name: '商务服务业', logAvg: 14.16064723, fee: 1412182.912 },
    { code: 'M73', name: '研究和试验发展', logAvg: 14.03385067, fee: 1244010.098 },
    { code: 'M74', name: '专业技术服务业', logAvg: 13.79262194, fee: 977371.3366 },
    { code: 'M75', name: '科技推广和应用服务业', logAvg: 13.61876726, fee: 821401.4629 },
    { code: 'N77', name: '生态保护和环境治理业', logAvg: 13.97970275, fee: 1178440.78 },
    { code: 'N78', name: '公共设施管理业', logAvg: 13.5304639, fee: 751979.1676 },
    { code: 'P82', name: '教育', logAvg: 13.8457524, fee: 1030703.769 },
    { code: 'Q83', name: '卫生', logAvg: 14.59471804, fee: 2179744.101 },
    { code: 'R85', name: '文化、体育和娱乐业', logAvg: 14.13470645, fee: 1376020.852 },
    { code: 'R86', name: '新闻和出版业', logAvg: 14.21498299, fee: 1491037.861 },
    { code: 'R87', name: '广播、电视、电影和录音制作业', logAvg: 13.97763705, fee: 1176008.991 },
    { code: 'R88', name: '文化艺术业', logAvg: 13.71014977, fee: 899999.7504 }
  ]
  
  const searchText = ref('')
  const resultVisible = ref(false)
  const currentResult = ref({
    code: '',
    name: '',
    logAvg: 0,
    fee: 0
  })
  
  // 格式化数字显示
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN', {
      maximumFractionDigits: 2
    }).format(num)
  }
  
  // 查询建议
  const querySearch = (queryString: string, cb: any) => {
    const results = queryString
      ? industryData.filter(item => 
          item.code.toLowerCase().includes(queryString.toLowerCase()) || 
          item.name.toLowerCase().includes(queryString.toLowerCase())
        )
      : industryData
    
    cb(results.map(item => ({
      value: `${item.code} ${item.name}`,
      ...item
    })))
  }
  
  // 处理选择
  const handleSelect = (item: any) => {
  currentResult.value = {
    code: item.code,
    name: item.name,
    logAvg: item.logAvg,
    fee: item.fee
  }
  resultVisible.value = true
  // 添加这行代码，触发事件
  emit('query-complete', `${item.name} ${formatNumber(item.fee)}元`)
}

// 修改handleSearch方法
const handleSearch = () => {
  if (!searchText.value) {
    resultVisible.value = false
    return
  }
  
  const result = industryData.find(item => 
    item.code.toLowerCase() === searchText.value.toLowerCase() || 
    item.name.toLowerCase() === searchText.value.toLowerCase()
  )
  
  if (result) {
    currentResult.value = {
      code: result.code,
      name: result.name,
      logAvg: result.logAvg || 0,
      fee: result.fee
    }
    resultVisible.value = true
    // 添加这行代码，触发事件
    emit('query-complete', `${result.name} ${formatNumber(result.fee)}元`)
  } else {
    resultVisible.value = false
  }
}
  
  // 计算标签类型和文本
  const resultTagType = computed(() => {
    if (currentResult.value.fee > 2000000) return 'danger'
    if (currentResult.value.fee > 1500000) return 'warning'
    return 'success'
  })
  
  const resultTagText = computed(() => {
    if (currentResult.value.fee > 2000000) return '高费用行业'
    if (currentResult.value.fee > 1500000) return '中高费用行业'
    return '常规费用行业'
  })
  </script>
  
  <style scoped>
  .audit-fee-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 10vh;
    background-color: var(--el-bg-color-page);
    padding: 20px;
  }
  
  .search-card {
    width: 100%;
    max-width: 800px;
    background: var(--el-bg-color);
    border-radius: 12px;
    box-shadow: var(--el-box-shadow-light);
    padding: 40px;
  }
  
  .title {
    text-align: center;
    color: var(--el-color-primary);
    margin-bottom: 30px;
    font-size: 28px;
    font-weight: 600;
  }
  
  .search-box {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
  }
  
  .search-input {
    flex: 1;
  }
  
  .search-btn {
    width: 100px;
  }
  
  .suggestion-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
  }
  
  .suggestion-item .code {
    font-weight: bold;
    color: var(--el-color-primary);
  }
  
  .suggestion-item .name {
    color: var(--el-text-color-regular);
  }
  
  .result-card {
    background: var(--el-bg-color-overlay);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid var(--el-border-color-light);
    animation: fadeIn 0.3s ease;
  }
  
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px dashed var(--el-border-color-light);
  }
  
  .result-header h3 {
    margin: 0;
    color: var(--el-color-primary);
  }
  
  .result-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  .result-item {
    display: flex;
    align-items: center;
  }
  
  .result-item.highlight {
    grid-column: span 2;
    background: var(--el-color-primary-light-9);
    padding: 12px;
    border-radius: 6px;
    margin-top: 5px;
  }
  
  .result-item.highlight .label {
    font-weight: bold;
    color: var(--el-color-primary);
  }
  
  .result-item.highlight .value {
    font-weight: bold;
    font-size: 18px;
    color: var(--el-color-primary);
  }
  
  .label {
    color: var(--el-text-color-secondary);
    margin-right: 10px;
    min-width: 100px;
  }
  
  .value {
    color: var(--el-text-color-regular);
    font-weight: 500;
  }
  
  .empty-tip {
    text-align: center;
    padding: 40px 0;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>