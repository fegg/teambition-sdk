'use strict'
import { Observable } from 'rxjs/Observable'
import {
  default as ReportFetch,
  GetReportAccomplishedOption,
  TaskType,
  GetReportInprogressOption,
  GetReportNotStartOption
} from '../fetchs/ReportFetch'
import ReportModel from '../models/ReportModel'
import { TaskData } from '../schemas/Task'
import { SubtaskData } from '../schemas/Subtask'
import { makeColdSignal, errorHandler } from './utils'

export class ReportAPI {
  constructor() {
    ReportModel.destructor()
  }

  getAccomplished (
    projectId: string,
    taskType: 'subtask',
    option: GetReportAccomplishedOption
  ): Observable<SubtaskData[]>

  getAccomplished (
    projectId: string,
    taskType: 'task',
    option: GetReportAccomplishedOption
  ): Observable<TaskData[]>

  getAccomplished (
    projectId: string,
    taskType: TaskType,
    option: GetReportAccomplishedOption
  ): Observable<TaskData[]> | Observable<SubtaskData[]>

  /**
   * 当 option.isWeekSearch 为 true 时不分页
   * 即使传入 page count 参数也会被忽略掉
   * 并且传入的 option.isWeekSearch 为 true 和 false 时返回的流也不一样
   */
  getAccomplished (
    projectId: string,
    taskType: TaskType,
    option: GetReportAccomplishedOption
  ): Observable<TaskData[]> | Observable<SubtaskData[]> {
    return makeColdSignal<any>(observer => {
      const cache = ReportModel.getData(projectId, option.page, 'accomplished', taskType, option.queryType, option.isWeekSearch)
      if (cache) {
        return cache
      }
      return Observable.fromPromise<any>(
        ReportFetch.getAccomplished(projectId, taskType, option)
      )
        .catch(err => errorHandler(observer, err))
        .concatMap(r => ReportModel.storeData(projectId, r, option.page, 'accomplished', taskType, option.queryType, option.isWeekSearch))
    })
  }

  getInprogress(
    projectId: string,
    taskType: 'task',
    option: GetReportInprogressOption
  ): Observable<TaskData[]>

  getInprogress(
    projectId: string,
    taskType: 'subtask',
    option: {
      queryType: 'all'
      page?: number
      count?: number
      [index: string]: any
    }
  ): Observable<SubtaskData[]>

  getInprogress(
    projectId: string,
    taskType: TaskType,
    option: GetReportInprogressOption
  ): Observable<TaskData[]> | Observable<SubtaskData[]>

  getInprogress(
    projectId: string,
    taskType: TaskType,
    option: GetReportInprogressOption
  ): Observable<TaskData[]> | Observable<SubtaskData[]> {
    return makeColdSignal<any>(observer => {
      const cache = ReportModel.getData(projectId, option.page, 'progress', taskType, option.queryType)
      if (cache) {
        return cache
      }
      return Observable.fromPromise<any>(
        ReportFetch.getInprogress(projectId, taskType, option)
      )
        .catch(err => errorHandler(observer, err))
        .concatMap(r => ReportModel.storeData(projectId, r, option.page, 'progress', taskType, option.queryType))
    })
  }

  getNotStart(
    projectId: string,
    option: GetReportNotStartOption
  ): Observable<TaskData[]> {
    return makeColdSignal<any>(observer => {
      const cache = ReportModel.getData(projectId, option.page, 'notstart', 'task')
      if (cache) {
        return cache
      }
      return Observable.fromPromise<any>(
        ReportFetch.getNotStart(projectId, option)
      )
        .catch(err => errorHandler(observer, err))
        .concatMap(r => ReportModel.storeData(projectId, r, option.page, 'notstart', 'task'))
    })
  }
}
