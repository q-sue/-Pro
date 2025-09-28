<template>
    <div class="risk-prediction-container">
      <!-- 标题栏 -->
      <div class="header">
        <h2>项目风险识别系统</h2>
        <el-button type="primary" @click="analyzeRisk">风险分析</el-button>
      </div>
  
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
  
        <!-- 其他风险指标卡片... -->
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
  
        <!-- 其他风险指标卡片... -->
      </div>
  
      <!-- 综合分析结果 -->
      <el-card class="result-card" v-if="showSummary">
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
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { QuestionFilled, Warning } from '@element-plus/icons-vue'
  
  // 风险指标数据
  const firmChangeCount = ref(0)
  const firmChangeRisk = ref(false)
  const turnoverRate = ref(0)
  const turnoverRisk = ref(false)
  const inquiryCount = ref(0)
  const inquiryRisk = ref(false)
  const hasTaxPenalty = ref(false)
  const taxPenaltyRisk = ref(false)
  // 其他风险指标...
  
  // 风险分析结果
  const showSummary = ref(false)
  const detectedRisks = ref<string[]>([])
const riskSummary = reactive({
  title: '',
  alertType: 'success' as 'success' | 'error' | 'warning' | 'info',  // 使用具体类型
  description: ''
})
  
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
  // 其他检查函数...
  
  // 综合分析风险
  const analyzeRisk = () => {
    detectedRisks.value = []
    
    if (firmChangeRisk.value) detectedRisks.value.push(`5年内更换事务所数量: ${firmChangeCount.value}次`)
    if (turnoverRisk.value) detectedRisks.value.push(`5年内管理层离职率: ${turnoverRate.value}%`)
    if (inquiryRisk.value) detectedRisks.value.push(`证监会问询函和警告函数量: ${inquiryCount.value}次`)
    if (taxPenaltyRisk.value) detectedRisks.value.push('曾被税务局处罚')
    // 其他风险检查...
  
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
  
    showSummary.value = true
  }
  </script>
  
  <style lang="scss" scoped>
  .risk-prediction-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
  
      h2 {
        margin: 0;
        color: var(--el-color-primary);
      }
    }
  
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
  }
  
  /* 响应式布局 */
  @media (max-width: 768px) {
    .risk-cards {
      grid-template-columns: 1fr !important;
    }
  }
  </style>