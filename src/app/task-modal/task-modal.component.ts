import {Component, EventEmitter, Inject, OnInit, TemplateRef} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ITask} from "../dashboard/dashboard.component";
import {ApiService} from "../../services/api.service";
import {FileInfoVm, IWorkSession} from "../task/task.component";
import {TaskMangerApi} from "../../services/task-manger.api";

export interface IModalData {
  taskId: string
  boardEvent: EventEmitter<any>
}

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss']
})
export class TaskModalComponent implements OnInit {
  enableEdit = false
  isWorkSessionStarted = false;
  files: { downloadLink: string, filename: string }[] = []
  // @ts-ignore
  task: ITask

  constructor(public dialogRef: MatDialogRef<TaskModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: IModalData,
              private readonly api: ApiService,
              private readonly taskApi: TaskMangerApi) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  async getTask(id: string) {
    this.task = await this.api.get('task/' + id).toPromise();
    return this.task;
  }

  async ngOnInit() {
    await this.getTask(this.data.taskId || '')
    this.data.boardEvent.subscribe(async () => {
      this.task = await this.getTask(this.data.taskId || '')
    })

    for (const id of this.task?.fileIds || []) {
      const fileInfo = await this.getFileInfo(id);
      this.files.push({downloadLink: this.getFileDownloadLink(id), filename: fileInfo.filename})
    }
    this.isWorkSessionStarted = await this.getIsWorkSessionStarted()

    await this.getWorkedTime()
  }

  async startTask() {
    await this.api.post('workedtime/start', {start: new Date(), taskId: this.task._id}).toPromise()
    this.data.boardEvent.emit('')
    console.log(await this.getIsWorkSessionStarted())
    this.isWorkSessionStarted = await this.getIsWorkSessionStarted()
  }

  async getIsWorkSessionStarted() {
    const activeSessison = await this.api.get('workedtime/activeWorkSession/' + this.task._id).toPromise()
    return activeSessison?.length > 0
  }


  async endTask() {
    await this.api.post('workedtime/end/' + this.task._id, {
      end: new Date(),
      taskId: this.task._id
    }).toPromise()
    this.data.boardEvent.emit('')
    this.isWorkSessionStarted = await this.getIsWorkSessionStarted()
    this.getWorkedTime()
  }


  workedMinutes: { minutes: number, workSession: IWorkSession }[] = []
  allWorkedMinutes = 0;

  async getWorkedTime() {
    this.workedMinutes = []
    const workSessions: IWorkSession[] = await this.api.get('workedtime/task/' + this.task._id).toPromise()
    for (const workSession of workSessions) {
      const minutes = Math.abs(new Date(workSession.end).getTime() - new Date(workSession.start).getTime()) / (1000 * 60) % 60
      this.workedMinutes.push({
        minutes: minutes, workSession: workSession
      })
      this.allWorkedMinutes += minutes
      // console.log("worked minutes " + this.task.title, minutes)
    }
  }


  getFileDownloadLink(fileId: string) {
    return `${this.api.HOST}files/${fileId}`
  }

  async getFileInfo(fileId: string): Promise<FileInfoVm> {
    return await this.api.get(`files/${fileId}/info`).toPromise() as FileInfoVm
  }

  getRemainingTime(startDate: Date | any) {
    let result = {d: 0, h: 0, m: 0, negative: false}
    let dateFuture = new Date(startDate).getTime();
    let dateNow = new Date().getTime();

    if (dateFuture < dateNow) {
      const tmp = dateFuture
      dateFuture = dateNow
      dateNow = tmp
      result.negative = true
    }

    let seconds = Math.floor((dateFuture - (dateNow)) / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    hours = hours - (days * 24);
    minutes = minutes - (days * 24 * 60) - (hours * 60);
    seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
    result.d = days
    result.h = hours
    result.m = minutes
    return result
  }


  editMode() {
    this.enableEdit = true
  }

  async changeComplete() {

    if (!this.task) return

    await this.api.patch('task/' + this.task._id || "", {
      isCompleted: !this.task.isCompleted,
    }).toPromise()


    this.data.boardEvent.emit("completeTask")
  }

  async save(editFields: { title: string, description: string }) {
    await this.api.patch('task/' + this.task._id || "", {
      title: editFields.title,
      description: editFields.description
    }).toPromise()
    this.enableEdit = false
    this.data.boardEvent.emit("saveTask")
  }

  async delete() {
    await this.api.del('task/' + this.task._id || "").toPromise()
    this.data.boardEvent.emit("deleteTask")
  }

  dateToValue(date: any) {
    return new Date(date).toISOString()?.slice(0, 16)
  }


  tmpFiles: any

  handleFileInput(event: any) {
    this.tmpFiles = event.files
  }

  async saveTask(task: { description: string; title: string, startAt?: string, labels: string[], fileIds?: string[] }) {
    if (this.tmpFiles) {
      task.fileIds = await this.taskApi.uploadFile(this.tmpFiles)
    }
    task.fileIds?.push(...this.task.fileIds || [])
    if (task.startAt == "") task.startAt = undefined

    console.log("gggggggggggggggre", task)

    await this.api.patch('task/' + this.task._id || "", {
      title: task.title,
      description: task.description,
      startAt: task.startAt,
      labels: task.labels,
      fileIds: task.fileIds
    }).toPromise()
  }
}
