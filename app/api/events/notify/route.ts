export const dynamic = 'force-dynamic';

/**
 * GET /api/events/notify
 * 返回测试通知结果
 */
export async function GET() {
  return Response.json({ success: true, message: 'Notification sent (mock)' });
}
