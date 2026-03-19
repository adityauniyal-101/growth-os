'use client'
import { useGrowthStore } from '@/store/useGrowthStore'

export default function ResetModal() {
  const { showResetConfirm, setShowResetConfirm, reset } = useGrowthStore()
  if (!showResetConfirm) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <p>Upload new data? Your current insights and allocations will be cleared.</p>
        <div className="modal-buttons">
          <button className="btn btn-outline" onClick={() => setShowResetConfirm(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={reset}>Yes, upload new</button>
        </div>
      </div>
    </div>
  )
}
