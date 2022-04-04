import {Component, EventEmitter, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute, Router} from '@angular/router';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {IBoard} from "../../services/task-manager-client/endpoints/board.endpoints";
import {IWorkSession} from "../../services/task-manager-client/endpoints/workedtime.endpoints";
import {ITask} from "../../services/task-manager-client/endpoints/task.endpoints";
import {TaskMangerClientApi} from "../../services/task-manager-client/task-manger-client.api";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  boards: IBoard[] = []

  boardEvent: EventEmitter<any> = new EventEmitter<any>();


  constructor(private api: TaskMangerClientApi, private readonly router: Router, public dialog: MatDialog) {
  }

  async drop(event: CdkDragDrop<ITask[]>, board: IBoard) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      await this.move(event.container.data[event.currentIndex]._id || '', board._id || '', event.currentIndex)
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      await this.move(event.container.data[event.currentIndex]._id || '', board._id || '', event.currentIndex) // todo
    }
  }

  move(taskId: string, boardId: string, index: number) {
    return this.api.board.modeTask(boardId, {
      taskId: taskId,
      toBoard: boardId,
      index: index
    })
  }

  async ngOnInit() {
    if (!AuthService.isAuth()) {
      await this.router.navigate(['/login']);
    }

    this.boardEvent.subscribe(() => {
      this.rerender()
    })

    await this.rerender();
  }

  async rerender() {
    this.boards = await this.api.board.getAll()
  }

  async createBoard(name: string) {
    await this.api.board.create({name: name});
    await this.rerender()
  }

  async getEmail() {
    await this.api.email.getEmail();
  }

  async setupEmail(time: string) {
    const h = Number.parseInt(time.split(":")[0])
    const m = Number.parseInt(time.split(":")[1])
    const date = new Date()
    date.setHours(h, m)
    await this.api.email.setupDailyEmail({date: date})
    this.dialogRef.close()
  }

  // @ts-ignore
  dialogRef: MatDialogRef<unknown, any>

  openDialog(template: any) {
    this.dialogRef = this.dialog.open(template);
    this.dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}