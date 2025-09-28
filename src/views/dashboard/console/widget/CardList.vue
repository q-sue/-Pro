<template>
  <div>
    <ul class="card-list" :style="{ marginTop: showWorkTab ? '0' : '10px' }">
      <li 
        class="art-custom-card" 
        v-for="(item, index) in dataList" 
        :key="index"
        @click="handleCardClick(item)"
        :style="{ cursor: item.clickHandler ? 'pointer' : 'default' }"
      >
      <span class="number box-title">{{ item.des }}</span>
       
      <div class="change-box">
        <span
          class="change"
          :class="getRiskClass(item)"
        >
          {{ getLastRecordText(item) }}
        </span>
      </div>
        <i class="iconfont-sys" v-html="item.icon"></i>
      </li>
    </ul>

    <!-- 审计预测弹窗 -->
    <el-dialog
      v-model="showAuditDialog"
      title="审计费用预测"
      width="80%"
      top="5vh"
      :close-on-click-modal="false"
      custom-class="audit-prediction-dialog"
    >
      <AuditPrediction @prediction-complete="handlePredictionComplete" />
      <template #footer>
        <el-button @click="showAuditDialog = false">关闭</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </template>
    </el-dialog>
    
    <!-- 行业基准查询弹窗 -->
    <el-dialog
      v-model="showIndustryBenchmark"
      title="行业基准查询"
      width="80%"
      top="5vh"
      :close-on-click-modal="false"
      custom-class="audit-prediction-dialog"
    >
      <AuditIndustryBenchmark @query-complete="handleBenchmarkComplete" />
      <template #footer>
        <el-button @click="showIndustryBenchmark = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <!-- 项目风险识别弹窗 -->
    <el-dialog
      v-model="showAuditRisk"
      title="项目风险识别"
      width="80%"
      top="5vh"
      :close-on-click-modal="false"
      custom-class="audit-prediction-dialog"
    >
      <div class="risk-prediction-container">
        <!-- 风险指标卡片区域 -->
        <div class="risk-cards">
          <!-- 5年内更换事务所数量 -->
          <el-card class="risk-card" :class="{ 'risk-warning': firmChangeRisk }">
            <div class="card-header">
              <span class="card-title">5年内更换事务所数量</span>
              <el-tooltip content="过去5年内更换会计师事务所的次数，超过2次可能存在风险" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="card-content">
              <el-input-number
                v-model="firmChangeCount"
                :min="0"
                :max="10"
                controls-position="right"
                @change="checkFirmChangeRisk"
              />
              <div class="risk-indicator" v-if="firmChangeRisk">
                <el-icon color="#F56C6C"><Warning /></el-icon>
                <span class="risk-text">高风险</span>
              </div>
            </div>
          </el-card>

          <!-- 5年内管理层离职率 -->
          <el-card class="risk-card" :class="{ 'risk-warning': turnoverRisk }">
            <div class="card-header">
              <span class="card-title">5年内管理层离职率</span>
              <el-tooltip content="过去5年内高管离职比例，超过30%可能存在风险" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="card-content">
              <el-input-number
                v-model="turnoverRate"
                :min="0"
                :max="100"
                :step="5"
                controls-position="right"
                @change="checkTurnoverRisk"
              />
              <div class="indicator">
                <span>当前值：</span>
                <span class="value">{{ turnoverRate }}%</span>
              </div>
              <div class="risk-indicator" v-if="turnoverRisk">
                <el-icon color="#F56C6C"><Warning /></el-icon>
                <span class="risk-text">高风险</span>
              </div>
            </div>
          </el-card>

          <!-- 证监会问询函和警告函数量 -->
          <el-card class="risk-card" :class="{ 'risk-warning': inquiryRisk }">
            <div class="card-header">
              <span class="card-title">证监会问询函和警告函数量</span>
              <el-tooltip content="过去5年内收到证监会问询函或警告函的次数，超过1次可能存在风险" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="card-content">
              <el-input-number
                v-model="inquiryCount"
                :min="0"
                :max="10"
                controls-position="right"
                @change="checkInquiryRisk"
              />
              <div class="risk-indicator" v-if="inquiryRisk">
                <el-icon color="#F56C6C"><Warning /></el-icon>
                <span class="risk-text">高风险</span>
              </div>
            </div>
          </el-card>

          <!-- 是否被税务局处罚 -->
          <el-card class="risk-card" :class="{ 'risk-warning': taxPenaltyRisk }">
            <div class="card-header">
              <span class="card-title">是否被税务局处罚</span>
              <el-tooltip content="企业是否曾因税务问题受到处罚" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="card-content">
              <el-switch
                v-model="hasTaxPenalty"
                active-text="是"
                inactive-text="否"
                @change="checkTaxPenaltyRisk"
              />
              <div class="risk-indicator" v-if="taxPenaltyRisk">
                <el-icon color="#F56C6C"><Warning /></el-icon>
                <span class="risk-text">高风险</span>
              </div>
            </div>
          </el-card>

          <!-- 债务风险是否异常 -->
          <el-card class="risk-card" :class="{ 'risk-warning': debtRisk }">
            <div class="card-header">
              <span class="card-title">债务风险是否异常</span>
              <el-tooltip content="企业债务风险指标是否超出行业正常水平" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="card-content">
              <el-switch
                v-model="hasDebtRisk"
                active-text="是"
                inactive-text="否"
                @change="checkDebtRisk"
              />
              <div class="risk-indicator" v-if="debtRisk">
                <el-icon color="#F56C6C"><Warning /></el-icon>
                <span class="risk-text">高风险</span>
              </div>
            </div>
          </el-card>

          <!-- 关联交易是否偏离市场价 -->
          <el-card class="risk-card" :class="{ 'risk-warning': relatedTransactionRisk }">
            <div class="card-header">
              <span class="card-title">关联交易是否偏离市场价</span>
              <el-tooltip content="关联交易价格是否显著偏离市场价格" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="card-content">
              <el-switch
                v-model="hasRelatedTransactionRisk"
                active-text="是"
                inactive-text="否"
                @change="checkRelatedTransactionRisk"
              />
              <div class="risk-indicator" v-if="relatedTransactionRisk">
                <el-icon color="#F56C6C"><Warning /></el-icon>
                <span class="risk-text">高风险</span>
              </div>
            </div>
          </el-card>

          <!-- 存在期末交易异常 -->
          <el-card class="risk-card" :class="{ 'risk-warning': yearEndTransactionRisk }">
            <div class="card-header">
              <span class="card-title">存在期末交易异常</span>
              <el-tooltip content="是否存在期末突击交易或异常交易行为" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="card-content">
              <el-switch
                v-model="hasYearEndTransactionRisk"
                active-text="是"
                inactive-text="否"
                @change="checkYearEndTransactionRisk"
              />
              <div class="risk-indicator" v-if="yearEndTransactionRisk">
                <el-icon color="#F56C6C"><Warning /></el-icon>
                <span class="risk-text">高风险</span>
              </div>
            </div>
          </el-card>

          <!-- 5年内审计意见类型 -->
          <el-card class="risk-card" :class="{ 'risk-warning': auditOpinionRisk }">
            <div class="card-header">
              <span class="card-title">5年内审计意见类型</span>
              <el-tooltip content="过去5年内最严重的审计意见类型，非无保留意见可能存在风险" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="card-content">
              <el-select
                v-model="auditOpinion"
                placeholder="请选择"
                @change="checkAuditOpinionRisk"
              >
                <el-option label="无保留意见" value="无保留意见" />
                <el-option label="带强调事项段" value="带强调事项段" />
                <el-option label="保留意见" value="保留意见" />
                <el-option label="否定意见" value="否定意见" />
                <el-option label="无法表示意见" value="无法表示意见" />
              </el-select>
              <div class="risk-indicator" v-if="auditOpinionRisk">
                <el-icon color="#F56C6C"><Warning /></el-icon>
                <span class="risk-text">高风险</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 综合分析结果 -->
        <el-card class="result-card" v-if="showRiskSummary">
          <div class="result-header">
            <h3>风险综合分析结果</h3>
          </div>
          <div class="result-content">
            <el-alert
              :title="riskSummary.title"
              :type="riskSummary.alertType"
              :description="riskSummary.description"
              show-icon
              :closable="false"
            />
            <div class="risk-details">
              <h4>风险点明细：</h4>
              <ul>
                <li v-for="(risk, index) in detectedRisks" :key="index">
                  {{ risk }}
                </li>
              </ul>
            </div>
          </div>
        </el-card>

        <!-- 分析按钮 -->
        <div class="analysis-button">
          <el-button type="primary" @click="analyzeRisk">分析风险</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="showAuditRisk = false">关闭</el-button>
        <el-button type="primary" @click="saveRiskAssessment">保存评估</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useSettingStore } from '@/store/modules/setting'
import { storeToRefs } from 'pinia'
import { QuestionFilled, Warning } from '@element-plus/icons-vue'
import AuditPrediction from '@/views/audit/AuditPrediction.vue'
import AuditIndustryBenchmark from '@/views/audit/AuditIndustryBenchmark.vue'

const { showWorkTab } = storeToRefs(useSettingStore())
const showAuditDialog = ref(false)
const showAuditRisk = ref(false)
const showIndustryBenchmark = ref(false)
const lastPredictionResult = ref('')
const lastRiskAssessment = ref('')
const lastBenchmarkResult = ref('')

const getLastRecordText = (item: any) => {
  switch(item.des) {
    case '审计费用预测':
      return lastPredictionResult.value ? `上次预测费用：${lastPredictionResult.value}` : '暂无预测记录';
    case '行业基准查询':
      return lastBenchmarkResult.value ? `上次查询：${lastBenchmarkResult.value}` : '暂无查询记录';
    case '项目风险识别':
      return lastRiskAssessment.value ? `上次风险评估：${lastRiskAssessment.value}` : '暂无评估记录';
    case '新用户':
      return `增长率：${item.change}`;
    default:
      return `记录：${item.change}`;
  }
}

const getRiskClass = (item: any) => {
  switch(item.des) {
    case '审计费用预测':
      return lastPredictionResult.value ? 'text-success' : 'text-info';
    case '行业基准查询':
      return lastBenchmarkResult.value ? 'text-success' : 'text-info';
    case '项目风险识别':
      if (!lastRiskAssessment.value) return 'text-info';
      if (lastRiskAssessment.value.includes('高风险')) return 'text-danger';
      if (lastRiskAssessment.value.includes('中风险')) return 'text-warning';
      if (lastRiskAssessment.value.includes('低风险')) return 'text-success';
      return 'text-info';
    case '新用户':
      return item.change.indexOf('+') === -1 ? 'text-danger' : 'text-success';
    default:
      return 'text-info';
  }
}

// 风险指标数据
const firmChangeCount = ref(0)
const firmChangeRisk = ref(false)
const turnoverRate = ref(0)
const turnoverRisk = ref(false)
const inquiryCount = ref(0)
const inquiryRisk = ref(false)
const hasTaxPenalty = ref(false)
const taxPenaltyRisk = ref(false)
const hasDebtRisk = ref(false)
const debtRisk = ref(false)
const hasRelatedTransactionRisk = ref(false)
const relatedTransactionRisk = ref(false)
const hasYearEndTransactionRisk = ref(false)
const yearEndTransactionRisk = ref(false)
const auditOpinion = ref('无保留意见')
const auditOpinionRisk = ref(false)

// 风险分析结果
const showRiskSummary = ref(false)
const detectedRisks = ref<string[]>([])
const riskSummary = reactive({
  title: '',
  alertType: 'success' as 'success' | 'warning' | 'error' | 'info',
  description: ''
})

const dataList = reactive([
  {
    des: '审计费用预测',
    icon: '&#xe721;',
    startVal: 0,
    duration: 1000,
    num: 12500,
    change: '+15%',
    clickHandler: () => {
      showAuditDialog.value = true
    }
  },
  {
    des: '行业基准查询',
    icon: '&#xe7aa;',
    startVal: 0,
    duration: 1000,
    num: 9520,
    change: '-12%',
    clickHandler: () => {
      showIndustryBenchmark.value = true
    }
  },
  {
    des: '项目风险识别',
    icon: '&#xe724;',
    startVal: 0,
    duration: 1000,
    num: 182,
    change: '+10%',
    clickHandler: () => {
      showAuditRisk.value = true
    }
  },
  {
    des: '新用户',
    icon: '&#xe82a;',
    startVal: 0,
    duration: 1000,
    num: 156,
    change: '+30%'
  }
])

// 检查各项风险
const checkFirmChangeRisk = () => {
  firmChangeRisk.value = firmChangeCount.value > 2
}

const checkTurnoverRisk = () => {
  turnoverRisk.value = turnoverRate.value > 30
}

const checkInquiryRisk = () => {
  inquiryRisk.value = inquiryCount.value > 1
}

const checkTaxPenaltyRisk = () => {
  taxPenaltyRisk.value = hasTaxPenalty.value
}

const checkDebtRisk = () => {
  debtRisk.value = hasDebtRisk.value
}

const checkRelatedTransactionRisk = () => {
  relatedTransactionRisk.value = hasRelatedTransactionRisk.value
}

const checkYearEndTransactionRisk = () => {
  yearEndTransactionRisk.value = hasYearEndTransactionRisk.value
}

const checkAuditOpinionRisk = () => {
  auditOpinionRisk.value = auditOpinion.value !== '无保留意见'
}

// 综合分析风险
const analyzeRisk = () => {
  detectedRisks.value = []
  
  if (firmChangeRisk.value) detectedRisks.value.push(`5年内更换事务所数量: ${firmChangeCount.value}次`)
  if (turnoverRisk.value) detectedRisks.value.push(`5年内管理层离职率: ${turnoverRate.value}%`)
  if (inquiryRisk.value) detectedRisks.value.push(`证监会问询函和警告函数量: ${inquiryCount.value}次`)
  if (taxPenaltyRisk.value) detectedRisks.value.push('曾被税务局处罚')
  if (debtRisk.value) detectedRisks.value.push('债务风险异常')
  if (relatedTransactionRisk.value) detectedRisks.value.push('关联交易偏离市场价')
  if (yearEndTransactionRisk.value) detectedRisks.value.push('存在期末交易异常')
  if (auditOpinionRisk.value) detectedRisks.value.push(`审计意见类型: ${auditOpinion.value}`)

  // 设置风险总结
  if (detectedRisks.value.length === 0) {
    riskSummary.title = '风险分析完成，未发现明显风险点'
    riskSummary.alertType = 'success'
    riskSummary.description = '根据输入指标分析，该项目风险较低'
  } else if (detectedRisks.value.length <= 2) {
    riskSummary.title = '风险分析完成，发现少量风险点'
    riskSummary.alertType = 'warning'
    riskSummary.description = '该项目存在一定风险，建议关注'
  } else {
    riskSummary.title = '风险分析完成，发现多个风险点'
    riskSummary.alertType = 'error'
    riskSummary.description = '该项目风险较高，建议谨慎评估'
  }

  showRiskSummary.value = true
}

// 保存风险评估结果
const saveRiskAssessment = () => {
  const riskCount = detectedRisks.value.length
  let assessmentText = ''
  
  if (riskCount === 0) {
    assessmentText = '无风险'
  } else if (riskCount <= 2) {
    assessmentText = '低风险'
  } else if (riskCount <= 4) {
    assessmentText = '中风险'
  } else {
    assessmentText = '高风险'
  }
  
  lastRiskAssessment.value = `${assessmentText} (${riskCount}个风险点)`
  showAuditRisk.value = false
}

const handleCardClick = (item: any) => {
  if (item.clickHandler && typeof item.clickHandler === 'function') {
    item.clickHandler()
  }
}

const handlePredictionComplete = (result: string) => {
  lastPredictionResult.value = result
}

const handleBenchmarkComplete = (result: string) => {
  lastBenchmarkResult.value = result
}

const handleConfirm = () => {
  showAuditDialog.value = false
}
</script>

<style lang="scss" scoped>
/* 原有卡片样式保持不变 */
.card-list {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  width: calc(100% + var(--console-margin));
  margin-top: 0 !important;
  margin-left: calc(0px - var(--console-margin));
  background-color: transparent !important;

  li {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: calc(25% - var(--console-margin));
    height: 140px;
    padding: 0 18px;
    margin: 0 0 0 var(--console-margin);
    background: var(--art-main-bg-color);
    transition: all 0.3s ease;
    border: 1px solid transparent;

    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      background-color: #FFF3E0 !important;
      border-color: #FFB74D !important;
      
      .iconfont-sys {
        background-color: #FFE0B2 !important;
        color: #FF9800 !important;
      }
    }

    $icon-size: 52px;

    .iconfont-sys {
      position: absolute;
      top: 0;
      right: 20px;
      bottom: 0;
      width: $icon-size;
      height: $icon-size;
      margin: auto;
      overflow: hidden;
      font-size: 22px;
      line-height: $icon-size;
      color: var(--el-color-primary) !important;
      text-align: center;
      background-color: var(--el-color-primary-light-9);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .des {
      display: block;
      height: 14px;
      font-size: 14px;
      line-height: 14px;
    }
    .text-danger {
      color: #F56C6C; /* 红色表示高风险/负面 */
    }

    .text-warning {
      color: #E6A23C; /* 黄色表示中风险/警告 */
    }

    .text-success {
      color: #67C23A; /* 绿色表示低风险/正面 */
    }
    .text-success1 {
      color: #67C23A; /* 绿色表示低风险/正面 */
    }
    .text-info {
      color: #909399; /* 灰色表示默认或无数据 */
    }
    .number {
      display: block;
      margin-top: 10px;
      font-size: 28px;
      font-weight: 400;
      text-align: center; /* 水平居中 */
    }

    .change-box {
      display: flex;
      align-items: center;
      margin-top: 10px;


      .change-text {
        display: block;
        font-size: 13px;

        color: var(--art-text-gray-600);
      }

      .change {
        display: block; 
        position: relative; /* 关键！为绝对定位提供参照 */
        margin-left: 5px;
        font-size: 13px;
        right: -119px;
        bottom: -20px;
        font-weight: bold;
      }
    }
  }
}

.dark {
  .card-list {
    li {
      .iconfont-sys {
        background-color: #232323 !important;
      }
      
      &:hover {
        background-color: #5D4037 !important;
        border-color: #FFA726 !important;
        
        .iconfont-sys {
          background-color: #8D6E63 !important;
        }
      }
    }
  }
}

/* 风险预测容器样式 */
.risk-prediction-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .risk-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .risk-card {
      transition: all 0.3s ease;
      
      &.risk-warning {
        border-left: 4px solid var(--el-color-danger);
        background-color: var(--el-color-danger-light-9);
      }

      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .card-title {
          font-size: 16px;
          font-weight: bold;
          margin-right: 8px;
        }
      }

      .card-content {
        display: flex;
        flex-direction: column;
        gap: 15px;

        .el-input-number,
        .el-select,
        .el-switch {
          width: 100%;
        }

        .indicator {
          display: flex;
          align-items: center;
          .value {
            margin-left: 6px;
            font-weight: bold;
            color: var(--el-color-primary);
          }
        }

        .risk-indicator {
          display: flex;
          align-items: center;
          color: var(--el-color-danger);
          font-weight: bold;

          .risk-text {
            margin-left: 5px;
          }
        }
      }
    }
  }

  .result-card {
    margin-top: 20px;

    .result-header {
      border-bottom: 1px solid var(--el-border-color-light);
      padding-bottom: 15px;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        color: var(--el-color-primary);
      }
    }

    .result-content {
      .risk-details {
        margin-top: 20px;

        h4 {
          margin-bottom: 10px;
        }

        ul {
          padding-left: 20px;

          li {
            margin-bottom: 5px;
            color: var(--el-text-color-regular);
          }
        }
      }
    }
  }

  .analysis-button {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}

/* 弹窗自定义样式 */
:deep(.audit-prediction-dialog) {
  border-radius: 8px;
  
  .el-dialog__header {
    background-color: var(--el-color-primary-light-9);
    padding: 15px 20px;
    margin: 0;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .el-dialog__title {
      color: var(--el-text-color-primary);
      font-weight: bold;
    }
  }
  
  .el-dialog__body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .el-dialog__footer {
    border-top: 1px solid var(--el-border-color-light);
    padding: 15px 20px;
    text-align: right;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .card-list li,
  .risk-cards .risk-card {
    width: calc(50% - var(--console-margin)) !important;
  }
}

@media (max-width: 480px) {
  .card-list li,
  .risk-cards .risk-card {
    width: 100% !important;
  }
}
</style>