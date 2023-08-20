import { ScheduleTransactionStatus } from './types'
import type { ISchedulable, IScheduleTransaction } from './types'

export class Schedulable implements ISchedulable {
  protected _scheduled: boolean
  protected _run: () => void

  constructor(run: () => void) {
    this._scheduled = false
    this._run = run
  }

  public get scheduled(): boolean {
    return this._scheduled
  }

  public schedule(): void {
    if (this._scheduled) return
    this._scheduled = true
    this._run()
  }
}

export class SchedulableTransaction implements IScheduleTransaction {
  protected _status: ScheduleTransactionStatus
  protected _schedulables: ISchedulable[]

  constructor() {
    this._status = ScheduleTransactionStatus.NOT_STARTED
    this._schedulables = []
  }

  public get status(): ScheduleTransactionStatus {
    return this._status
  }

  public step(task: ISchedulable): void {
    if (task.scheduled) return
    if (this._status !== ScheduleTransactionStatus.STARTED) {
      console.warn('[Transaction] Failed to add task cause the transaction is not started yet.')
      task.schedule()
      return
    }

    this._status = ScheduleTransactionStatus.STARTED
    this._schedulables.push(task)
  }

  public start(): void {
    switch (this._status) {
      case ScheduleTransactionStatus.STARTED:
        console.warn('[Transaction] transaction must not be nested.')
        break
      case ScheduleTransactionStatus.NOT_STARTED:
      case ScheduleTransactionStatus.COMPLETED:
        this._status = ScheduleTransactionStatus.STARTED
        this._schedulables = []
        break
      /* c8 ignore start */
      default:
      /* c8 ignore end */
    }
  }

  public end(): void {
    if (this._status !== ScheduleTransactionStatus.STARTED) {
      console.warn('[Transaction] Failed to end cause the transaction is not started yet.')
      return
    }

    const schedulables = this._schedulables.slice()
    this._schedulables = []
    this._status = ScheduleTransactionStatus.COMPLETED
    schedulables.forEach(schedulable => schedulable.scheduled || schedulable.schedule())
  }
}
