import { WeatherWidget } from '../weather/WeatherWidget'
import { CheckinBoard } from '../checkin/CheckinBoard'

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <WeatherWidget />
      <CheckinBoard />
    </div>
  )
}
