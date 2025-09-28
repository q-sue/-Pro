<template>
  <div class="audit-prediction-container">
    <!-- 标题栏 -->
    <div class="header">
      <h2>审计费用预测模型</h2>
      <el-button type="primary" @click="calculate">计算预测值</el-button>
    </div>

    <!-- 输入卡片区域 -->
    <div class="prediction-cards">
      <!-- 企业数据资源程度 -->
      <el-card class="prediction-card">
        <div class="card-header">
          <span class="card-title">企业数据资源程度</span>
          <el-tooltip
            content="无形资产和存货中与企业数据资源相关的内容占总资产的比例"
            placement="top"
          >
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="card-content">
          <el-slider
            v-model="dataResourceRatio"
            :step="5"
            :min="0"
            :max="100"
            show-input
          />
          <div class="indicator">
            <span>当前值：</span>
            <span class="value">{{ dataResourceRatio }}%</span>
          </div>
        </div>
      </el-card>

      <!-- 事务所技术人员占比 -->
      <el-card class="prediction-card">
        <div class="card-header">
          <span class="card-title">事务所技术人员占比</span>
          <el-tooltip
            content="输入事务所的技术人员占总人数的占比"
            placement="top"
          >
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
        <div class="card-content">
          <el-input-number
            v-model="techStaffRatio"
            :min="0"
            :max="100"
            :step="5"
            controls-position="right"
          />
          <div class="indicator">
            <span>当前值：</span>
            <span class="value">{{ techStaffRatio }}%</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 预测结果卡片 -->
    <el-card class="result-card" v-if="showResult" ref="resultCard">
      <div class="result-header">
        <h3>审计费用预测结果</h3>
      </div>
      <div class="result-content">
        <div class="result-item">
          <span class="label">预测审计费用：</span>
          <span class="value">{{ predictedCost.toLocaleString() }} 元</span>
        </div>
        <div class="result-item">
          <span class="label">建议报价区间：</span>
          <span class="value">
            {{ (predictedCost * 0.9).toLocaleString() }} - {{ (predictedCost * 1.1).toLocaleString() }} 元
          </span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'

// 添加 emits 定义
const emit = defineEmits(['prediction-complete'])

// 输入值
const dataResourceRatio = ref(30)
const techStaffRatio = ref(40)

// 结果展示控制
const showResult = ref(false)
const predictedCost = ref(0)
const resultCard = ref<HTMLElement | null>(null)

// 点击计算
const calculate = () => {
  const baseCost = 50000

  // 计算两个因子对成本的影响
  const dataFactor = (dataResourceRatio.value / 100) * 0.5
  const techFactor = ((100 - techStaffRatio.value) / 100) * 0.3

  // 得出预测费用
  predictedCost.value = Math.round(baseCost * (1 + dataFactor + techFactor))
  showResult.value = true

  // 触发事件，传递格式化后的结果
  const resultText = ` ${predictedCost.value.toLocaleString()}元 `
  emit('prediction-complete', resultText)

  // 滚动至结果区域
  nextTick(() => {
    resultCard.value?.scrollIntoView({ behavior: 'smooth' })
  })
}
</script>

<style lang="scss" scoped>
.audit-prediction-container {
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

  .prediction-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .prediction-card {
      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .card-title {
          font-size: 18px;
          font-weight: bold;
          margin-right: 8px;
        }
      }

      .card-content {
        .el-slider,
        .el-input-number {
          width: 100%;
          margin-bottom: 15px;
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
      .result-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        .label {
          font-weight: bold;
          min-width: 150px;
        }

        .value {
          color: var(--el-color-primary);
          font-size: 18px;
        }
      }
    }
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .prediction-cards {
    grid-template-columns: 1fr !important;
  }
}
</style>
