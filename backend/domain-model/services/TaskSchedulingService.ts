import ScheduledTask from "../entities/ScheduledTask";

interface TaskSchedulingService {
  getActiveSchedules(): ScheduledTask[]
  isScheduleActive(identifier: number): boolean
  schedule(task: ScheduledTask): void
  unschedule(identifier: number): void
}

export default TaskSchedulingService