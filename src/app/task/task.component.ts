import {Component, EventEmitter, Input, OnInit, TemplateRef} from '@angular/core';
import {ITask} from "../dashboard/dashboard.component";
import {ApiService} from "../../services/api.service";
import {MatDialog} from "@angular/material/dialog";
import {IModalData, TaskModalComponent} from "../task-modal/task-modal.component";

export interface FileInfoVm {
  length: number;

  chunkSize: number;

  filename: string;

  md5: string;

  contentType: string;
}


export interface IWorkSession {

  taskId: string;

  start: Date;

  end: Date;
}


@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnInit {
  enableEdit = false
  isWorkSessionStarted = false;

  @Input("task")
    // @ts-ignore
  task: ITask

  @Input("boardEvent")
    // @ts-ignore
  boardEvent: EventEmitter<any>


  files: { downloadLink: string, filename: string }[] = []

  constructor(private readonly api: ApiService, public dialog: MatDialog) {
  }

  async ngOnInit() {

  }


  openExtendedDialog() {
    const modalData: IModalData = {
      taskId: this.task._id || '',
      boardEvent: this.boardEvent,
    }
    this.dialog.open(TaskModalComponent, {
      width: '80%',
      height: '80%',
      data: modalData
    });
  }
}
