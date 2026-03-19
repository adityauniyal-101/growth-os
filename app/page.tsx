'use client'
import { useGrowthStore } from '@/store/useGrowthStore'
import Header from '@/components/layout/Header'
import ResetModal from '@/components/layout/ResetModal'
import UploadScreen from '@/components/upload/UploadScreen'
import Dashboard from '@/components/dashboard/Dashboard'
import Allocator from '@/components/allocator/Allocator'
import Forecast from '@/components/forecasting/Forecast'

export default function Home() {
  const { rows, metrics, tab } = useGrowthStore()

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px', width: '100%', flex: 1 }}>
        {!rows ? (
          <UploadScreen />
        ) : tab === 'dashboard' ? (
          <Dashboard />
        ) : tab === 'allocator' ? (
          <Allocator metrics={metrics} />
        ) : (
          <Forecast metrics={metrics} />
        )}
      </div>

      <div style={{ borderTop: '1px solid #E8E4DE', padding: '16px 32px', textAlign: 'center', color: '#8896AA', fontSize: 12 }}>
        Built with React · Statistical forecasting (weighted linear regression) · Claude API
      </div>

      <ResetModal />
    </div>
  )
}
