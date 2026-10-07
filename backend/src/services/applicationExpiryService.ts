import pool from '../config/db'

export const expireOverdueApplications = async (): Promise<number> => {
  const result = await pool.query(`
    UPDATE applicants a
    SET status = 'expired'
    FROM payments p
    WHERE p.app_id = a.app_id
      AND a.status = 'pending_payment'
      AND p.due_date <= NOW()
    RETURNING a.app_id
  `)

  return result.rowCount ?? 0
}

export const startApplicationExpiryJob = (): void => {
  const runExpiry = async () => {
    try {
      const expiredCount = await expireOverdueApplications()
      if (expiredCount > 0) {
        console.log(`Expired ${expiredCount} overdue unpaid application(s)`)
      }
    } catch (error) {
      console.error('Failed to expire overdue applications:', error)
    }
  }

  void runExpiry()
  const timer = setInterval(() => void runExpiry(), 60_000)
  timer.unref()
}
