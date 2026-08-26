import { WeatherWidget } from '../weather/WeatherWidget'
import { TideWidget } from '../weather/TideWidget'
import { CheckinBoard } from '../checkin/CheckinBoard'
import { CurrentStayCard } from '../schedule/CurrentStayCard'
import { HandoffNotesCard } from '../handoff/HandoffNotesCard'

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <CurrentStayCard />
      <WeatherWidget />
      <TideWidget />
      <HandoffNotesCard />
      <CheckinBoard />
    </div>
  )
}
