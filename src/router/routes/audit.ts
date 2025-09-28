// src/router/routes/audit.ts
import type { AppRouteRecordRaw } from '../utils/utils'
import AuditPrediction from '@/views/audit/AuditPrediction.vue'

const auditRoutes: AppRouteRecordRaw[] = [
  {
    path: '/audit-prediction',
    name: 'AuditPrediction',
    component: AuditPrediction,
    meta: { 
      title: '审计费用预测',
      requiresAuth: true // 如果需要认证可以添加此标记
    }
  }
]

export default auditRoutes