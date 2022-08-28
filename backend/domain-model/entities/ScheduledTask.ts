import TaskSchedulingService from "../services/TaskSchedulingService"

abstract class ScheduledTask {
  constructor(private scheduling: TaskSchedulingService) { }
  
  schedule: string
  identifier: number
  enabled: boolean

  abstract execute(): void

  start(): void {
    if (this.enabled) return
    this.scheduling.schedule(this)
  }
  
  stop(): void {
    if (!this.enabled) return
    this.scheduling.unschedule(this.identifier)
  }
}

export default ScheduledTask